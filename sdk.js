
import os
import psycopg2
from uuid import uuid4
import pinecone
from tqdm.auto import tqdm
from langchain.document_loaders import UnstructuredURLLoader, TextLoader
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Pinecone
from langchain.llms import OpenAI
from langchain.chains.question_answering import load_qa_chain
from langchain.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA, RetrievalQAWithSourcesChain
from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_cors import CORS
from langchain.prompts import PromptTemplate  # Import voor custom prompts
from threading import Timer
from psycopg2 import OperationalError, InterfaceError
import requests
from bs4 import BeautifulSoup
import chardet
import re
from langchain.text_splitter import RecursiveCharacterTextSplitter
import tempfile
from werkzeug.utils import secure_filename
from datetime import datetime
import time


from psycopg2 import pool
import os
from uuid import uuid4
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from datetime import datetime


# API-sleutels en instellingen
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
PINECONE_API_KEY = os.environ.get('PINECONE_API_KEY')
PINECONE_API_ENV = os.environ.get('PINECONE_API_ENV')



# Database configuratie
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")

# Connection Pool instellen
conn_pool = psycopg2.pool.SimpleConnectionPool(
    minconn=1,
    maxconn=20,
    dbname=DB_NAME,
    user=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT
)


# Constante voor karakterlimietl
CHARACTER_LIMIT = 10000000  # Stel de limiet in op 10.000.000 karakter

def get_conn():
    return conn_pool.getconn()

def release_conn(conn):
    return conn_pool.putconn(conn)

# Functie om de database te initialiseren
def initialize_db():
    conn = get_conn()
    cur = conn.cursor()

    # Creëer de character_counter tabel als deze nog niet bestaat
    cur.execute("""
    CREATE TABLE IF NOT EXISTS character_counter (
        id SERIAL PRIMARY KEY,
        num_characters INT DEFAULT 0
    );
    """)

    # Creëer de chat_history tabel als deze nog niet bestaat
    cur.execute("""
    CREATE TABLE IF NOT EXISTS chat_history (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        question TEXT,
        answer TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        month_year TEXT
    );
    """)

    # Creëer de api_calls tabel als deze nog niet bestaat
    cur.execute("""
    CREATE TABLE IF NOT EXISTS api_calls (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        month TEXT,
        num_calls INT
    );
    """)

    conn.commit()
    cur.close()
    release_conn(conn)

# Roep de functie aan bij het starten van de applicatie
initialize_db()

# Functie om de karakterteller bij te werken
def update_counter(num_characters):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("UPDATE character_counter SET num_characters = num_characters + %s WHERE id = 1;", (num_characters,))

    conn.commit()
    cur.close()
    release_conn(conn)

# Functie om te controleren of de karakterlimiet is bereikt
def check_limit():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT num_characters FROM character_counter WHERE id = 1;")
    total_characters = cur.fetchone()[0]

    cur.close()
    release_conn(conn)

    if total_characters is None:
        return False
    return total_characters >= CHARACTER_LIMIT

# Definieer functies om met de database te werken
def insert_chat(user_id, question, answer):
    conn = get_conn()
    cur = conn.cursor()

    try:
        cur.execute(
            "INSERT INTO chat_history (user_id, question, answer) VALUES (%s, %s, %s)",
            (user_id, question, answer)
        )
        conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(f"Database Error: {error}")
    finally:
        cur.close()
        release_conn(conn)

def count_questions_for_month(month_year):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        "SELECT COUNT(*) FROM chat_history WHERE month_year = %s",
        (month_year,)
    )
    result = cur.fetchone()[0]

    cur.close()
    release_conn(conn)
    return result

def fetch_chats():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT * FROM chat_history")
    results = cur.fetchall()

    cur.close()
    release_conn(conn)
    return results

def count_questions():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM chat_history")
    result = cur.fetchone()[0]

    cur.close()
    release_conn(conn)
    return result


