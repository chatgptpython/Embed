document.addEventListener("DOMContentLoaded", function() {
    // Dynamisch toevoegen van de viewport meta tag
    var metaTag = document.createElement('meta');
    metaTag.name = "viewport";
    metaTag.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    document.getElementsByTagName('head')[0].appendChild(metaTag);

    (function() {
        // Definieer een variabele voor de backend URL
        const backendUrl = "https://chatbot-1k97.onrender.com";
        
    var css = `
    <style>
            body {
            font-family: 'Arial', sans-serif;
            background-color: #ffffff;
        }

        

                #chatbot-icon {
            width: 70px !important;
            height: 70px !important;
        }
        
   #chatbot {
            position: fixed;
            bottom: 95px !important;
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
            transition: opacity 0.5s ease-out, transform 0.5s ease-out;  /* 0.5 seconden animatie */
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) translateY(30px);
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
            white-space: pre-wrap;  /* Nieuwe regel */
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

                /* Iconen voor chatbot en gebruiker */
        .bot-message::before {
            content: '🤖';
            margin-right: 10px;
        }
        
        .user-message::before {
            content: '👤';
            margin-right: 10px;
            float: right;
        }
        
        /* Om de tekst en het icoon naast elkaar te zetten */
        .bot-message, .user-message {
            display: flex;
            align-items: center;
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
        height: 100%;
        bottom: 0;
        right: 0;
        border-radius: 0;
        top: 0;
        transform: translateY(0);
        z-index: 9999;
    }

    #chatbot-icon.open {
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 10000;
    }

    #close-chat {
        display: block;  /* Toon het bovenste sluitknopje op mobiele apparaten */
    }
}
#chatbot-icon.cross::before,
#chatbot-icon.cross::after {
    background: white;
}

#chatbot-icon.cross::before {
    transform: rotate(45deg);
}

#chatbot-icon.cross::after {
    transform: rotate(-45deg);
}

#chatbot-icon.cross span {
    opacity: 0;
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
                <span id="chatbot-title">
                    <span role="img" aria-label="bot">🤖</span> 
                    Chatproducties - Proddy
                </span>
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

 window.typeWelcomeMessage = async function() {
    const chatContent = document.getElementById("chatbot-content");
    chatContent.innerHTML += `<div class="message-sender">Chatbot:</div>`;
    let messageElem = document.createElement("div");
    messageElem.className = "bot-message";
    chatContent.appendChild(messageElem);

    // Haal het welkomstbericht op van de server
    let messageText = await fetch(`${backendUrl}/get_welcome_message`)
        .then(response => response.json())
        .then(data => data.message)
        .catch(() => "Standaard welkomstbericht als backup");

    let index = 0;
    let typingInterval = setInterval(() => {
        if (index < messageText.length) {
            messageElem.textContent += messageText[index];
            index++;
            chatContent.scrollTop = chatContent.scrollHeight;
        } else {
            clearInterval(typingInterval);
        }
    }, 25);
};


async function fetchTitleMessage() {
    try {
        const response = await fetch(`${backendUrl}/get_title_message`);
        const data = await response.json();
        if (data.message) {
            document.querySelector("#chatbot-title").innerText = data.message;
        }
    } catch (error) {
        console.error("Failed to fetch title message:", error);
    }
}

let cachedTitle = "Standaardnaam als fallback";
let cachedWelcomeMessage = "Standaard welkomstbericht als backup";

async function initializeChat() {
    try {
        const response = await fetch(`${backendUrl}/get_title_message`);
        const data = await response.json();
        cachedTitle = data.message || cachedTitle;
    } catch (error) {
        console.error("Failed to fetch title message:", error);
    }

    try {
        const response = await fetch(`${backendUrl}/get_welcome_message`);
        const data = await response.json();
        cachedWelcomeMessage = data.message || cachedWelcomeMessage;
    } catch (error) {
        console.error("Failed to fetch welcome message:", error);
    }
}

        
window.toggleChat = function() {
    const chatbot = document.getElementById("chatbot");
    const icon = document.getElementById("chatbot-icon");

    if (chatbot.style.display === "none" || chatbot.style.display === "") {
        document.querySelector("#chatbot-title").innerText = cachedTitle;
        if (firstTimeOpen) {
            typeWelcomeMessage(cachedWelcomeMessage);  // Gebruik de gecachte welkomstboodschap
            firstTimeOpen = false;
        }
        chatbot.style.display = "flex";
        setTimeout(function() {
            chatbot.classList.add("visible");
        }, 50);

        icon.classList.add('cross');
    } else {
        chatbot.classList.remove("visible");
        setTimeout(function() {
            chatbot.style.display = "none";
        }, 500);
        icon.classList.remove('cross');
    }
};

// Aanroepen wanneer de pagina laadt
initializeChat();

window.closeChat = function() {
    const chatbot = document.getElementById("chatbot");
    const icon = document.getElementById("chatbot-icon");

    chatbot.style.display = "none";
    icon.classList.remove('cross');  // Verwijder de 'cross' klasse
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

        // Voeg het bericht van de gebruiker toe
        chatContent.innerHTML += `<div class="message-sender">U:</div><div class="user-message">${userInput.value}</div>`;
        
        // Voeg de denk-spinner toe
        chatContent.innerHTML += `<div class="bot-message"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>`;

        // Automatisch scrollen naar het laatst toegevoegde bericht
        chatContent.scrollTop = chatContent.scrollHeight;

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
                }, 25);

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

        // Controleer of de chatbot al eerder is geopend (gebruik localStorage als voorbeeld)
const chatbotStatus = localStorage.getItem("chatbotStatus");

if (window.innerWidth > 768 && chatbotStatus !== "geopend") {
    setTimeout(async function() {
        await fetchTitleMessage();
        toggleChat();
        
        // Markeer de chatbot als geopend in localStorage
        localStorage.setItem("chatbotStatus", "geopend");
    }, 3000);
}


        // Functie om afbeeldingen vooraf te laden
function preloadImages() {
    const sendIcon = new Image();
    sendIcon.src = 'https://github.com/chatgptpython/embed/blob/main/send_5836606.png?raw=true';
}

// Aanroepen wanneer de pagina laadt
preloadImages();


})();  // Deze lijn sluit de IIFE correct af
});  


  





