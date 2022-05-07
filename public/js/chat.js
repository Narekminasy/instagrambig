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
// Լսում ենք սեղմումները ամբողջ messages ցուցակի վրա (Event Delegation)
messagesList.addEventListener('click', async (event) => {
    // Ստուգում ենք՝ արդյոք սեղմվել է հենց ջնջելու կոճակը
    if (event.target.classList.contains('delete-btn')) {
        const button = event.target;
        const messageId = button.getAttribute('data-id'); // Վերցնում ենք նամակի ID-ն

        console.log("Փորձում եմ Axios-ով բազայից ջնջել նամակ ID՝", messageId);

        if (confirm("Ցանկանո՞ւմ եք ջնջել այս հաղորդագրությունը:")) {
            try {
                const response = await axios.delete(`/users/${messageId}`);

                // Axios-ի դեպքում պատասխանը ավտոմատ գտնվում է response.data օբյեկտի մեջ
                console.log("🚀 Սերվերի պատասխանը՝", response.data.add);

                // Գտնում ենք նամակի տողը (li) էկրանին և ջնջում այն
                const liElement = document.getElementById(`msg-${messageId}`);
                if (liElement) {
                    liElement.remove();
                }

            } catch (error) {
                console.error("❌ Սխալ՝ նամակը ջնջելիս:", error);

                if (error.response && error.response.data) {
                    alert(error.response.data.message || "Չհաջողվեց ջնջել նամակը:");
                } else {
                    alert("Կապի սխալ: Խնդրում ենք փորձել նորից:");
                }
            }
        }
    }
});
