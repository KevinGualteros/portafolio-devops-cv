document.addEventListener("DOMContentLoaded", () => {
    // Referencias a los elementos del DOM (HTML)
    const chatInput = document.getElementById("chat-input");
    const btnSend = document.getElementById("btn-send-chat");
    const chatMessages = document.getElementById("chat-messages");
    
    // --- NUEVO: Referencias para ocultar/mostrar ---
    const chatbotContainer = document.getElementById("chatbot-container");
    const chatbotToggleBtn = document.getElementById("chatbot-toggle-btn");
    const closeChatBtn = document.getElementById("close-chat-btn");

    // --- NUEVO: Lógica de los botones ---
    chatbotToggleBtn.addEventListener("click", () => {
        // Al hacer clic en el botón flotante, mostramos el chat y ocultamos el botón
        chatbotContainer.classList.remove("hidden");
        chatbotToggleBtn.classList.add("hidden");
    });

    closeChatBtn.addEventListener("click", () => {
        // Al hacer clic en la X, ocultamos el chat y mostramos el botón flotante
        chatbotContainer.classList.add("hidden");
        chatbotToggleBtn.classList.remove("hidden");
    });
    // -----------------------------------------------

    // ... (El resto de tus funciones addMessage y sendMessage se quedan exactamente igual) ...


    // Función para dibujar un nuevo mensaje en la ventana del chat
    function addMessage(text, sender) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("message");
        
        if (sender === "user") {
            msgDiv.classList.add("user-message");
        } else {
            msgDiv.classList.add("bot-message");
        }
        
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        
        // Hacer scroll automático hacia abajo para ver el último mensaje
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Función principal para procesar y enviar el mensaje
    async function sendMessage() {
        const userText = chatInput.value.trim();
        if (userText === "") return; // No enviar mensajes vacíos

        // 1. Mostrar el mensaje del usuario en la pantalla
        addMessage(userText, "user");
        chatInput.value = ""; // Limpiar la caja de texto

        // 2. Crear y mostrar un indicador temporal de "Pensando..."
        const typingId = "typing-" + Date.now();
        const typingDiv = document.createElement("div");
        typingDiv.classList.add("message", "bot-message");
        typingDiv.setAttribute("id", typingId);
        typingDiv.innerHTML = "<em>Procesando en el backend...</em>";
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            // 3. Enviar la petición asíncrona (Fetch) a nuestro servidor Python
            // Esta ruta "/chat" la crearemos en app.py en la Fase 5
            const response = await fetch("/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: userText })
            });

            const data = await response.json();
            
            // 4. Borrar el mensaje de "Pensando..." y mostrar la respuesta real de la IA
            document.getElementById(typingId).remove();
            
            if (data.reply) {
                addMessage(data.reply, "bot");
            } else {
                addMessage("Recibí una respuesta inesperada del servidor.", "bot");
            }

        } catch (error) {
            // Si el servidor de Python no está encendido o hay un error de red
            document.getElementById(typingId).remove();
            addMessage("Ups, mi servidor backend en Flask está apagado o la ruta no existe todavía. ¡Actívalo para hablar conmigo!", "bot");
        }
    }

    // Escuchar el clic en el botón "Enviar"
    btnSend.addEventListener("click", sendMessage);

    // Permitir enviar el mensaje presionando la tecla "Enter"
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });
});