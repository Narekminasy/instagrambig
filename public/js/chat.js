const socket = io();

if (myId && myId !== "null") {
    socket.emit('registerUser', String(myId).trim());
}

const sendBtn = document.getElementById('sendBtn');
const messageInput = document.getElementById('messageInput');
const messagesList = document.getElementById('messages');
const statusDot = document.getElementById('status-dot');

if (sendBtn) {
    sendBtn.addEventListener('click', () => {
        const text = messageInput.value.trim();
        if (text && recipientId) {
            socket.emit('private message', {
                senderId: myId,
                recipientId: String(recipientId).trim(),
                text: text
            });

            const li = document.createElement('li');
            li.textContent = myName + ": " + text;
            li.style.background = "#e1ffb1";
            messagesList.appendChild(li);

            messageInput.value = '';
            messagesList.scrollTop = messagesList.scrollHeight;
        }
    });
}

socket.on('receive private', (data) => {
    if (String(data.senderId) === String(recipientId)) {
        const li = document.createElement('li');
        li.textContent = recipientName + ": " + data.text;
        li.style.background = "#ffffff";
        messagesList.appendChild(li);
        messagesList.scrollTop = messagesList.scrollHeight;
    } else {
        console.log('message send');
    }
});

socket.on("updateUserStatus", (onlineUsersList) => {
    if (statusDot) {
        const isRecipientOnline = onlineUsersList.includes(String(recipientId));

        if (isRecipientOnline) {
            statusDot.style.background = "#28a745";
        } else {
            statusDot.style.background = "#dc3545";
        }
    }
});

messagesList.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete-btn')) {
        const button = event.target;
        const messageId = button.getAttribute('data-id');

        const result = await Swal.fire({
            title: "Delete message?",
            text: "Do you want to permanently delete this message?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.delete(`/users/${messageId}`);
                const liElement = document.getElementById(`msg-${messageId}`);
                if (liElement) {
                    liElement.remove();
                }

                Swal.fire({
                    title: "Deleted!",
                    text: response.data?.message || "Message removed successfully.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });

            } catch (error) {
                console.error(error);

                Swal.fire({
                    title: "Error!",
                    text: error.response?.data?.message || "Something went wrong on the server.",
                    icon: "error"
                });
            }
        }
    }
});