custom_prompt_template = """
Je bent een chatbot van Chatproducties. Je doel is om nauwkeurige en informatieve antwoorden te geven op de vragen die aan je worden gesteld. Maak gebruik van de informatie die je hieronder wordt verstrekt om je antwoorden te vormen. Het is belangrijk dat je niets verzint; beantwoord de vragen zo accuraat mogelijk op basis van de gegeven informatie. Daarnaast dien je altijd vriendelijk en klantgericht te zijn.

VRAAG: {question}
{summaries}
"""
custom_prompt = PromptTemplate(
    template=custom_prompt_template,
    input_variables=["summaries", "question"],
)


# API-sleutels en instellingen
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
PINECONE_API_KEY = os.environ.get('PINECONE_API_KEY')
PINECONE_API_ENV = os.environ.get('PINECONE_API_ENV')


# Pinecone initialiseren
index_name = 'chatter'
pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_API_ENV)

if index_name not in pinecone.list_indexes():
    pinecone.create_index(name=index_name, metric='cosine', dimension=1536)  # Aangenomen dimensie

embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)


# Initialiseer de embed. Voeg eventuele benodigde argumenten toe.
embed = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)


index = pinecone.Index(index_name)


urls = []  # Vul hier je URLs in...
loader = UnstructuredURLLoader(urls=urls)

data = loader.load()


namespace = 'chatbo'  # Voeg je eigen namespace-naam toe

# Data uploaden naar Pinecone
batch_limit = 100
texts = []
metadatas = []

for i, record in enumerate(tqdm(data)):  # data moet je zelf definiëren
    metadata = {'wiki-id': str(record['id']), 'source': record['url'], 'title': record['title']}
    record_texts = text_splitter.split_text(record['text'])  # text_splitter moet je zelf definiëren
    record_metadatas = [{"chunk": j, "text": text, **metadata} for j, text in enumerate(record_texts)]
    texts.extend(record_texts)
    metadatas.extend(record_metadatas)

    if len(texts) >= batch_limit:
        ids = [str(uuid4()) for _ in range(len(texts))]
        embeds = embed.embed_documents(texts)  # embed moet je zelf definiëren
        try:
            index.upsert(vectors=zip(ids, embeds), namespace=namespace)  # Upsert met de gespecificeerde namespace
            print(f"{len(ids)} records geüpload naar namespace: {namespace}")
        except Exception as e:
            print(f"Upsert mislukt: {e}")

if len(texts) > 0:
    ids = [str(uuid4()) for _ in range(len(texts))]
    embeds = embed.embed_documents(texts)
    try:
        index.upsert(vectors=zip(ids, embeds), namespace=namespace)  # Upsert met de gespecificeerde namespace
        print(f"{len(ids)} records geüpload naar namespace: {namespace}")
    except Exception as e:
        print(f"Upsert mislukt: {e}")



# Voeg hier je eigen code toe voor langchain en OpenAI GPT-3.5 Turbo
# Bijvoorbeeld:
vectorstore = Pinecone(index, embed.embed_query, "text")  # Pinecone en embed moeten je zelf definiëren

llm = ChatOpenAI(openai_api_key=OPENAI_API_KEY, model_name='gpt-3.5-turbo', temperature=0.5)

qa_with_sources = RetrievalQAWithSourcesChain.from_chain_type(
    llm=llm, 
    chain_type="stuff", 
    retriever=vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={'k': 5, 'lambda_mult': 0.25},
        namespace=namespace  # Let op de komma aan het einde van de vorige regel
    ),
    chain_type_kwargs={
        "prompt": custom_prompt,
    }
)

