// Definieer backendUrl en tenantId op het hoogste niveau van het script
const backendUrl = "https://chatbot-1k97.onrender.com";
let tenantId = 'heikant'; // Standaardwaarde voor tenantId

document.addEventListener("DOMContentLoaded", function() {
    // Dynamisch toevoegen van de viewport meta tag en Google Fonts
    var metaTag = document.createElement('meta');
    metaTag.name = "viewport";
    metaTag.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    document.getElementsByTagName('head')[0].appendChild(metaTag);

    var linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap';
    document.getElementsByTagName('head')[0].appendChild(linkElement);


    (function() {
    // Probeer het tenantId op te halen van het script tag met de data-tenant-id attribuut
    const scriptElement = document.querySelector('script[data-tenant-id]');
    if (scriptElement) {
        tenantId = scriptElement.getAttribute('data-tenant-id') || tenantId;
    }

    console.log(backendUrl, tenantId); // Dit zal de backendUrl en tenantId loggen naar de console


    var css = `
<style>
 

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
                <div class="icon-container">
                    <img src="https://avatars.collectcdn.com/5b090ec7e39f17833220e6e9/5b090ec7e39f17833220e6e9-5b0915c0e39f17833220e6f2.jpeg?t=1679047180389" alt="Icon" id="header-icon">
                    <span class="online-indicator"></span>
                </div>
                <div id="chatbot-title-container">
                    <span id="chatbot-title">
                        <span role="img" aria-label="bot">🤖</span> 
                        Chatproducties - Proddy
                    </span>
                    <div class="subtitle">Jouw virtuele assistent</div>
                </div>
                <span id="close-chat" onclick="closeChat()">×</span>
            </header>
            <div id="chatbot-content"></div>
            <div class="loader-container" style="display: none;">  <!-- De nieuwe loader, die standaard verborgen is -->
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
            <div id="choice-balloons" style="display: none;">
                <button id="ask-another-question">Vraag stellen</button>
                <button id="make-appointment" onclick="window.open('https://hypadvies.nl/vestigingen/', '_blank')">Afspraak maken</button>
                <button id="close-chatbot">Afsluiten</button>
            </div>
            <div id="chatbot-input">
                <textarea id="user-input" rows="1" placeholder="Typ je vraag hier..."></textarea>
                <button onclick="sendMessage()" class="send-icon"></button>
            </div>
            <div id="chatbot-powered">
                <a href="https://www.chatwize.co" target="_blank" rel="noopener noreferrer">Powered by Chatwize</a>
            </div>
        </div>
        <div id="chatbot-text">
            <span id="chatbot-text-close" onclick="closeChatText()">×</span>
            <span id="chatbot-text-content"></span> <!-- Dit is waar de getypte tekst zal verschijnen -->
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

window.typeWelcomeMessage = async function(backendUrl, tenantId) {
    const chatContent = document.getElementById("chatbot-content");
    const messageContainer = document.createElement("div");
    messageContainer.className = "message-container bot-container";
    messageContainer.innerHTML = `
        <img src="https://github.com/chatgptpython/embed/blob/main/robot-assistant.png?raw=true" alt="Bot Avatar" class="bot-avatar">
    `;
    chatContent.appendChild(messageContainer);
    let messageElem = document.createElement("div");
    messageElem.className = "bot-message";
    messageContainer.appendChild(messageElem);

    // Haal het welkomstbericht op van de server met de aangepaste URL
    let messageText = await fetch(`${backendUrl}/${tenantId}/get_welcome_message`)
        .then(response => response.json())
        .then(data => data.welcome_message) // Zorg ervoor dat de sleutel overeenkomt met wat de server stuurt
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
    const scriptElement = document.querySelector('script[data-backend-url][data-tenant-id]');
    const backendUrl = scriptElement.getAttribute('data-backend-url');
    const tenantId = scriptElement.getAttribute('data-tenant-id');

    // De URL moet overeenkomen met de Flask-route die we hebben ingesteld
    const colorUrl = `${backendUrl}/${tenantId}/get_color`;

    try {
        const response = await fetch(colorUrl);
        const data = await response.json();

        // Controleer of de kleur gevonden is en pas deze dan toe
        if (data.color) {
            updateColor(data.color); // Functie die u definieert om de kleur toe te passen
            // Verondersteld dat updateChatIconColor een bestaande functie is om het icoon te kleuren
            updateChatIconColor(data.color);
        } else {
            // Als er geen kleur is ontvangen, log de foutmelding
            console.error("Geen kleurinstellingen gevonden:", data.error);
        }
    } catch (error) {
        console.error("Failed to fetch color:", error);
    }
}

// Voeg een event listener toe die de kleur ophaalt wanneer de DOM volledig geladen is
document.addEventListener("DOMContentLoaded", fetchAndApplyColor);

function updateColor(color) {
    // Voeg hier uw logica toe om de kleur in de webpagina toe te passen
    console.log('Kleur bijgewerkt naar:', color);
}

function updateChatIconColor(color) {
    // Voeg hier uw logica toe om de kleur van het chat-icoon bij te werken
    console.log('Chat-icoon kleur bijgewerkt naar:', color);
}


async function fetchTitleMessage(tenantId) {
    try {
        const titleMessageUrl = `${backendUrl}/${tenantId}/get_title_message`;
        const response = await fetch(titleMessageUrl);
        if (!response.ok) {
            // Log de respons status en status tekst als er een fout is
            console.error(`Error: ${response.status} ${response.statusText}`);
            // Lees en log de respons tekst
            const errorText = await response.text();
            console.error(`Error response body: ${errorText}`);
            document.querySelector("#chatbot-title").innerText = "Standaard Titel";
            return;
        }
        const data = await response.json();
        if (data.message) {
            document.querySelector("#chatbot-title").innerText = data.message;
        }
    } catch (error) {
        console.error("Failed to fetch title message:", error);
    }
}

let cachedTitle = "Standaard Titel"; // Standaardwaarde instellen
let cachedWelcomeMessage = "Standaard welkomstbericht"; // Standaardwaarde instellen

async function initializeChat(tenantId) {
    // Haal het titelbericht op
    try {
        const titleMessageUrl = `${backendUrl}/${tenantId}/get_title_message`;
        const titleResponse = await fetch(titleMessageUrl);
        if (!titleResponse.ok) {
            // Log de respons status en status tekst als er een fout is
            console.error(`Error: ${titleResponse.status} ${titleResponse.statusText}`);
            // Lees en log de respons tekst
            const errorText = await titleResponse.text();
            console.error(`Error response body: ${errorText}`);
            // Gebruik standaardwaarde als fallback
            cachedTitle = "Standaard Titel";
        } else {
            const titleData = await titleResponse.json();
            cachedTitle = titleData.message || cachedTitle;
        }
    } catch (error) {
        console.error("Failed to fetch title message:", error);
    }

    // Haal het welkomstbericht op
    try {
        const welcomeMessageUrl = `${backendUrl}/${tenantId}/get_welcome_message`;
        const welcomeResponse = await fetch(welcomeMessageUrl);
        if (!welcomeResponse.ok) {
            // Log de respons status en status tekst als er een fout is
            console.error(`Error: ${welcomeResponse.status} ${welcomeResponse.statusText}`);
            // Lees en log de respons tekst
            const errorText = await welcomeResponse.text();
            console.error(`Error response body: ${errorText}`);
            // Gebruik standaardwaarde als fallback
            cachedWelcomeMessage = "Standaard welkomstbericht";
        } else {
            const welcomeData = await welcomeResponse.json();
            cachedWelcomeMessage = welcomeData.message || cachedWelcomeMessage;
        }
    } catch (error) {
        console.error("Failed to fetch welcome message:", error);
    }
}

        
window.toggleChat = function() {
    const chatbot = document.getElementById("chatbot");
    const icon = document.getElementById("chatbot-icon");
    const chatText = document.getElementById("chatbot-text");  // Referentie naar de nieuwe chat tekst

    if (chatbot.style.display === "none" || chatbot.style.display === "") {
        document.querySelector("#chatbot-title").innerText = cachedTitle;
        if (firstTimeOpen) {
            typeWelcomeMessage(cachedWelcomeMessage);  // Gebruik de gecachte welkomstboodschap
            firstTimeOpen = false;
        }
        chatbot.style.display = "flex";
        chatText.style.opacity = "0";  // Verberg de tekst wanneer de chat geopend wordt

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
        chatText.style.opacity = "1";  // Toon de tekst opnieuw wanneer de chat gesloten wordt
    }
};

window.closeChatText = function() {
    const chatText = document.getElementById("chatbot-text");
    chatText.style.display = "none";  // Verberg de chattekst
};        


// Aanroepen wanneer de pagina laadt
initializeChat();


// Functie om de chattekst getypt weer te geven
function typeChatTextMessage() {
    const chatTextContent = document.getElementById("chatbot-text-content");
    const messageText = "Stel hier uw vraag";
    let index = 0;
    let typingInterval = setInterval(() => {
        if (index < messageText.length) {
            chatTextContent.textContent += messageText[index];
            index++;
        } else {
            clearInterval(typingInterval);
            
            // Voeg de click event listener hier toe, nadat de boodschap volledig is getypt
            chatTextContent.addEventListener('click', function() {
                toggleChat();
            });
        }
    }, 50);
}

// Aanroepen met een vertraging van 3 seconden nadat de pagina is geladen
setTimeout(typeChatTextMessage, 3000);


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

    window.sendMessage = async function() {
        if (isBotTyping) return;
    
        const userInput = document.getElementById("user-input");
        const chatContent = document.getElementById("chatbot-content");
        const scriptElement = document.querySelector('script[data-backend-url][data-tenant-id]');
        const backendUrl = scriptElement.getAttribute('data-backend-url');
        const tenantId = scriptElement.getAttribute('data-tenant-id');
    
        if (userInput.value.trim() !== "") {
            isBotTyping = true;
            toggleInputState("disable");
    
            // Voeg het bericht van de gebruiker toe
            chatContent.innerHTML += `<div class="message-container user-container">
                                        <div class="message-sender user">U:</div>
                                        <div class="user-message">${userInput.value}</div>
                                      </div>`;
    
            // Voeg de professionele laadbalk toe
            chatContent.innerHTML += '<div class="loader-container"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>';
    
            // Automatisch scrollen naar het laatst toegevoegde bericht
            chatContent.scrollTop = chatContent.scrollHeight;
    
            try {
                const response = await fetch(`${backendUrl}/ask`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ question: userInput.value, tenant_id: tenantId })
                });
    
                const data = await response.json();
    
                if (response.ok) {
                    chatContent.lastChild.remove(); // Verwijder de loader
    
                    const messageContainer = document.createElement("div");
                    messageContainer.className = "message-container bot-container";
                    messageContainer.innerHTML = `
                        <img src="https://github.com/chatgptpython/embed/blob/main/robot-assistant.png?raw=true" alt="Bot Avatar" class="bot-avatar">
                    `;
                    chatContent.appendChild(messageContainer);
    
                    let messageText = data.answer;
                    let messageElem = document.createElement("div");
                    messageElem.className = "bot-message";
                    messageContainer.appendChild(messageElem);
    
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
                            if (typeof showChoiceBalloons === "function") showChoiceBalloons();
                        }
                    }, 25);
                } else {
                    throw new Error(data.error || "Er is een fout opgetreden tijdens het versturen van de vraag.");
                }
    
                userInput.value = "";
            } catch (error) {
                console.error("Error:", error);
                chatContent.lastChild.remove(); // Verwijder de loader
    
                const messageContainer = document.createElement("div");
                messageContainer.className = "message-container bot-container";
                messageContainer.innerHTML = `
                    <img src="https://github.com/chatgptpython/embed/blob/main/robot-assistant.png?raw=true" alt="Bot Avatar" class="bot-avatar">
                    <div class="bot-message">Sorry, er is een fout opgetreden: ${error.message}</div>
                `;
                chatContent.appendChild(messageContainer);
                toggleInputState("enable");
                isBotTyping = false;
            }
        }
    };
    
    

// Aanroepen wanneer de pagina laadt
document.addEventListener("DOMContentLoaded", function() {
    const scriptElement = document.querySelector('script[data-backend-url][data-tenant-id]');
    const backendUrl = scriptElement.getAttribute('data-backend-url');
    const tenantId = scriptElement.getAttribute('data-tenant-id');
    initializeChat(backendUrl, tenantId);
});


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
        
function typeBotMessage(messageText, callback) {
    toggleInputState("disable"); 
    const chatContent = document.getElementById("chatbot-content");
    const messageContainer = document.createElement("div");
    messageContainer.className = "message-container bot-container";
    messageContainer.innerHTML = `
        <img src="https://github.com/chatgptpython/embed/blob/main/robot-assistant.png?raw=true" alt="Bot Avatar" class="bot-avatar">
    `;
    chatContent.appendChild(messageContainer);
    let messageElem = document.createElement("div");
    messageElem.className = "bot-message";
    messageContainer.appendChild(messageElem);
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
    const chatbotInput = document.getElementById("chatbot-input");
    chatbotInput.classList.add("hide-input");  // Verberg de inputbalk

    const choiceBalloons = document.getElementById("choice-balloons");
    choiceBalloons.style.display = "flex";
}


// Functie om de keuzeballonnetjes te verbergen
function hideChoiceBalloons() {
    const chatbotInput = document.getElementById("chatbot-input");
    chatbotInput.classList.remove("hide-input");  // Toon de inputbalk opnieuw

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






