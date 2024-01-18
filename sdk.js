document.addEventListener("DOMContentLoaded", function() {
    // Dynamisch toevoegen van de viewport meta tag en Google Fonts
    var metaTag = document.createElement('meta');
    metaTag.name = "viewport";
    metaTag.content = "width=device-width, initial-scale=1.0";
    document.getElementsByTagName('head')[0].appendChild(metaTag);


    var linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap';
    document.getElementsByTagName('head')[0].appendChild(linkElement);
   
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
            background: linear-gradient(135deg, #f8f9fa, #e9ecef); 
        }

        #chatbot-icon {
            transform: scale(0.8); 
            position: fixed;
            bottom: 20px;
            right: 0px;
            width: 30px; /* Aangepaste breedte */
            height: 30px; /* Aangepaste hoogte */
            border-radius: 50%;
            background: #1a2e4a;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.3s ease-in-out, background 0.3s ease-in-out;
            z-index: 9996;
        }



        
              #chatbot-icon img {
            width: 50%;      /* Verminder naar de gewenste breedte */
            height: 50%;     /* Verminder naar de gewenste hoogte */
            display: block;
            margin: auto;    /* Centreert de afbeelding in de container */
        }

        


        #chatbot.visible {
            opacity: 1;
            transform: translateY(0);
        }

        
        #chatbot-icon:hover {
            transform: scale(0.9);
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

#make-appointment {
    background-color: #4A90E2;  /* dezelfde kleur als de 'Nog een vraag stellen' knop */
    color: #FFFFFF;
    margin-left: 10px;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.3); }
}

.loader-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
}

.dot {
    width: 8px;
    height: 8px;
    margin: 0 4px;
    background-color: #007BFF;
    border-radius: 50%;
    animation: pulse 1.4s infinite;
    animation-timing-function: ease-in-out;
}

.dot:nth-child(2) {
    animation-delay: 0.2s;
}

.dot:nth-child(3) {
    animation-delay: 0.4s;
}

#chatbot header {
    background: linear-gradient(270deg, #FFFFFF, rgba(var(--header-color), 0.1) 95%);
    padding: 20px 30px;
    text-align: left;
    font-weight: 700;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ddd;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
    height: 120px;
    font-family: 'Roboto', sans-serif;  /* Modern lettertype */
    font-size: 1.3em;  /* Vergrote tekstgrootte */
    color: #4a4a4a;  /* Een zachte, donkergrijze kleur */
    justify-content: space-between; /* Ruimte tussen titel en sluitknop */

}

.icon-container {
    position: relative;
}

#header-icon {
    border-radius: 50%;
    width: 50px;  /* Verhoogd naar 50px */
    height: 50px;  /* Verhoogd naar 50px */
}

.online-indicator {
    position: absolute;
    width: 12px;
    height: 12px;
    background-color: green;
    border-radius: 50%;
    border: 2px solid white;
    bottom: 5px;  /* Aanpassen voor verticale positie */
    right: 8px;  /* Nog iets meer naar links */
}




#chatbot header img {
    width: 40px;  /* Verhoogd van 30px naar 40px */
    height: 40px;  /* Verhoogd van 30px naar 40px */
    margin-right: 15px;
}

  #chatbot-title {
        font-size: 1.1em;
        font-weight: normal;
        margin: 0 !important;
        padding: 0 !important;
    }

    .subtitle {
        font-size: 0.7em; /* Kleinere lettergrootte dan de titel */
        margin-top: -12px !important; /* Nog grotere negatieve marge */
        margin-bottom: 0 !important;
        padding: 0 !important;
        color: #7a7a7a; /* Een lichtgrijze kleur voor een zachtere uitstraling */
        font-weight: lighter; /* Een lichtere letterdikte */
        font-family: 'Roboto', sans-serif; /* Consistent met de titel */
    }

    /* Responsieve stijlen voor mobiele apparaten... */
    @media (max-width: 768px) {
        #chatbot-title {
            font-size: 1.4em; /* Grotere lettergrootte op kleinere schermen */
        }

        .subtitle {
            font-size: 1em; /* Aangepaste lettergrootte voor ondertitel op kleinere schermen */
        }
    }