def handle_console_input():
    def inactivity_timeout():
        print("Inactiviteit gedetecteerd. De chat wordt afgesloten.")
        # Hier kun je de opgeslagen chatgeschiedenis opslaan in de database
        save_to_database()
        exit(0)  # Sluit de applicatie af

    def reset_timer(timer):
        timer.cancel()
        return Timer(300, inactivity_timeout)  # Stel de timer in op 5 minuten

    def save_to_database():
        # Hier kun je de opgeslagen chatgeschiedenis opslaan in de database
        pass

    user_id = str(uuid4())  # Genereer een unieke user_id voor de huidige chat
    inactivity_timer = Timer(300, inactivity_timeout)  # 5 minuten timer voor inactiviteit
    inactivity_timer.start()

    while True:
        query = input("Stel uw vraag (of typ 'stop' om te stoppen): ")

        # Reset de inactiviteitstimer
        inactivity_timer = reset_timer(inactivity_timer)
        inactivity_timer.start()

        if query.lower() == 'stop':
            print("De sessie is gestopt.")
            save_to_database()  # Sla de chatgeschiedenis op in de database
            break

        # Voer de vraag door aan het model en haal het antwoord op
        qa_with_sources_result = qa_with_sources(query)
        answer = qa_with_sources_result['answer']  # Haal alleen het antwoord

        # Sla de vraag en het antwoord op in de database
        insert_chat(user_id, query, answer)

        print("QA with Sources Result:")
        print(answer)  # Print alleen het antwoord

        # Als er bronnen zijn, print ze dan onder het antwoord
        if qa_with_sources_result['sources']:
            print("Sources:")
            print(qa_with_sources_result['sources'])

app = Flask(__name__)
CORS(app)  # Hiermee kan je frontend communiceren met deze backend

@app.route('/ask', methods=['POST'])
def ask():
    conn = get_conn()  # Haal een verbinding uit de pool
    cur = conn.cursor()

    user_id = str(uuid4())  # Genereer een unieke user_id
    request_data = request.get_json()
    question = request_data.get('question', '')

    # Bepaal de huidige maand en het jaar
    now = datetime.now()
    month_year = now.strftime("%Y-%m")

    # Controleer of de algemene limiet is bereikt
    if count_questions_for_month(month_year) >= 500:
        cur.close()  # Sluit de cursor
        release_conn(conn)  # Geef de verbinding terug aan de pool
        return jsonify({"error": "Maandelijkse limiet van 500 vragen is bereikt voor de hele chatbot"})

    # Gebruik je bestaande logica om een antwoord te krijgen
    qa_with_sources_result = qa_with_sources(question)
    answer = qa_with_sources_result.get('answer', 'Sorry, ik kan deze vraag niet beantwoorden.')
    sources = qa_with_sources_result.get('sources', [])

    # Sla de vraag en het antwoord op in de database
    insert_chat(user_id, question, answer)

    cur.execute(
        "UPDATE chat_history SET month_year = %s WHERE user_id = %s AND question = %s",
        (month_year, user_id, question)
    )
    conn.commit()

    # Sluit de cursor en verbinding
    cur.close()
    release_conn(conn)  # Geef de verbinding terug aan de pool

    response_data = {
        'answer': answer,
        'sources': sources
    }
    return jsonify(response_data)
    
    
@app.route('/')
def home():
    chats = fetch_chats()
    reversed_chats = list(reversed(chats))
    num_questions = count_questions()
    return render_template('index.html', chats=reversed_chats, num_questions=num_questions)

@app.route('/get_character_count', methods=['GET'])
def get_character_count():
    conn = get_conn()  # Haal een verbinding uit de pool
    cur = conn.cursor()
    cur.execute("SELECT SUM(num_characters) FROM character_counter;")
    total_characters = cur.fetchone()[0]
    cur.close()
    release_conn(conn)  # Geef de verbinding terug aan de pool
    if total_characters is None:
        total_characters = 0
    return jsonify({'totalCharacters': total_characters})

@app.route('/data')
def index():
    return render_template('data.html')  # Zorg ervoor dat je een index.html hebt in een "templates" map


