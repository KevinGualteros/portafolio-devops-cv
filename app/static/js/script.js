document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.getElementById("chat-input");
    const btnSend = document.getElementById("btn-send-chat");
    const chatMessages = document.getElementById("chat-messages");
    const chatbotContainer = document.getElementById("chatbot-container");
    const chatbotToggleBtn = document.getElementById("chatbot-toggle-btn");
    const closeChatBtn = document.getElementById("close-chat-btn");

    // Lógica para mostrar/ocultar el chat
    chatbotToggleBtn.addEventListener("click", () => {
        chatbotContainer.classList.remove("hidden");
        chatbotToggleBtn.classList.add("hidden");
    });

    closeChatBtn.addEventListener("click", () => {
        chatbotContainer.classList.add("hidden");
        chatbotToggleBtn.classList.remove("hidden");
    });

    // Función para dibujar un nuevo mensaje
    function addMessage(text, sender) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("message");
        msgDiv.classList.add(sender === "user" ? "user-message" : "bot-message");
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Función principal para procesar y enviar el mensaje a n8n
    async function sendMessage() {
        const userText = chatInput.value.trim();
        if (userText === "") return;

        // 1. Mostrar mensaje del usuario
        addMessage(userText, "user");
        chatInput.value = "";

        // 2. Indicador de "Procesando..."
        const typingId = "typing-" + Date.now();
        const typingDiv = document.createElement("div");
        typingDiv.classList.add("message", "bot-message");
        typingDiv.setAttribute("id", typingId);
        typingDiv.innerHTML = "<em>Procesando...</em>";
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            // 3. Petición HTTPS a n8n (reemplazando la ruta /chat local)
            const response = await fetch("https://kevin-portafolio.duckdns.org/webhook/096d0b56-bacd-452e-8d6e-05ea41c2b3c8/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                // n8n espera "chatInput", no "message"
                body: JSON.stringify({ action: "sendMessage", chatInput: userText }) 
            });

            const data = await response.json();
            document.getElementById(typingId).remove();
            
            // n8n/Groq devuelve la respuesta en data.output
            if (data.output) {
                addMessage(data.output, "bot");
            } else if (data.text) {
                 addMessage(data.text, "bot");
            } else {
                addMessage("Recibí una respuesta vacía del servidor.", "bot");
            }

        } catch (error) {
            document.getElementById(typingId).remove();
            addMessage("Ups, hubo un problema al conectar con la IA.", "bot");
            console.error("Error Fetch:", error);
        }
    }

    // Listeners para enviar el mensaje
    btnSend.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });
});