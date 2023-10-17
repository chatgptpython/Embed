document.addEventListener("DOMContentLoaded", function() {
    // Dynamisch toevoegen van de viewport meta tag
    var metaTag = document.createElement('meta');
    metaTag.name = "viewport";
    metaTag.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    document.getElementsByTagName('head')[0].appendChild(metaTag);

    (function() {
        // Haal de backend URL op van het script tag met de data-backend-url attribuut
        const scriptElement = document.querySelector('script[data-backend-url]');
        const backendUrl = scriptElement.getAttribute('data-backend-url');

        // Hier kan je de backendUrl verder gebruiken
        console.log(backendUrl); // Dit zal de URL loggen naar de console, om te verifiëren of het correct werkt

    var css = `
<style>
            body {
            font-family: 'Arial', sans-serif;
            background-color: #ffffff;
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
            transform: translateY(30px);  /* Chatbot begint 30 pixels onder de eindpositie */
            transition: opacity 0.5s ease-out, transform 0.5s ease-out;  /* 0.5 seconden animatie */
            z-index: 10000;
            background-color: #ffffff;  /* Achtergrondkleur toegevoegd */
        }

              
           #chatbot-icon {
            position: fixed;
            bottom: 20px;
            right: 30px;
            width: 50px important; 
            height: 50px important;
            border-radius: 50%;
            background: #1a2e4a; /* Gemaakt tot een solide blauwe kleur */
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.3s ease-in-out, background 0.3s ease-in-out;
            z-index: 9996;
        }

        
              #chatbot-icon img {
            width: 60%;      /* Verminder naar de gewenste breedte */
            height: 60%;     /* Verminder naar de gewenste hoogte */
            display: block;
            margin: auto;    /* Centreert de afbeelding in de container */
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
        
        #chatbot-icon img {
            font-size: 40px;
            transition: opacity 0.3s ease-in-out;
        }
        
        #chatbot-icon.open img {
            opacity: 0;
        }

#chatbot header {
    background: linear-gradient(135deg, #ffffff, #1a237e);  /* #1a237e is een donkerblauwe metallic tint */
    color: #333;
    padding: 20px 30px;   /* Vergroot padding */
    text-align: center;
    font-weight: 700;     /* Zwaarder lettertype */
    font-size: 1.6em;    /* Vergrote tekstgrootte */
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ddd;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);   /* Voeg schaduw toe */
    height: 120px;   /* Aanzienlijk vergroot in hoogte */
    clip-path: polygon(0 0, 100% 0, 100% 95%, 0% 100%);  /* Schuin effect aan de onderkant */
}



#chatbot header img {
    width: 30px;          /* Vergrote breedte */
    height: 30px;         /* Vergrote hoogte */
    margin-right: 15px;   /* Vergrote marge */
}

        
            #chatbot-content {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            background-color: #ffffff;
            color: #333;
            display: flex;
            flex-direction: column;
            /* align-items: center;  Verwijder dit om de berichten niet te centreren */
        }
                      .message-container {
            max-width: 100%;  
            width: 100%;  
            display: flex;
            flex-direction: column;
        }

        #chatbot-input button.send-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
}
        #chatbot-input button.send-icon {
            position: absolute;
            right: 20px; /* Verplaatst de knop meer naar links */
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer; /* Maakt het klikbaar */
            transition: transform 0.3s ease; /* Soepel hover-effect */
        }

        #chatbot-input button.send-icon:hover {
            transform: translateY(-50%) scale(1.1); /* Hover-effect */
        }

        #chatbot-input {
            padding: 15px 20px;
            display: flex;
            align-items: center;
            border-top: 1px solid rgba(140, 119, 219, 0.1);
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05); /* Voegt een subtiele schaduw toe */
            background-color: #ffffff;
            position: relative;
            border-radius: 10px; /* Maakt de hoeken iets ronder */
        }

        #chatbot-input textarea {
            flex: 1;
            padding: 12px 16px;
            border: 1px solid #ddd; /* Lichtere randkleur */
            border-radius: 10px; /* Maakt de hoeken iets ronder */
            outline: none;
            color: #333;
            margin-right: 0;
            resize: none;
            min-height: 30px;
            overflow: auto;
            font-size: 1.2em;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); /* Voegt een subtiele schaduw toe */
        }

        #chatbot-powered {
            text-align: center;
            font-size: 0.8em;
            color: #888;
            padding: 10px 0;
            background-color: #f9f9f9; /* Een lichte achtergrondkleur om onderscheid te maken */
            border-top: 1px solid rgba(140, 119, 219, 0.1);
        }
        
        .user-message, .bot-message {
            margin: 10px 0;
            padding: 12px 18px;
            border-radius: 10px;
            width: auto;  /* Verander van 100% naar auto */
            min-width: 40%;  /* Stel een minimum breedte in */
            transition: all 0.3s ease-in-out;
            word-wrap: break-word;
            white-space: pre-wrap;
            display: flex;
            justify-content: center;
            position: relative;
            white-space: pre-wrap;
        }
        
        
/* Stijlen voor berichten van de gebruiker */
.user-message {
    align-self: flex-end;
    max-width: 85%;
    background-color: #4A90E2;  /* Mooi blauw */
    color: #FFFFFF;  /* Witte tekst */
    text-align: right;
    /* ... eventuele andere stijlen ... */
}

/* Stijlen voor berichten van de bot */
.bot-message {
    align-self: flex-start;
    max-width: 85%;
    background-color: #F0F3F4;  /* Hemel-lichtgrijs */
    color: #333;  /* Donkere tekst voor betere leesbaarheid */
    text-align: left;
    /* ... eventuele andere stijlen ... */
}
        
             #chatbot-input .send-icon {
            width: 30px;
            height: 30px;
            background-image: url('https://github.com/chatgptpython/embed/blob/main/send.png?raw=true');
            background-size: cover;
            cursor: pointer;
            background-color: transparent;  /* Verzekert dat er geen achtergrondkleur is */
            border: none;
            margin-right: 10px;
        }



   
           .user-container {
            align-items: flex-end;
            display: flex;
            flex-direction: column;
        }
        
        .message-sender.user {
            align-self: flex-end;
            text-align: right;  /* Tekst uitlijnen naar rechts */
            color: #888;
            margin-bottom: 5px;
        }

        #choice-balloons {
            display: flex;
            justify-content: space-between;
            padding: 10px 20px;
            background-color: #ffffff;
            border-top: 1px solid rgba(140, 119, 219, 0.1);
        }
        
        #choice-balloons button {
            padding: 10px 20px;
            border-radius: 20px;
            border: none;
            cursor: pointer;
            transition: background-color 0.3s ease-in-out;
        }
        
        #ask-another-question {
            background-color: #4A90E2;
            color: #FFFFFF;
        }
        
        #close-chatbot {
            background-color: #F0F3F4;
            color: #333;
        }
        
        #choice-balloons button:hover {
            opacity: 0.9;
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
            font-size: 36px;
            padding: 10px;
            background-color: transparent;  /* Geen achtergrondkleur */
            color: white;
            transition: color 0.3s ease, transform 0.3s ease;
            position: absolute;
            top: 10px;
            right: 10px;
        }
        

#close-chat:hover {
    transform: rotate(90deg) scale(1.1);  /* Draai en schaal bij hover */
}

.loader-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px 0;
}

.loader {
    position: relative;
    width: 70px;
    height: 70px;
    border-radius: 50%;
    animation: pulse 2s infinite;
}

.loader::before,
.loader::after {
    content: "";
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border: 8px solid rgba(255, 255, 255, 0.3);
    border-top: 8px solid #1a2e4a;  /* dezelfde kleur als de header */
    border-radius: 50%;
    animation: spin 1.5s linear infinite;
}

.loader::after {
    top: -8px;
    left: -8px;
    right: -8px;
    bottom: -8px;
    animation-direction: reverse;
    border-color: rgba(255, 255, 255, 0.2);
    border-top-color: rgba(26, 46, 74, 0.5);  /* lichtere versie van de header kleur */
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
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

        #chatbot-icon {
            width: 60px;  /* Maak het blauwe bolletje kleiner op mobiele apparaten */
            height: 60px;
        }

        #chatbot-icon img {
            width: 60%; /* Aangepaste grootte voor het icoontje binnen de cirkel op mobiele apparaten */
            height: 60%;
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

#chatbot-icon.cross img {
    opacity: 0;
}

         
@media (min-width: 769px) {
    #chatbot-icon {
        width: 70px;  /* Vergroot de breedte */
        height: 70px;  /* Vergroot de hoogte */
    }
    #chatbot-icon img {
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
            <div id="choice-balloons" style="display: none;">
                <button id="ask-another-question">Nog een vraag stellen</button>
                <button id="close-chatbot">Afsluiten</button>
            </div>
            <div id="chatbot-input">
                <textarea id="user-input" rows="1" placeholder="Typ je vraag hier..."></textarea>
                <button onclick="sendMessage()" class="send-icon"></button>
            </div>
            <div id="chatbot-powered">Powered by Chatwize</div>
        </div>
        <div id="chatbot-icon" onclick="toggleChat()">
            <img src="https://raw.githubusercontent.com/chatgptpython/embed/main/chat.png" alt="Chat">
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

    async function fetchAndApplyColor() {
    try {
        const response = await fetch(`${backendUrl}/get_color`);
        const data = await response.json();
        if (data.color) {
            updateColor(data.color);
            updateChatIconColor(data.color); // Voeg deze regel toe om het chat-icoonkleur bij te werken
        }
    } catch (error) {
        console.error("Failed to fetch color:", error);
    }
}


    function updateColor(color) {
        const chatHeader = document.querySelector("#chatbot header");
        chatHeader.style.background = `linear-gradient(135deg, #ffffff, ${color})`;
    }
    
    function updateChatIconColor(color) {
        const chatIcon = document.getElementById("chatbot-icon");
        chatIcon.style.background = color;
    }


    // Oproepen wanneer de pagina laadt
    fetchAndApplyColor();


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
            chatContent.innerHTML += `<div class="message-container user-container"><div class="message-sender user">U:</div><div class="user-message">${userInput.value}</div></div>`;
    
            // Voeg de professionele laadbalk toe
            chatContent.innerHTML += '<div class="loader-container"><div class="loader"></div></div>';
    
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
                    chatContent.lastChild.remove();  // Verwijder de loader
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
                            if (showChoiceBalloons) showChoiceBalloons();
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

// Functie om een bericht te simuleren dat door de chatbot wordt getypt
function typeBotMessage(messageText, callback) {
    toggleInputState("disable"); 
    const chatContent = document.getElementById("chatbot-content");
    chatContent.innerHTML += `<div class="message-sender">Chatbot:</div>`;
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
            if (callback) callback();
        }
    }, 25);
}


// Functie om de keuzeballonnetjes te tonen
function showChoiceBalloons() {
    toggleInputState("disable"); // Uitschakelen wanneer de keuzeballonnen worden getoond
    const choiceBalloons = document.getElementById("choice-balloons");
    choiceBalloons.style.display = "flex";
}

// Functie om de keuzeballonnetjes te verbergen
function hideChoiceBalloons() {
    toggleInputState("disable"); // Invoer uitschakelen wanneer de keuzeballonnen worden verborgen
    const choiceBalloons = document.getElementById("choice-balloons");
    choiceBalloons.style.display = "none";
}

// Event Listeners voor de keuzeballonnetjes
document.getElementById("ask-another-question").addEventListener("click", function() {
    hideChoiceBalloons();
    
    // Stuur automatisch een bericht namens de gebruiker
    const chatContent = document.getElementById("chatbot-content");
    chatContent.innerHTML += `<div class="message-container user-container"><div class="message-sender user">U:</div><div class="user-message">Ik wil nog een vraag stellen</div></div>`;
    chatContent.scrollTop = chatContent.scrollHeight;

    // Stuur na een seconde een bericht namens de chatbot en schakel de invoer in voordat de chatbot de volgende vraag stelt
    setTimeout(() => {
        toggleInputState("enable");
        typeBotMessage("Wat is je nieuwe vraag?");
    }, 1000);
});

document.getElementById("close-chatbot").addEventListener("click", function() {
    closeChat();
});


// Aanroepen wanneer de pagina laadt
preloadImages();


})();  // Deze lijn sluit de IIFE correct af
});  