# Flask Route voor het uitvoeren van Web Scraping
@app.route('/scrape', methods=['POST'])
def scrape():
    # Controleer eerst of de karakterlimiet is bereikt
    if check_limit():
        return jsonify({'error': 'Karakterlimiet bereikt'}), 403

    url_to_scrape = request.form['websiteUrl']
    
    # Houd een teller bij voor het aantal gescrapede tekens
    num_characters_scraped = 0

    def clean_filename(filename):
        return re.sub('[^a-zA-Z0-9 \n\.]', '_', filename)
    
    def download_page(url, folder):
        try:
            r = requests.get(url)
            if r.status_code == 200:
                soup = BeautifulSoup(r.text, 'html.parser')
                page_title = soup.title.string if soup.title else "Untitled"
                page_title = clean_filename(page_title)
                with open(os.path.join(folder, f"{page_title}.html"), "w", encoding="utf-8") as f:
                    f.write(r.text)
        except Exception as e:
            print(f"Error while processing URL {url}: {e}")

    with tempfile.TemporaryDirectory() as folder:
        download_page(url_to_scrape, folder)
        r = requests.get(url_to_scrape)
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, 'html.parser')
            for link in soup.find_all('a'):
                url = link.get('href')
                if url and url.startswith('http'):
                    download_page(url, folder)

        all_texts = ""
        for root, dirs, files in os.walk(folder, topdown=False):
            for filename in files:
                file_path = os.path.join(root, filename)
                if os.path.isfile(file_path):
                    try:
                        with open(file_path, 'rb') as file:
                            raw_data = file.read()
                        encoding = chardet.detect(raw_data)['encoding']
                        with open(file_path, 'r', encoding=encoding) as file:
                            file_content = file.read()
                        soup = BeautifulSoup(file_content, features="lxml")
                        for tag in soup(['script', 'style', 'meta', 'link', 'head', 'footer', 'nav', 'form']):
                            tag.extract()
                        body = soup.body if soup and soup.body else ''
                        text_content = ' '.join(body.stripped_strings) if body else ''
                        if text_content:
                            all_texts += f"Source: {file_path}\n{text_content}\n\n"
                            num_characters_scraped += len(text_content)
                        os.remove(file_path)
                    except Exception as e:
                        print(f"Error processing file {file_path}: {e}")

              # ... (voorafgaande code voor scraping en opslaan van teksten in een tijdelijk bestand)

        with tempfile.NamedTemporaryFile(delete=False, suffix='.txt', mode='w+', encoding='utf-8') as temp_file:
            temp_file.write(all_texts)
            temp_file_path = temp_file.name
            print(f"Texts are saved in temporary file: {temp_file_path}")

        # Initialize Pinecone en OpenAI Embeddings
        pinecone.init(api_key=os.getenv("PINECONE_API_KEY"), environment=os.getenv("PINECONE_API_ENV"))
        embeddings_model = OpenAIEmbeddings(api_key=os.getenv("OPENAI_API_KEY"))

        # Laad tekstbestand en splits het in stukken
        loader = TextLoader(temp_file_path)  # Gebruik het pad van het tijdelijke bestand
        documents = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        docs = text_splitter.split_documents(documents)

        # Inspecteer de attributen van een Document-object
        if docs:
            print("Beschikbare attributen in Document-object:", dir(docs[0]))

        # Neem aan dat het attribuut 'page_content' beschikbaar is, de rest van de code zou er zo uitzien
        chunks = [doc.page_content for doc in docs if hasattr(doc, 'page_content')]  # gebruik van hasattr om te controleren op het attribuut 'page_content'

        # Bereken het aantal tokens in elk stuk en druk het af
        token_counts = [len(chunk.split()) for chunk in chunks]
        print("Aantal tokens in elk stuk:", token_counts)

        # Voeg bronmetadata toe en maak een Pinecone-vectoropslag
        metadatas = [{"source": str(i)} for i in range(len(chunks))]
        pinecone_vectorstore = Pinecone.from_texts(
            chunks,
            embeddings_model,
            index_name="chatter",
            metadatas=metadatas,
            namespace=namespace
        )

    update_counter(num_characters_scraped)

    return jsonify({'numCharacters': num_characters_scraped})
    