#chatbot-content {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef); /* Zachte en subtiele gradiënt */
    color: #333;
    display: flex;
    flex-direction: column;
}

.message-container {
    max-width: 100%;  
    width: 100%;  
    display: flex;
    flex-direction: row;
    align-items: flex-start;
}

.bot-avatar {
    width: 30px;  /* Breedte van het icoontje */
    height: 30px;  /* Hoogte van het icoontje */
    margin-right: 5px;  /* Ruimte tussen het icoontje en de tekst */
    margin-top: 20px;  /* Verplaatst het icoontje verder naar beneden */
    margin-left: -5px;  /* Verplaatst het icoontje een beetje naar links */
}
/* Stijl voor de container van de chatbalk */
#chatbot-input {
    display: flex;
    align-items: center; /* Zorgt voor verticale uitlijning */
    justify-content: space-between; /* Evenredige ruimteverdeling binnen de container */
    position: relative;
    height: 50px; /* Vaste hoogte van de chatbalk */
    border-radius: 25px; /* Ronde hoeken */
    background-color: transparent; /* Transparante achtergrond */
    width: 100%; /* Volledige breedte */
    padding: 0 10px; /* Padding aan de zijkanten */
    box-sizing: border-box; /* Inclusief padding en border in de breedte */
}

/* Stijl voor het tekstgebied binnen de chatbalk */
#chatbot-input textarea {
    flex-grow: 1; /* Neemt beschikbare ruimte in beslag */
    height: 40px; /* Vaste hoogte */
    border-radius: 20px; /* Ronde hoeken */
    border: 1px solid #ddd;
    padding: 5px 15px; /* Padding aan binnenkant */
    margin: 5px 10px 5px 0; /* Margin rondom het tekstveld */
    font-size: 1em;
    resize: none; /* Geen mogelijkheid om te vergroten/verkleinen */
    outline: none; /* Geen focus-omlijning */
    background-color: #f9f9f9; /* Achtergrondkleur van het tekstveld */
}

/* Stijl voor de verzendknop */
#chatbot-input .send-icon {
    width: 30px;
    height: 30px; /* Vaste afmetingen van de knop */
    margin: auto 0; /* Automatische marge voor verticale centrering */
    background-image: url('https://github.com/chatgptpython/embed/blob/main/send.png?raw=true');
    background-size: cover;
    cursor: pointer;
    border: none;
    background-color: transparent;
}

/* Hover-effect voor de verzendknop */
#chatbot-input .send-icon:hover {
    transform: scale(1.1);
}



           #chatbot-powered {
        text-align: center;
        font-size: 0.8em;
        color: #888;
        padding: 10px 0;
        background-color: #f9f9f9;
        border-top: 1px solid rgba(140, 119, 219, 0.1);
        cursor: pointer; /* Maakt het element klikbaar */
        transition: color 0.3s ease; /* Voegt een overgangseffect toe voor een soepele kleurverandering */
    }
    
    #chatbot-powered:hover {
        color: #666; /* Donkere kleur bij hover */
        text-decoration: underline; /* Onderstreping bij hover */
    }

        #chatbot-powered a {
        color: inherit; /* Neemt de kleur van de ouder over */
        text-decoration: none; /* Verwijdert de standaard onderstreping */
        transition: color 0.3s ease; /* Voegt een overgangseffect toe voor een soepele kleurverandering */
    }
    
    #chatbot-powered a:hover {
        color: #666; /* Donkere kleur bij hover */
        text-decoration: underline; /* Onderstreping bij hover */
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
        
