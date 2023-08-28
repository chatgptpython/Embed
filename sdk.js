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
            background: linear-gradient(135deg, #9c88ff, #8c77db);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
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
            animation: typing 1s infinite;
            margin: 0 2px;
        }
        
        .message-sender {
            font-size: 0.9em;
            color: #888;
            margin-bottom: 5px;
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
            let messageText = "Welkom bij Chatproducties! Hoe kan ik je helpen?";
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
