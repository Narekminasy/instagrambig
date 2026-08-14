const socket = io();

const myId = prompt("Գրիր ՔՈ ID-ն (օրինակ՝ 1 կամ 2).");
const recipientId = prompt("Գրիր ՍՏԱՑՈՂԻ ID-ն (օրինակ՝ 2 կամ 1).");

if (myId) {
    socket.emit("registerUser", Number(myId));
}

const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const messagesList = document.getElementById("messages");

sendBtn.addEventListener("click", () => {
    const text = messageInput.value.trim();
    if (text) {

        socket.emit("private message", {
            recipientId: recipientId,
            text: text
        });

        const li = document.createElement("li");
        li.textContent = "Ես em: " + text;
        messagesList.appendChild(li);

        messageInput.value = "";
    }
});

// 5. Լսում ենք սերվերից եկող անձնական նամակները
socket.on("receive private", (data) => {
    const li = document.createElement("li");
    li.textContent = "Դիմացինը գրեց: " + data.text;
    messagesList.appendChild(li);
});
