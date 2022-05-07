// --- ԷԼԵՄԵՆՏՆԵՐԻ ՍԱՀՄԱՆՈՒՄ ---
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
const logoutBTN = document.getElementById('logoutBTN');

// Ինպուտների ID-ները profileForm-ի ճիշտ աշխատանքի համար
const firstNameInput = document.getElementById('firstname');
const lastNameInput = document.getElementById('lastname');

// Սկզբնական թաքցնում ենք կոնտեյներները
if (dropdownMenu) dropdownMenu.style.display = 'none';
if (editFormContainer) editFormContainer.style.display = 'none';
if (changePhotosContainer) changePhotosContainer.style.display = 'none';

// Խմբագրման ֆորմայի բացում / փակում
if (confirmBtn && editFormContainer) {
    confirmBtn.addEventListener('click', () => {
        editFormContainer.style.display = editFormContainer.style.display === 'none' ? 'block' : 'none';
    });
}

// Պրոֆիլի տվյալների ուղարկում (Confirm Profile)
if (profileForm) {
    profileForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const firstname = firstNameInput ? firstNameInput.value : '';
        const lastname = lastNameInput ? lastNameInput.value : '';
        const photoFile = document.getElementById('photoInput').files[0];
        const backgroundFile = document.getElementById('backgroundInput').files[0];
        const diplomyFile = document.getElementById('diplomyInput').files[0];
        const address = document.getElementById('address').value;
        const phone = document.getElementById('phone').value;

        const formData = new FormData();
        formData.append('firstname', firstname);
        formData.append('lastname', lastname);
        formData.append('address', address);
        formData.append('phone', phone);

        const filesArray = [];
        if (photoFile) filesArray.push(photoFile);
        if (backgroundFile) filesArray.push(backgroundFile);
        if (diplomyFile) filesArray.push(diplomyFile);

        filesArray.forEach((file) => {
            formData.append('image', file);
        });

        try {
            await axios.post('/confirm/confirm', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });

            profileForm.reset();
            if (editFormContainer) editFormContainer.style.display = 'none';
            alert('after 2 hours we are aswer your account if your diplom has not fake your account like been doooctors groupe')
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    });
}

// Որոնման մենյուի բացում / փակում
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
        if (container) container.classList.remove('menu-open');
    }
});

// Մենյուի կետերի ակտիվացում (Active Class)
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
    });
});

// Նկարների փոփոխման պատուհանի բացում
if (btnChangePhotos) {
    btnChangePhotos.addEventListener('click', (e) => {
        e.preventDefault();
        if (changePhotosContainer) {
            changePhotosContainer.style.display = changePhotosContainer.style.display === 'none' ? 'block' : 'none';
        }
        if (dropdownMenu) dropdownMenu.style.display = 'none';
    });
}

// Նկարների թարմացման ֆորմա (Update Photos)
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

// Պոստերի ջնջում (Delete Blog Post)
document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const postId = e.target.getAttribute("data-id");

        if (confirm("are you sure?")) {
            try {
                await axios.delete(`/posts/${postId}`, { withCredentials: true });
                const postElement = document.getElementById(`post-${postId}`);
                if (postElement) postElement.remove();
                window.location.reload();
            } catch (error) {
                console.error("can not delete", error.response?.data || error);
                alert(error.response?.data?.message || "Error");
            }
        }
    }
});

if (logoutBTN) {
    logoutBTN.addEventListener('click', async (e) => {
        e.preventDefault(); // Կանխում ենք հղման default աշխատանքը

        try {
            await axios.get('/users/logout', { withCredentials: true });

            window.location.href = "/users/login";
        } catch (error) {
            console.error("Logout error:", error);
            window.location.href = "/users/login";
        }
    });
}