.user-message {
    align-self: flex-end;
    max-width: 85%;
    background-color: var(--dynamic-color);  /* Dynamische achtergrondkleur */
    color: #FFFFFF;  /* Witte tekst voor goede leesbaarheid */
    text-align: right;
    margin: 10px 0;
    padding: 12px 18px;
    border-radius: 16px;  /* Verhoogde randradius voor een moderner uiterlijk */
    width: auto;
    min-width: 40%;
    transition: all 0.3s ease-in-out;
    word-wrap: break-word;
    white-space: pre-wrap;
    display: flex;
    justify-content: center;
    position: relative;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);  /* Schaduw toegevoegd voor een "lifted" effect */
}



/* Stijlen voor berichten van de bot */
.bot-message {
    align-self: flex-start;
    max-width: 85%;
    background-color: #FFFFFF; 
    color: #333;  /* Donkere tekst voor betere leesbaarheid */
    text-align: left;
    /* ... eventuele andere stijlen ... */
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

        

#chatbot-text {
    position: fixed;
    bottom: 90px;
    right: 30px;
    font-size: 15px;
    background-color: #ffffff;
    color: #000000;
    padding: 8px 12px;
    border-radius: 15px;
    text-align: center;
    z-index: 9995;
    transition: opacity 0.3s ease, transform 0.3s ease;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.1);
    letter-spacing: 0.5px;
    font-weight: 500;
}

#chatbot-text:hover {
    transform: translateY(-3px);
}

#chatbot-text-close {
    position: absolute;
    top: -30px; /* Meer ruimte tussen het kruisje en de tekst */
    right: -5px; /* Iets naar rechts verplaatst voor een betere uitlijning */
    background-color: #ffffff;
    color: #000000;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    width: 25px; /* Groter kruisje */
    height: 25px; /* Groter kruisje */
    text-align: center;
    line-height: 23px; /* Aangepast om het kruisje in het midden van de cirkel te plaatsen */
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 9996; 
    font-weight: bold; 
    transition: background-color 0.3s ease; 
}

#chatbot-text-close:hover {
    background-color: #f0f0f0; 
}

#chatbot-text-content {
    cursor: pointer;
}

#choice-balloons {
    display: flex;
    flex-wrap: wrap;  /* Maakt het mogelijk voor items om te 'wrappen' naar de volgende regel */
    justify-content: flex-start;  /* Uitlijnen aan het begin van de container */
    align-items: center;  /* Verticale uitlijning van de items */
    padding: 10px 20px;
    background-color: transparent;
    border-top: none; 
    gap: 10px;  /* Stelt een vaste ruimte tussen de items in */
}

#choice-balloons button {
    font-size: 14.2px; 
    padding: 6.5px 13px;
    margin: 0;  /* Verwijder de marge om te voorkomen dat deze interfereert met de 'gap' instelling */
    border-radius: 15px;
    border: none;
    outline: none;
    background-color: rgba(255, 255, 255, 0.8);
    color: #333;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    font-weight: 500;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);  /* Schaduw toegevoegd voor een lifted effect */
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
    opacity: 0.92;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);  /* Vergrootte schaduw op hover */
    transform: translateY(-2px);  /* Lichtelijk omhoog verplaatsen van de knop op hover */
}

#chatbot-input.hide-input {
    display: none;
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
    font-size: 40px;  
    margin-left: auto;
    padding: 10px;
    background-color: transparent;
    color: #444; 
    transition: color 0.3s ease, transform 0.3s ease;
    font-weight: 300; 
    line-height: 1;  /* Zorgt ervoor dat het kruisje gecentreerd blijft */
}

#close-chat:hover {
    color: #222;  
    transform: scale(1.1);  /* Licht vergroot bij hover */
}

/* Container voor de bronlinks */
.source-links-container {
    margin-top: 8px;
    padding-left: 10px;
    text-align: left;
}

