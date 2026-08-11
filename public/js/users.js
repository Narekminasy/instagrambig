// 1. DOM էլեմենտների հայտարարում
const confirmBtn = document.getElementById('confirmBtn');
const editFormContainer = document.getElementById('editFormContainer');
const profileForm = document.getElementById('profileForm');
const searchLinksBtn = document.getElementById('search_linsk');
const dropdownMenu = document.getElementById('dropdownMenu');
const btnAllUsers = document.getElementById('btnAllUsers');
const btnAllProfiles = document.getElementById('btnAllProfiles');

const profilePic = document.getElementById('profilePic');
const backgroundPic = document.getElementById('backgroundPic');

// 2. Սկզբնական թաքցնումներ (ստուգումով, որ սխալ չտա)
if (dropdownMenu) {
    dropdownMenu.style.display = 'none';
}
if (editFormContainer) {
    editFormContainer.style.display = 'none';
}

// 3. Confirm Profile կոճակի սեղմումը
if (confirmBtn && editFormContainer) {
    confirmBtn.addEventListener('click', () => {
        editFormContainer.style.display = editFormContainer.style.display === 'none' ? 'block' : 'none';
    });
}

// 4. Ֆորմայի Submit (Տվյալների ուղարկում)
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
            const response = await axios.post('/confirm/confirm', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true // Սա թույլ է տալիս cookie-ն ուղարկել POST հարցման ժամանակ
            });

            alert('Տվյալները հաջողությամբ ուղարկվեցին։');

            profileForm.reset();
            if (editFormContainer) editFormContainer.style.display = 'none';

            window.location.reload();

        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 409) {
                alert(`${error.response.data.message}`);
            } else {
                alert('server error');
            }
        }
    });
}

// 5. «...» երեք կետով կոճակի սեղմումը (Մենյուի բացում)
if (searchLinksBtn && dropdownMenu) {
    searchLinksBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
    });
}

// 6. Էկրանի ցանկացած այլ տեղ սեղմելիս մենյուն ավտոմատ կփակվի
document.addEventListener('click', () => {
    if (dropdownMenu) {
        dropdownMenu.style.display = 'none';
    }
});

if (btnAllUsers) {
    btnAllUsers.addEventListener('click', async () => {
        try {
            const response = await axios.get('/confirm/all-users', {
                withCredentials: true
            });
            console.log('All Users:', response.data);
        } catch (error) {
            console.error(error);
        }
    });
}

// 8. «All Profiles» կոճակի հարցումը - ՈՒՂՂՎԱԾ ՏԱՐԲԵՐԱԿ
if (btnAllProfiles) {
    btnAllProfiles.addEventListener('click', async () => {
        try {
            // const response = await axios.get('/confirm/all-users-progile', {
            //     withCredentials: true
            // });
            // console.log('All Profiles:', response);

            window.location.href = "/users/index";
        } catch (error) {
            console.error(error);
        }
    });
}
