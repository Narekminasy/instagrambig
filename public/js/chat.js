const socket = io();

console.log("Չաթը միացավ բրաուզերում: Իմ ID =", myId, "| Ստացողի ID =", recipientId);

if (myId && myId !== "null") {
    socket.emit('registerUser', String(myId).trim());
}

const sendBtn = document.getElementById('sendBtn');
const messageInput = document.getElementById('messageInput');
const messagesList = document.getElementById('messages');
const statusDot = document.getElementById('status-dot');

// Նամակ ուղարկելու տրամաբանություն
if (sendBtn) {
    sendBtn.addEventListener('click', () => {
        const text = messageInput.value.trim();
        console.log("Կոճակը սեղմվեց։ Տեքստ =", text);

        if (text && recipientId) {
            socket.emit('private message', {
                senderId: myId,
                recipientId: String(recipientId).trim(),
                text: text
            });

            // Ավելացնում ենք մեր էկրանին
            const li = document.createElement('li');
            li.textContent = "Ես: " + text;
            li.style.background = "#e1ffb1";
            messagesList.appendChild(li);

            messageInput.value = '';
            messagesList.scrollTop = messagesList.scrollHeight;
        }
    });
}

// Լսում ենք դիմացինից եկող նամակները
socket.on('receive private', (data) => {
    console.log("Նոր նամակ ստացվեց սերվերից:", data);

    // Ցույց ենք տալիս էկրանին միայն եթե նամակը հենց այս ընթացիկ չաթից է
    if (String(data.senderId) === String(recipientId)) {
        const li = document.createElement('li');
        li.textContent = `Դիմացինը: ` + data.text;
        li.style.background = "#ffffff";
        messagesList.appendChild(li);
        messagesList.scrollTop = messagesList.scrollHeight;
    } else {
        console.log(`[BACKGROUND] Օգտատեր ${data.senderId}-ը նամակ ուղարկեց, բայց դու այլ չաթում ես:`);
    }
});

// Լսում ենք օնլայն/օֆլայն կարգավիճակները
socket.on("updateUserStatus", (onlineUsersList) => {
    console.log("Օնլայն օգտատերերի ցուցակը սերվերից:", onlineUsersList);

    if (statusDot) {
        const isRecipientOnline = onlineUsersList.includes(String(recipientId));

        if (isRecipientOnline) {
            statusDot.style.background = "#28a745"; // Կանաչ
            console.log(`Օգտատեր ${recipientId}-ը հիմա կապի մեջ է:`);
        } else {
            statusDot.style.background = "#dc3545"; // Կարմիր
            console.log(`Օգտատեր ${recipientId}-ը անջատեց կապը:`);
        }
    }
});