@app.route('/scrape_single_page', methods=['POST'])
def scrape_single_page():
    # Controleer eerst of de karakterlimiet is bereikt
    if check_limit():
        return jsonify({'error': 'Karakterlimiet bereikt'}), 403

    url_to_scrape = request.form['singleWebsiteUrl']
    num_characters_scraped = 0  # Teller voor het aantal gescrapede tekens

    def download_and_clean_page(url, folder):
        try:
            r = requests.get(url)
            if r.status_code == 200:
                soup = BeautifulSoup(r.text, 'html.parser')
                for tag in soup(['script', 'style', 'meta', 'link', 'head', 'nav', 'navbar']):
                    tag.extract()
                body = soup.body if soup and soup.body else ''
                text_content = ' '.join(body.stripped_strings) if body else ''
                if text_content:
                    with open(os.path.join(folder, "single_page.txt"), "w", encoding="utf-8") as f:
                        f.write(text_content)
                    return len(text_content)
        except Exception as e:
            print(f"Error while processing URL {url}: {e}")
            return 0

    with tempfile.TemporaryDirectory() as folder:
        num_characters_scraped = download_and_clean_page(url_to_scrape, folder)

        if num_characters_scraped > 0:
            temp_file_path = os.path.join(folder, "single_page.txt")

            # Initialize Pinecone en OpenAI Embeddings
            pinecone.init(api_key=os.getenv("PINECONE_API_KEY"), environment=os.getenv("PINECONE_API_ENV"))
            embeddings_model = OpenAIEmbeddings(api_key=os.getenv("OPENAI_API_KEY"))

            # Laad tekstbestand en splits het in stukken
            loader = TextLoader(temp_file_path)
            documents = loader.load()
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            docs = text_splitter.split_documents(documents)

            # Sla de chunks op in Pinecone
            chunks = [doc.page_content for doc in docs if hasattr(doc, 'page_content')]
            metadatas = [{"source": str(i)} for i in range(len(chunks))]
            pinecone_vectorstore = Pinecone.from_texts(
                chunks,
                embeddings_model,
                index_name="chatter",
                metadatas=metadatas,
                namespace=namespace
            )
    update_counter(num_characters_scraped)

    return jsonify({'numCharacters': num_characters_scraped})

ALLOWED_EXTENSIONS = {'txt'}  # You can add more extensions if needed

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/process_file', methods=['POST'])
def process_file():
    # Controleer eerst of de karakterlimiet is bereikt
    if check_limit():
        return jsonify({'error': 'Karakterlimiet bereikt'}), 403

    if 'file' not in request.files:
        return jsonify({'error': 'Geen bestand ontvangen'})
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Geen bestandsnaam opgegeven'})
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)

        with tempfile.TemporaryDirectory() as folder:
            filepath = os.path.join(folder, filename)
            file.save(filepath)

            # Initialize Pinecone en OpenAI Embeddings
            pinecone.init(api_key=os.getenv("PINECONE_API_KEY"), environment=os.getenv("PINECONE_API_ENV"))
            embeddings_model = OpenAIEmbeddings(api_key=os.getenv("OPENAI_API_KEY"))

            # Laad het opgeslagen tekstbestand en splits het in stukken
            loader = TextLoader(filepath)
            documents = loader.load()
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            docs = text_splitter.split_documents(documents)

            # Sla de chunks op in Pinecone
            chunks = [doc.page_content for doc in docs if hasattr(doc, 'page_content')]
            metadatas = [{"source": str(i)} for i in range(len(chunks))]
            pinecone_vectorstore = Pinecone.from_texts(
                chunks,
                embeddings_model,
                index_name="chatter",
                metadatas=metadatas,
                namespace=namespace
            )

            num_characters_processed = sum([len(chunk) for chunk in chunks])  # Je zou dit al moeten hebben
            update_counter(num_characters_processed)
            # Bereken het totale aantal karakters in alle chunks
            num_characters_processed = sum([len(chunk) for chunk in chunks])

            return jsonify({'numCharacters': num_characters_processed})
        
