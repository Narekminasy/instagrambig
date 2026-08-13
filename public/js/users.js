// 1. Էլեմենտների հայտարարում (առանց կրկնությունների)
const confirmBtn = document.getElementById('confirmBtn');
const editFormContainer = document.getElementById('editFormContainer');
const profileForm = document.getElementById('profileForm');
const searchLinksBtn = document.getElementById('search_linsk'); // Ստուգիր տառասխալը (search_links?)
const dropdownMenu = document.getElementById('dropdownMenu');
const profilePic = document.getElementById('profilePic');
const backgroundPic = document.getElementById('backgroundPic');
const btnChangePhotos = document.getElementById('btnChangePhotos');
const changePhotosContainer = document.getElementById('changePhotosContainer');
const changePhotosForm = document.getElementById('changePhotosForm');

const chatBtn = document.getElementById("chatBtn");
const chatWindow = document.getElementById("chatWindow");
const closeChat = document.getElementById("closeChat");
const messageInput = document.getElementById("messageInput");
const sendMessageBtn = document.getElementById("sendMessageBtn");
const chatBody = document.querySelector(".chat-body");

const socket = typeof io === "function" ? io() : null; // Ապահովության համար

// 2. Սկզբնական վիճակների սահմանում
if (dropdownMenu) dropdownMenu.style.display = 'none';
if (editFormContainer) editFormContainer.style.display = 'none';
if (changePhotosContainer) changePhotosContainer.style.display = 'none';

// 3. Իրադարձությունների կառավարում (Events)

// Պրոֆիլի խմբագրման պատուհանի բացում/փակում
if (confirmBtn && editFormContainer) {
    confirmBtn.addEventListener('click', () => {
        editFormContainer.style.display = editFormContainer.style.display === 'none' ? 'block' : 'none';
    });
}

// Պրոֆիլի ֆորմայի ուղարկում (Axios)
if (profileForm) {
    profileForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const firstname = document.getElementById('firstname')?.value || '';
        const lastname = document.getElementById('lastname')?.value || '';
        const photoFile = document.getElementById('photoInput')?.files[0];
        const backgroundFile = document.getElementById('backgroundInput')?.files[0];
        const diplomyFile = document.getElementById('diplomyInput')?.files[0];

        const formData = new FormData();
        formData.append('firstname', firstname);
        formData.append('lastname', lastname);

        const filesArray = [photoFile, backgroundFile, diplomyFile].filter(Boolean);
        filesArray.forEach(file => {
            formData.append('image', file);
        });

        try {
            await axios.post('/confirm/confirm', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            profileForm.reset();
            if (editFormContainer) editFormContainer.style.display = 'none';
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    });
}

// Որոնման մենյուի բացում/փակում
if (searchLinksBtn && dropdownMenu) {
    searchLinksBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isMenuHidden = dropdownMenu.style.display === 'none';
        dropdownMenu.style.display = isMenuHidden ? 'block' : 'none';

        const container = document.querySelector('.users-container');
        if (container) {
            container.classList.toggle('menu-open', isMenuHidden);
        }
    });
}

// Մենյուից դուրս սեղմելիս փակել այն
document.addEventListener('click', (e) => {
    if (dropdownMenu && !dropdownMenu.contains(e.target) && e.target !== searchLinksBtn) {
        dropdownMenu.style.display = 'none';
        const container = document.querySelector('.users-container');
        if (container) {
            container.classList.remove('menu-open');
        }
    }
});

// Մենյուի էլեմենտների active դասի փոփոխում
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
    });
});

// Նկարների փոփոխման պատուհանի ցուցադրում
if (btnChangePhotos) {
    btnChangePhotos.addEventListener('click', (e) => {
        e.preventDefault();
        if (changePhotosContainer) {
            changePhotosContainer.style.display = changePhotosContainer.style.display === 'none' ? 'block' : 'none';
        }
        if (dropdownMenu) dropdownMenu.style.display = 'none';
    });
}

// Նկարների ֆորմայի ուղարկում
if (changePhotosForm) {
    changePhotosForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const photoFile = document.getElementById('updatePhoto')?.files[0];
        const backgroundFile = document.getElementById('updateBackground')?.files[0];

        if (!photoFile && !backgroundFile) return;

        const formData = new FormData();
        const filesArray = [photoFile, backgroundFile].filter(Boolean);
        filesArray.forEach(file => {
            formData.append('image', file);
        });

        try {
            await axios.post('/confirm/updatePhotos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            changePhotosForm.reset();
            if (changePhotosContainer) changePhotosContainer.style.display = 'none';
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    });
}

// Փոստի ջնջում (Global click listener)
document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const postId = e.target.getAttribute("data-id");
        if (confirm("Are you sure?")) {
            try {
                const response = await axios.delete(`/posts/${postId}`, { withCredentials: true });
                const postElement = document.getElementById(`post-${postId}`);
                if (postElement) postElement.remove();
                console.log(response.data.message);
                window.location.reload();
            } catch (error) {
                console.error("Can not delete", error.response?.data || error);
                alert(error.response?.data?.message || "Error");
            }
        }
    }
});

// Չաթի պատուհանի կառավարում (Անվտանգ ստուգումներով)
if (chatBtn && chatWindow) {
    chatBtn.addEventListener("click", () => {
        chatWindow.classList.add("active");
        chatBtn.style.display = "none";
    });
}

if (closeChat && chatWindow && chatBtn) {
    closeChat.addEventListener("click", () => {
        chatWindow.classList.remove("active");
        chatBtn.style.display = "flex";
    });
}

// Հաղորդագրություն ուղարկելու տրամաբանություն
if (sendMessageBtn && messageInput && socket) {
    sendMessageBtn.addEventListener("click", () => {
        const message = messageInput.value.trim();
        if (!message) return;
        socket.emit("sendMessage", message);
        messageInput.value = ""; // Մաքրում ենք input-ը ուղարկելուց հետո
    });
}
