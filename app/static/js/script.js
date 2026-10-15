document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.getElementById("chat-input");
    const btnSend = document.getElementById("btn-send-chat");
    const chatMessages = document.getElementById("chat-messages");
    const chatbotContainer = document.getElementById("chatbot-container");
    const chatbotToggleBtn = document.getElementById("chatbot-toggle-btn");
    const closeChatBtn = document.getElementById("close-chat-btn");

    // Lógica para mostrar y ocultar el chat
    if (chatbotToggleBtn && chatbotContainer && closeChatBtn) {
        chatbotToggleBtn.addEventListener("click", () => {
            chatbotContainer.classList.remove("hidden");
            chatbotToggleBtn.classList.add("hidden");
        });

        closeChatBtn.addEventListener("click", () => {
            chatbotContainer.classList.add("hidden");
            chatbotToggleBtn.classList.remove("hidden");
        });
    }

    // Función para dibujar un nuevo mensaje en pantalla
    function addMessage(text, sender) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("message");
        msgDiv.classList.add(sender === "user" ? "user-message" : "bot-message");
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Función principal para enviar el mensaje al webhook de n8n
    async function sendMessage() {
        const userText = chatInput.value.trim();
        if (userText === "") return;

        addMessage(userText, "user");
        chatInput.value = "";

        // Indicador de cargando
        const typingId = "typing-" + Date.now();
        const typingDiv = document.createElement("div");
        typingDiv.classList.add("message", "bot-message");
        typingDiv.setAttribute("id", typingId);
        typingDiv.innerHTML = "<em>Procesando...</em>";
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await fetch("https://kevin-portafolio.duckdns.org/webhook/096d0b56-bacd-452e-8d6e-05ea41c2b3c8/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    action: "sendMessage", 
                    chatInput: userText,
                    sessionId: "user-session-" + location.hostname // Genera un ID de sesión válido
                })
            });

            const data = await response.json();
            const typingElement = document.getElementById(typingId);
            if (typingElement) typingElement.remove();

            // Extraer la respuesta de n8n de forma segura
            let botReply = "Respuesta vacía";
            if (typeof data === "string") {
                botReply = data;
            } else if (data.output) {
                botReply = data.output;
            } else if (data.text) {
                botReply = data.text;
            } else if (data.message) {
                botReply = data.message;
            } else {
                botReply = JSON.stringify(data);
            }

            addMessage(botReply, "bot");

        } catch (error) {
            const typingElement = document.getElementById(typingId);
            if (typingElement) typingElement.remove();
            addMessage("Ups, hubo un error de red al conectar con el servidor.", "bot");
            console.error("Error Fetch:", error);
        }
    }

    // Eventos de envío
    if (btnSend) {
        btnSend.addEventListener("click", sendMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                sendMessage();
            }
        });
    }
});