/* Stijl voor individuele bronlink-bubbels */
.source-link-bubble {
    display: inline-block;
    margin-right: 5px;
    margin-bottom: 5px; /* Toegevoegd voor betere weergave op kleine schermen */
    padding: 6px 10px; /* Iets meer padding */
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 15px; /* Iets rondere hoeken */
    font-size: 0.9em; /* Iets grotere tekst */
    text-decoration: none;
    color: #333;
    transition: background-color 0.3s, color 0.3s;
    white-space: nowrap; /* Voorkomt dat tekst breekt */
    overflow: hidden;
    text-overflow: ellipsis; /* Voegt ellipsen toe als de tekst te lang is */
    max-width: 140px; /* Maximale breedte van de bubbel */
}

.source-link-bubble:hover {
    background-color: #e0e0e0;
    color: #000;
}

/* Aanpassingen voor kleinere schermen */
@media (max-width: 480px) {
    .source-link-bubble {
        font-size: 0.8em; /* Kleinere tekstgrootte */
        padding: 5px 8px; /* Minder padding */
    }
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

#chatbot-content {
    overflow-y: auto; // Zorgt voor een scrollbare inhoud indien nodig
    -webkit-overflow-scrolling: touch; // Verbeterde scroll-ervaring op iOS-apparaten
}

