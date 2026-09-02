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
const deleteLink = document.getElementById('btnDeleteUser');

const firstNameInput = document.getElementById('firstname');
const lastNameInput = document.getElementById('lastname');

if (dropdownMenu) dropdownMenu.style.display = 'none';
if (editFormContainer) editFormContainer.style.display = 'none';
if (changePhotosContainer) changePhotosContainer.style.display = 'none';

if (confirmBtn && editFormContainer) {
    confirmBtn.addEventListener('click', () => {
        editFormContainer.style.display = editFormContainer.style.display === 'none' ? 'block' : 'none';
    });
}

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

            await Swal.fire({
                title: "Application Received!",
                text: "We will review your account credentials within 2 hours. Once your diploma is verified, you will be added to the doctors group.",
                icon: "success"
            });

            window.location.reload();
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: "Submission Failed",
                text: error.response?.data?.message || "Could not submit your application. Please check your data.",
                icon: "error"
            });
        }
    });
}

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

document.addEventListener('click', (e) => {
    if (dropdownMenu && !dropdownMenu.contains(e.target) && e.target !== searchLinksBtn) {
        dropdownMenu.style.display = 'none';
        const container = document.querySelector('.users-container');
        if (container) container.classList.remove('menu-open');
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
        if (dropdownMenu) dropdownMenu.style.display = 'none';
    });
}

if (changePhotosForm) {
    changePhotosForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const photoFile = document.getElementById('updatePhoto').files[0];
        const backgroundFile = document.getElementById('updateBackground').files[0];

        if (!photoFile && !backgroundFile) {
            Swal.fire({
                title: "Info",
                text: "Please select at least one image to update.",
                icon: "info"
            });
            return;
        }

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

            await Swal.fire({
                title: "Updated!",
                text: "Your photos have been successfully updated.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });

            window.location.reload();
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to update photos.",
                icon: "error"
            });
        }
    });
}

document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const postId = e.target.getAttribute("data-id");

        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover this post!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/posts/${postId}`, { withCredentials: true });
                const postElement = document.getElementById(`post-${postId}`);
                if (postElement) postElement.remove();

                await Swal.fire({
                    title: "Deleted!",
                    text: "The post has been deleted.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error("can not delete", error.response?.data || error);
                Swal.fire({
                    title: "Error!",
                    text: error.response?.data?.message || "Failed to delete post.",
                    icon: "error"
                });
            }
        }
    }
});

if (logoutBTN) {
    logoutBTN.addEventListener('click', async (e) => {
        e.preventDefault();

        const result = await Swal.fire({
            title: "Logout?",
            text: "Are you sure you want to log out of your account?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, log out",
            cancelButtonText: "Stay logged in"
        });

        if (result.isConfirmed) {
            try {
                await axios.get('/users/logout', { withCredentials: true });
                window.location.href = "/users/login";
            } catch (error) {
                console.error("Logout error:", error);
                window.location.href = "/users/login";
            }
        }
    });
}

let translations = {};

async function updateLanguage(lang) {
    document.documentElement.lang = lang;
    localStorage.setItem('selectedLanguage', lang);

    try {
        const response = await axios.get(`/locales/${lang}.json`);
        translations = response.data;

        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations && translations[key]) {
                element.textContent = translations[key];
            }
        });

        const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
        placeholders.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (translations && translations[key]) {
                element.setAttribute('placeholder', translations[key]);
            }
        });

        const currentLangBtn = document.getElementById('currentLangBtn');
        if (currentLangBtn) {
            currentLangBtn.textContent = `🌐 ${lang.toUpperCase()}`;
        }

    } catch (error) {
        console.error(error);
    }
}

function changeLanguage(lang) {
    updateLanguage(lang);
    const langContent = document.querySelector('.lang-dropdown-content');
    if (langContent) {
        langContent.classList.remove('show');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('selectedLanguage') || 'hy';
    updateLanguage(savedLang);

    const langBtn = document.getElementById('currentLangBtn');
    const langContent = document.querySelector('.lang-dropdown-content');

    if (langBtn && langContent) {
        langBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            langContent.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!langContent.contains(e.target) && e.target !== langBtn) {
                langContent.classList.remove('show');
            }
        });
    }
});

if (deleteLink) {
    deleteLink.addEventListener('click', async (e) => {
        e.preventDefault();

        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will not be able to recover your account!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.post('/users/secure-remove-my-account', {}, { withCredentials: true });


                if (response.status === 200 || response.data.success) {
                    await Swal.fire({
                        title: "Deleted!",
                        text: "Your account has been deleted.",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false
                    });
                    window.location.href = "/users/login";
                }
            } catch (error) {
                console.error("Axios error logs:", error);
                const serverErrorMessage = error.response?.data?.message || "Failed to delete account.";
                Swal.fire({
                    title: "Error!",
                    text: `${serverErrorMessage} (Status: ${error.response?.status})`,
                    icon: "error"
                });
            }
        }
    });
}