if __name__ == '__main__':
    app.run(debug=True)
















SDK SCRIPT

document.addEventListener("DOMContentLoaded", function() {
    (function() {
        // Definieer een variabele voor de backend URL
        const backendUrl = "https://chatbot-d7nw.onrender.com";
    // CSS toevoegen
    var css = `
    <style>
            body {
            font-family: 'Arial', sans-serif;
            background-color: #ffffff;
        }
   #chatbot {
            position: fixed;
            bottom: 100px;
            right: 30px;
            width: 420px;
            height: 640px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease-in-out;
            display: none;
            flex-direction: column;
            opacity: 0;
            transform: translateY(30px);  /* Chatbot begint 30 pixels onder de eindpositie */
            transition: opacity 0.5s ease-out, transform 0.5s ease-out;  /* 0.5 seconden animatie */
            z-index: 10000;
        }
            
              
              
          #chatbot-icon {
            position: fixed;
            bottom: 20px;
            right: 30px;
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: radial-gradient(circle at center, #007BFF, #1a2e4a); /* Metallic blauw naar donkerblauw */
            box-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #007BFF, 0 0 40px #007BFF, 0 0 55px #007BFF, 0 0 75px #007BFF; /* Glimmend effect */
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.3s ease-in-out, background 0.3s ease-in-out;
            z-index: 9996;
        }


        


        #chatbot.visible {
            opacity: 1;
            transform: translateY(0);
        }

        
        #chatbot-icon:hover {
            transform: scale(1.1);
        }
        
        #chatbot-icon::before, 
        #chatbot-icon::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 20%;
            width: 60%;
            height: 3px;
            background: transparent;
            transition: background 0.3s, transform 0.3s;
        }
        
        #chatbot-icon.open::before, 
        #chatbot-icon.open::after {
            background: white;
        }
        
        #chatbot-icon::before {
            transform: rotate(45deg);
        }
        
        #chatbot-icon::after {
            transform: rotate(-45deg);
        }
        
        #chatbot-icon span {
            font-size: 40px;
            transition: opacity 0.3s ease-in-out;
        }
        
        #chatbot-icon.open span {
            opacity: 0;
        }
        
       #chatbot header {
            background: linear-gradient(135deg, #ffffff, #9c88ff);
            color: #333;
            padding: 15px 25px;
            text-align: left;
            font-weight: 600;
            font-size: 1.3em;
            display: flex;
            align-items: center;
            border-bottom: 1px solid #ddd;
        }
        
        #chatbot header img {
            width: 24px;
            height: 24px;
            margin-right: 10px;
        }
        
        #chatbot-content {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            background-color: #ffffff;
            color: #333;
        }
        
        #chatbot-input {
            padding: 15px 20px;
            display: flex;
            align-items: center;
            border-top: 1px solid rgba(140, 119, 219, 0.1);
            background-color: #ffffff;
        }
        
        #chatbot-input textarea {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #8c77db;
            border-radius: 30px;
            outline: none;
            color: #333;
            margin-right: 10px;
            resize: none;
            min-height: 20px;
            overflow: auto;
         }
        
        #chatbot-input button {
            background: #8c77db;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1em;
        }
        .user-message, .bot-message {
            margin: 10px 0;
            padding: 12px 18px;
            border-radius: 20px;
            max-width: 80%;
            transition: all 0.3s ease-in-out;
            word-wrap: break-word;  /* Voeg deze regel toe */
        }

        #chatbot-input .send-icon {
            width: 35px;
            height: 35px;
            background-image: url('https://github.com/chatgptpython/embed/blob/main/send_5836606.png?raw=true');
            background-size: cover;
            cursor: pointer;
            background-color: transparent;
            border: none;
       }
        
        .user-message {
            align-self: flex-end;
            background-color: #f0f0f0;
            color: #333;
        }
        
        .bot-message {
            align-self: flex-start;
            background-color: rgba(140, 119, 219, 0.1);
            color: #333;
        }
        
         .typing-dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            background-color: #333;
            border-radius: 50%;
            animation: typing 1.5s infinite;
            margin: 0 2px;
        }

            @keyframes typing {
        0% {
            opacity: 0.3;
        }
        50% {
            opacity: 1;
        }
        100% {
            opacity: 0.3;
        }
    }


        
        .message-sender {
            font-size: 0.9em;
            color: #888;
            margin-bottom: 5px;
        }

#close-chat {
    cursor: pointer;
    font-size: 36px;  /* Vergroot de font-grootte */
    margin-left: auto;
    padding: 10px;  /* Vergroot de padding */
    border-radius: 16px;  /* Hogere border-radius */
    background-color: #8c77db;  /* Oorspronkelijke paarse kleur */
    color: white;
    transition: background-color 0.3s ease, transform 0.3s ease;  /* Voeg een transform transitie toe */
    box-shadow: 0 3px 6px rgba(0,0,0,0.2);  /* Voeg een lichte schaduw toe voor diepte */
}

        
        #close-chat:hover {
    background-color: #7b6cc8;  /* Donkerdere paarse kleur bij hover */
    transform: scale(1.1);  /* Laat het kruisje nog groter worden bij hover */
    box-shadow: 0 5px 10px rgba(0,0,0,0.3);  /* Donkerdere schaduw bij hover */
}
                @media (max-width: 768px) {
    #chatbot {
        width: 100%;
        height: 80vh;
        bottom: 5vh;  /* 10vh vanaf de onderkant om de chatbot meer naar het midden te verplaatsen */
        right: 0;
        border-radius: 0;
        top: auto;
        transform: translateY(0);
        z-index: 9999;
    }

    #chatbot-icon.open {
        top: 10px;
        right: 10px;
        bottom: auto;
        z-index: 10000;
    }

}
         
@media (min-width: 769px) {
    #chatbot-icon {
        width: 85px;  /* Vergroot de breedte */
        height: 85px;  /* Vergroot de hoogte */
    }
    #chatbot-icon span {
        font-size: 52px;  /* Vergroot de font-grootte van het icoon */
    }
    #chatbot {
        bottom: 125px;  /* Verplaats de chatbot een beetje meer naar boven */
    }

    @media (min-width: 769px) {
    #chatbot {
        width: 480px;  /* Vergroot de breedte */
        height: 720px;  /* Vergroot de hoogte */
    }
    
    #chatbot header {
        font-size: 1.5em;  /* Vergroot de tekstgrootte in de header */
    }
    
    .user-message, .bot-message {
        font-size: 1.1em;  /* Vergroot de tekstgrootte in de berichten */
    }
    
    #chatbot-input textarea {
        font-size: 1.1em;  /* Vergroot de tekstgrootte in het invoerveld */
    }
}

}


    </style>
    `;
    var style = document.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
    document.head.appendChild(style);

    // HTML toevoegen
    var html = `
        <div id="chatbot">
            <header>
                Chatproducties - Proddy 🤖
                <span id="close-chat" onclick="closeChat()">×</span>
            </header>
            <div id="chatbot-content"></div>
            <div id="chatbot-input">
                <textarea id="user-input" rows="1" placeholder="Typ je vraag hier..."></textarea>
                <button onclick="sendMessage()" class="send-icon"></button>
            </div>
        </div>
        <div id="chatbot-icon" onclick="toggleChat()">
            <span>💬</span>
        </div>
    `;
    var div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div);

    // JavaScript toevoegen
        let firstTimeOpen = true;  // Nieuwe variabele om bij te houden of de chatbot voor de eerste keer wordt geopend
        let isBotTyping = false;

        // Nieuwe functie om welkomstbericht te typen
        window.typeWelcomeMessage = function() {
            const chatContent = document.getElementById("chatbot-content");
            chatContent.innerHTML += `<div class="message-sender">Chatbot:</div>`;
            let messageText = "Welkom bij Chatproducties! 👋 Ik ben Proddy, je AI-assistent. Voel je vrij om me alle vragen te stellen over Chatproducties. Waarmee kan ik je vandaag helpen?";
            let messageElem = document.createElement("div");
            messageElem.className = "bot-message";
            chatContent.appendChild(messageElem);

            let index = 0;
            let typingInterval = setInterval(() => {
                if (index < messageText.length) {
                    messageElem.textContent += messageText[index];
                    index++;
                    chatContent.scrollTop = chatContent.scrollHeight;
                } else {
                    clearInterval(typingInterval);
                }
            }, 50);
        };


window.toggleChat = function() {
    const chatbot = document.getElementById("chatbot");
    const icon = document.getElementById("chatbot-icon");

    if (chatbot.style.display === "none" || chatbot.style.display === "") {
        chatbot.style.display = "flex";
        setTimeout(function() {
            chatbot.classList.add("visible");
        }, 50); 
        if (firstTimeOpen) {
            typeWelcomeMessage();  // Roep de nieuwe functie aan
            firstTimeOpen = false;
        }
    } else {
        chatbot.classList.remove("visible");
        setTimeout(function() {
            chatbot.style.display = "none";
        }, 500);
        icon.classList.remove('open');
    }
};

// Nieuwe functie om de chat te sluiten
window.closeChat = function() {
    const chatbot = document.getElementById("chatbot");
    const icon = document.getElementById("chatbot-icon");

    chatbot.style.display = "none";
    icon.classList.remove('open');
};
     

        window.handleKeyUp = function(event) {
            if (event.key === "Enter" && !isBotTyping) {
                sendMessage();
            }
        };

    window.handleKeyUp = function(event) {
        if (event.key === "Enter" && !isBotTyping) {
            sendMessage();
        }
    };

    window.toggleInputState = function(state) {
        const userInput = document.getElementById("user-input");
        const sendButton = document.querySelector("#chatbot-input button");
        if (state === "disable") {
            userInput.disabled = true;
            sendButton.disabled = true;
        } else {
            userInput.disabled = false;
            sendButton.disabled = false;
        }
    };

    window.sendMessage = function() {
        if (isBotTyping) return;

        const userInput = document.getElementById("user-input");
        const chatContent = document.getElementById("chatbot-content");

        if (userInput.value.trim() !== "") {
            isBotTyping = true;
            toggleInputState("disable");
            chatContent.innerHTML += `<div class="message-sender">U:</div><div class="user-message">${userInput.value}</div>`;
            chatContent.innerHTML += `<div class="bot-message"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>`;

            setTimeout(() => {
                fetch(`${backendUrl}/ask`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ question: userInput.value })
                })
                .then(response => response.json())
                .then(data => {
                    chatContent.lastChild.remove();
                    chatContent.innerHTML += `<div class="message-sender">Chatbot:</div>`;
                    let messageText = data.answer;
                    let messageElem = document.createElement("div");
                    messageElem.className = "bot-message";
                    chatContent.appendChild(messageElem);

                    let index = 0;
                    let typingInterval = setInterval(() => {
                        if (index < messageText.length) {
                            messageElem.textContent += messageText[index];
                            index++;
                            chatContent.scrollTop = chatContent.scrollHeight;
                        } else {
                            clearInterval(typingInterval);
                            toggleInputState("enable");
                            isBotTyping = false;
                        }
                    }, 50);

                    userInput.value = "";
                })
                .catch(error => {
                    console.error("Error:", error);
                    chatContent.innerHTML += `<div class="message-sender">Chatbot:</div><div class="bot-message">Sorry, er is een fout opgetreden.</div>`;
                    toggleInputState("enable");
                    isBotTyping = false;
                });
            }, 500);
        }
    };

    // De input-elementen activeren voor event-handling
    document.getElementById("user-input").onkeyup = function(event) {
        handleKeyUp(event);
    };

if(window.innerWidth > 768) {
    setTimeout(function() {
        toggleChat();
    }, 3000);  
}

})();  // Deze lijn sluit de IIFE correct af
});  