@media (max-width: 768px) {
    #chatbot {
        width: 100%; // Zorgt ervoor dat de chatbot de volledige breedte van het scherm gebruikt op mobiele apparaten
        height: 100%; // Zorgt ervoor dat de chatbot de volledige hoogte van het scherm gebruikt op mobiele apparaten
        bottom: 0;
        right: 0;
        border-radius: 0;
        top: 0;
        transform: translateY(0);
    }
    /* Voeg indien nodig meer stijlen toe voor betere responsiviteit */
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
                <div class="icon-container">
                    <img src="https://raw.githubusercontent.com/chatgptpython/embed/main/chat.png">
                    <span class="online-indicator"></span>
                </div>
                <div id="chatbot-title-container">
                    <span id="chatbot-title">
                        <span role="img" aria-label="bot">🤖</span> 
                        Chatproducties - Proddy
                    </span>
                    <div class="subtitle">Jouw virtuele assistent</div>
                </div>
                <span id="close-chat">×</span>
            </header>
            <div id="chatbot-content"></div>
            <div id="chatbot-input">
                <textarea id="user-input" rows="1" placeholder="Typ je vraag hier..."></textarea>
                <button id="send-message" class="send-icon"></button>
            </div>
            <div id="chatbot-powered">
                <a href="https://www.chatwize.co" target="_blank" rel="noopener noreferrer">Powered by Chatwize</a>
            </div>
        </div>
        <div id="chatbot-text">
            <span id="chatbot-text-close">×</span>
            <span id="chatbot-text-content"></span> <!-- Dit is waar de getypte tekst zal verschijnen -->
        </div>
        <div id="chatbot-icon">
            <img src="https://raw.githubusercontent.com/chatgptpython/embed/main/chat.png" alt="Chat">
        </div>
    `;



   var div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div);



    (function() {
    // Functies om een unieke ID te genereren en te beheren in een cookie
    function generateUniqueId() {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    }

    function setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // Controleer of de gebruiker al een unieke ID heeft
    var userId = getCookie('userId');
    if (!userId) {
        userId = generateUniqueId();
        setCookie('userId', userId, 365); // Stel de cookie in met een geldigheid van 1 jaar
    }
    // URL en Tenant ID ophalen uit de script tag
    const scriptElement = document.querySelector('script[data-backend-url][data-tenant-id]');
    const backendUrl = scriptElement.getAttribute('data-backend-url');
    const tenantId = scriptElement.getAttribute('data-tenant-id');

    // Valideer backendUrl en tenantId
    if (!backendUrl || !tenantId) {
        console.error('Backend URL of Tenant ID is niet gedefinieerd.');
        return; // Stop de uitvoering als deze waarden niet zijn gevonden
    }

  // JavaScript toevoegen
    let firstTimeOpen = true;  // Nieuwe variabele om bij te houden of de chatbot voor de eerste keer wordt geopend
    let isBotTyping = false;
    
window.typeWelcomeMessage = async function() {
    // Elementen ophalen
    const chatContent = document.getElementById("chatbot-content");
    const messageContainer = document.createElement("div");
    messageContainer.className = "message-container bot-container";
    chatContent.appendChild(messageContainer);
    
    // Avatar voor de bot instellen
    const botAvatar = document.createElement("img");
    botAvatar.src = "https://github.com/chatgptpython/embed/blob/main/robot-assistant.png?raw=true";
    botAvatar.alt = "Bot Avatar";
    botAvatar.className = "bot-avatar";
    messageContainer.appendChild(botAvatar);
    
    // Container voor het welkomstbericht
    let messageElem = document.createElement("div");
    messageElem.className = "bot-message";
    messageElem.style.borderTopLeftRadius = "0"; // Maak de linkerbovenhoek hoekig
    messageContainer.appendChild(messageElem);

    // URL en Tenant ID ophalen uit de script tag
    const scriptElement = document.querySelector('script[data-backend-url][data-tenant-id]');
    const backendUrl = scriptElement.getAttribute('data-backend-url');
    const tenantId = scriptElement.getAttribute('data-tenant-id');

    // Valideer backendUrl en tenantId
    if (!backendUrl || !tenantId) {
        console.error('Backend URL of Tenant ID is niet gedefinieerd.');
        messageElem.textContent = "Er is een fout opgetreden. Probeer het opnieuw.";
        return;
    }

    // Probeert het welkomstbericht op te halen
    let messageText = '';
    try {
        const response = await fetch(`${backendUrl}/${tenantId}/get_welcome_message`);
        if (!response.ok) {
            throw new Error(`Server response status: ${response.status}`);
        }
        const data = await response.json();
        if (!data || !data.welcome_message) {
            throw new Error("Welkomstbericht is niet gevonden in de response.");
        }
        messageText = data.welcome_message; // Stelt het welkomstbericht in
    } catch (error) {
        console.error("Error bij het ophalen van het welkomstbericht: ", error);
        messageText = "Standaard welkomstbericht als backup"; // Fallback bericht
    }

    // Start de typ-animatie voor het welkomstbericht
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

 
let cachedTitle; // Globale variabele voor de titel, wordt ingesteld in fetchTitleMessage
let cachedWelcomeMessage; // Globale
let cachedColor;
        
// Functie om het titelbericht dynamisch op te halen
window.fetchTitleMessage = async function() {
    const titleElement = document.querySelector("#chatbot-title");
    if (!titleElement) {
        console.error('Element met ID "chatbot-title" is niet gevonden.');
        return;
    }

    const scriptElement = document.querySelector('script[data-backend-url][data-tenant-id]');
    const backendUrl = scriptElement.getAttribute('data-backend-url');
    const tenantId = scriptElement.getAttribute('data-tenant-id');

    if (!backendUrl || !tenantId) {
        console.error('Backend URL of Tenant ID is niet gedefinieerd.');
        titleElement.innerText = "Standaard Titel";
        return;
    }

    try {
        const response = await fetch(`${backendUrl}/${tenantId}/get_title_message`);
        if (!response.ok) {
            throw new Error(`Server response status: ${response.status}`);
        }
        const data = await response.json();
        if (!data || !data.title_message) {
            throw new Error("Titelbericht is niet gevonden in de response.");
        }
        cachedTitle = data.title_message; // Update de gecachte titel
        titleElement.innerText = cachedTitle;
    } catch (error) {
        console.error("Error bij het ophalen van het titelbericht: ", error);
        titleElement.innerText = cachedTitle || "Standaard Titel"; // Fallback titel
    }
};

// Functie om de kleur dynamisch op te halen en toe te passen
async function fetchAndApplyColor() {
    // Verkrijg backendUrl en tenantId uit het script-element
    const scriptElement = document.querySelector('script[data-backend-url][data-tenant-id]');
    const backendUrl = scriptElement.getAttribute('data-backend-url');
    const tenantId = scriptElement.getAttribute('data-tenant-id');

    if (!backendUrl || !tenantId) {
        console.error('Backend URL of Tenant ID is niet gedefinieerd.');
        return;
    }

    // Opbouwen van de URL om de kleurinstellingen op te halen
    const colorUrl = `${backendUrl}/${tenantId}/get_color`;

    try {
        // Proberen de kleurinstellingen op te halen via de API
        const response = await fetch(colorUrl);
        if (!response.ok) {
            throw new Error(`Server response status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.color) {
            cachedColor = data.color; // Cache de kleur
            updateColor(cachedColor); // Pas de kleur toe op de chatbot elementen
            updateChatIconColor(cachedColor); // Pas de kleur van het icoon aan
        } else {
            throw new Error("Geen kleurinstellingen gevonden in de response.");
        }
    } catch (error) {
        console.error("Failed to fetch color:", error);
    }
}

