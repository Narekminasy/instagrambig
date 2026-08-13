const confirmBtn = document.getElementById('confirmBtn');
const editFormContainer = document.getElementById('editFormContainer');
const profileForm = document.getElementById('profileForm');
const searchLinksBtn = document.getElementById('search_linsk');
const dropdownMenu = document.getElementById('dropdownMenu');
const profilePic = document.getElementById('profilePic');
const backgroundPic = document.getElementById('backgroundPic');
const btnChangePhotos = document.getElementById('btnChangePhotos');
const changePhotosContainer = document.getElementById('changePhotosContainer');
const changePhotosForm = document.getElementById('changePhotosForm');

const chatBtn = document.getElementById("chatBtn");
const chatWindow = document.getElementById("chatWindow");
const closeChat = document.getElementById("closeChat");

if (dropdownMenu) {
    dropdownMenu.style.display = 'none';
}
if (editFormContainer) {
    editFormContainer.style.display = 'none';
}
if (changePhotosContainer) {
    changePhotosContainer.style.display = 'none';
}

if (confirmBtn && editFormContainer) {
    confirmBtn.addEventListener('click', () => {
        editFormContainer.style.display = editFormContainer.style.display === 'none' ? 'block' : 'none';
    });
}

if (profileForm) {
    profileForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const firstname = document.getElementById('firstname').value;
        const lastname = document.getElementById('lastname').value;
        const photoFile = document.getElementById('photoInput').files[0];
        const backgroundFile = document.getElementById('backgroundInput').files[0];
        const diplomyFile = document.getElementById('diplomyInput').files[0];

        const formData = new FormData();
        formData.append('firstname', firstname);
        formData.append('lastname', lastname);

        const filesArray = [];
        if (photoFile) filesArray.push(photoFile);
        if (backgroundFile) filesArray.push(backgroundFile);
        if (diplomyFile) filesArray.push(diplomyFile);

        filesArray.forEach((file) => {
            formData.append('image', file);
        });

        try {
            await axios.post('/confirm/confirm', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
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

if (searchLinksBtn && dropdownMenu) {
    searchLinksBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        // 1. Բացում կամ փակում ենք մենյուն
        const isMenuHidden = dropdownMenu.style.display === 'none';
        dropdownMenu.style.display = isMenuHidden ? 'block' : 'none';

        // 2. Եթե մենյուն բացվում է, ավելացնում ենք menu-open դասը, հակառակ դեպքում՝ հանում ենք
        const container = document.querySelector('.users-container');
        if (container) {
            if (isMenuHidden) {
                container.classList.add('menu-open');
            } else {
                container.classList.remove('menu-open');
            }
        }
    });
}

document.addEventListener('click', (e) => {
    if (dropdownMenu && !dropdownMenu.contains(e.target) && e.target !== searchLinksBtn) {
        dropdownMenu.style.display = 'none';

        // Մենյուն փակելիս հանում ենք սեղմելու էֆեկտը
        const container = document.querySelector('.users-container');
        if (container) {
            container.classList.remove('menu-open');
        }
    }
});

document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
    });
});

if (btnChangePhotos) {
    btnChangePhotos.addEventListener('click', (e) => {
        e.preventDefault();
        if (changePhotosContainer) {
            changePhotosContainer.style.display = changePhotosContainer.style.display === 'none' ? 'block' : 'none';
        }
        if (dropdownMenu) {
            dropdownMenu.style.display = 'none';
        }
    });
}

if (changePhotosForm) {
    changePhotosForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const photoFile = document.getElementById('updatePhoto').files[0];
        const backgroundFile = document.getElementById('updateBackground').files[0];

        if (!photoFile && !backgroundFile) return;

        const formData = new FormData();
        const filesArray = [];

        if (photoFile) filesArray.push(photoFile);
        if (backgroundFile) filesArray.push(backgroundFile);

        filesArray.forEach((file) => {
            formData.append('image', file);
        });

        try {
            await axios.post('/confirm/updatePhotos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
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

document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const postId = e.target.getAttribute("data-id");

        if (confirm("are you sure?")) {
            try {
                const response = await axios.delete(`/posts/${postId}`, {
                    withCredentials: true
                });
                const postElement = document.getElementById(`post-${postId}`);
                if (postElement) {
                    postElement.remove();
                }

                console.log(response.data.message);

                location.reload();
            } catch (error) {
                // console.error("can not delete", error);
                // alert("false");
                console.error("can not delete", error.response?.data || error);

                alert(
                    error.response?.data?.message ||
                    "Error"
                );
            }
        }
    }
});

chatBtn.addEventListener("click", () => {
    chatWindow.classList.add("active");
    chatBtn.style.display = "none";
});

closeChat.addEventListener("click", () => {
    chatWindow.classList.remove("active");
    chatBtn.style.display = "flex";
});