function updateColor(color) {
    // Pas de header kleur toe
    const chatbotHeader = document.querySelector('#chatbot header');
    if (chatbotHeader) {
        // Converteer hex kleur naar RGB
        const rgb = hexToRgb(color);
        // Stel de achtergrond in met de nieuwe, donkerdere kleur en behoud de stijl zoals gedefinieerd in CSS
        chatbotHeader.style.background = `linear-gradient(270deg, #FFFFFF, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3))`;
        console.log('Header kleur bijgewerkt naar:', color);
    }
}

    // Functies voor chatbot-interacties
    function toggleChat() {
        const chatbot = document.getElementById("chatbot");
        if (chatbot.style.display === "none" || chatbot.style.display === "") {
            chatbot.style.display = "flex";
        } else {
            chatbot.style.display = "none";
        }
    }


// Helper functie om hex naar RGB te converteren
function hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}




// Functie om de kleur van het chat-icoon aan te passen
function updateChatIconColor(color) {
    // Pas de kleur van het chat-icoon toe
    const chatIcon = document.querySelector('#chatbot-icon');
    if (chatIcon) {
        chatIcon.style.background = color;
        console.log('Chat-icoon kleur bijgewerkt naar:', color);
    }
}

window.initializeChat = async function() {
    // Haal eerst het titelbericht op
    await window.fetchTitleMessage();

    // Haal de kleur op en pas deze toe
    await fetchAndApplyColor();
};

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

// Functie om het chatvenster te sluiten
function closeChat() {
    var chatbotElement = document.getElementById('chatbot');
    if (chatbotElement) {
        chatbotElement.style.display = 'none'; // Verbergt het chatvenster
    }
}

// Voeg event listener toe aan het kruisje
var closeButton = document.getElementById('close-chat');
if (closeButton) {
    closeButton.addEventListener('click', closeChat);
}

window.closeChatText = function() {
    const chatText = document.getElementById("chatbot-text");
    chatText.style.display = "none";  // Verberg de chattekst
};        


window.onload = function() {
    // Zorg ervoor dat de pagina volledig is geladen voordat initializeChat wordt aangeroepen
    initializeChat();
};



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
            event.preventDefault(); // Voorkom standaard 'Enter' gedrag dat kan interfereren met scrollen
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

    // Verkrijg de tenant ID en backend URL van het script-element
    const scriptElement = document.querySelector('script[data-backend-url][data-tenant-id]');
    const backendUrl = scriptElement.getAttribute('data-backend-url');
    const tenantId = scriptElement.getAttribute('data-tenant-id');

    // Haal de userId uit de cookie
    var userId = getCookie('userId');

    if (userInput.value.trim() !== "") {
        isBotTyping = true;
        toggleInputState("disable");

        // Sla de waarde van de invoer op voordat deze wordt leeggemaakt
        const userMessage = userInput.value;

        // Voeg het bericht van de gebruiker toe aan de chat-interface
        chatContent.innerHTML += `<div class="message-container user-container" style="display: flex; justify-content: flex-end;"><div class="user-message" style="background-color: ${cachedColor}; border-top-right-radius: 0;">${userMessage}</div></div>`;

        // Maak de inputbalk leeg
        userInput.value = "";

        // Voeg een laadbalk toe om de respons van de bot aan te geven
        chatContent.innerHTML += '<div class="loader-container"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>';

        // Automatisch scrollen naar het laatste bericht
        chatContent.scrollTop = chatContent.scrollHeight;

        setTimeout(() => {
            fetch(`${backendUrl}/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    question: userMessage,
                    tenant_id: tenantId,
                    user_id: userId
                })
            })
            .then(response => response.json())
            .then(data => {
                // Verwijder de laadbalk
                chatContent.lastChild.remove();

                // Voeg het antwoord van de bot toe aan de chat-interface
                const messageContainer = document.createElement("div");
                messageContainer.className = "message-container bot-container";
                messageContainer.innerHTML = `
                    <img src="https://github.com/chatgptpython/embed/blob/main/robot-assistant.png?raw=true" alt="Bot Avatar" class="bot-avatar">
                `;
                chatContent.appendChild(messageContainer);
                let messageElem = document.createElement("div");
                messageElem.className = "bot-message";
                messageElem.style.borderTopLeftRadius = "0";
                messageContainer.appendChild(messageElem);

                let messageText = data.answer;
                let index = 0;
                let typingInterval = setInterval(() => {
                    if (index < messageText.length) {
                        messageElem.textContent += messageText[index];
                        index++;
                        chatContent.scrollTop = chatContent.scrollHeight;
                    } else {
                        clearInterval(typingInterval);

                        // Toon bronlinks als bubbels
                        if (data.formatted_source_links && data.formatted_source_links.length > 0) {
                            displaySourceLinksAsBubbles(data.formatted_source_links.slice(0, 3));
                        }

                        toggleInputState("enable");
                        isBotTyping = false;
                        if (showChoiceBalloons) showChoiceBalloons();
                    }
                }, 25);
            })
            .catch(error => {
                // Toon een foutmelding als de aanvraag mislukt
                console.error("Error:", error);
                const messageContainer = document.createElement("div");
                messageContainer.className = "message-container bot-container";
                messageContainer.innerHTML = `
                    <img src="https://github.com/chatgptpython/embed/blob/main/robot-assistant.png?raw=true" alt="Bot Avatar" class="bot-avatar">
                    <div class="bot-message">Sorry, er is een fout opgetreden.</div>
                `;
                chatContent.appendChild(messageContainer);
                toggleInputState("enable");
                isBotTyping = false;
            });
        }, 500);
    }
};

function displaySourceLinksAsBubbles(links) {
    const chatContent = document.getElementById("chatbot-content");
    const linksContainer = document.createElement("div");
    linksContainer.className = "source-links-container";

    links.forEach(link => {
        const linkElem = document.createElement("a");
        linkElem.href = link.url;
        linkElem.target = "_blank";
        linkElem.className = "source-link-bubble";

        // Extract het laatste deel van de URL na de laatste '/'
        const urlSegments = link.url.split('/');
        const lastSegment = urlSegments[urlSegments.length - 1] || urlSegments[urlSegments.length - 2]; // Omgaan met trailing slashes
        const linkText = lastSegment.replace(/-/g, ' '); // Vervangt streepjes door spaties

        linkElem.textContent = linkText || link.title; // Gebruik de geëxtraheerde tekst of de titel als fallback

        linksContainer.appendChild(linkElem);
    });

    chatContent.appendChild(linksContainer);
}


    

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
    messageElem.style.borderTopLeftRadius = "0"; // Maak de linkerbovenhoek hoekig
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

// Aanroepen wanneer de pagina laadt
preloadImages();


})();  // Deze lijn sluit de IIFE correct af
});

