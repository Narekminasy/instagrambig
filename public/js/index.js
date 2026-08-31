const createBtn = document.getElementById("create-btn");
const sendBtns = document.querySelectorAll(".send-btn");

if (createBtn) {
    createBtn.addEventListener("click", async (e) => {
        try {
            e.preventDefault();

            const titleVal = document.getElementById("titleInp").value;
            const descriptionVal = document.getElementById("descriptionInp").value;
            const imageInput = document.getElementById("imageInp");
            const imageFile = imageInput ? imageInput.files[0] : null;
            const isApparatusChecked = document.getElementById("isApparatusInp").checked;

            const formData = new FormData();
            formData.append("title", titleVal);
            formData.append("description", descriptionVal);
            formData.append("isApparatus", isApparatusChecked);

            if (imageFile) {
                formData.append("image", imageFile);
            }

            const response = await axios.post('/posts/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            await Swal.fire({
                title: "Success!",
                text: "Post created successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });

            location.reload();

            document.getElementById("titleInp").value = "";
            document.getElementById("descriptionInp").value = "";
            if (imageInput) imageInput.value = "";
            document.getElementById("isApparatusInp").checked = false;

        } catch (error) {
            console.log(error);
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to create post.",
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
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.delete(`/posts/${postId}`, {
                    withCredentials: true
                });

                const postElement = document.getElementById(`post-${postId}`);
                if (postElement) {
                    postElement.remove();
                }

                Swal.fire({
                    title: "Deleted!",
                    text: response.data.message || "The post has been deleted.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error("can not delete", error.response?.data || error);
                Swal.fire({
                    title: "Error!",
                    text: error.response?.data?.message || "Something went wrong.",
                    icon: "error"
                });
            }
        }
    }
});

document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("send-btn")) {
        e.preventDefault();

        const postId = e.target.dataset.id;
        const input = document.querySelector(`.commnetsInp[data-id="${postId}"]`);
        const message = input.value;

        if (!message.trim()) return;

        try {
            const response = await axios.post("/comments/comments", {
                postId: postId,
                message: message
            }, {
                withCredentials: true
            });

            input.value = "";

            const postItem = document.getElementById(`post-${postId}`);
            const commentsList = postItem.querySelector(".comments-list");

            if (commentsList) {
                if (commentsList.innerText.includes("No comments yet.")) {
                    commentsList.innerHTML = "";
                }

                const newCommentHtml = `
                    <div class="comments_look">
                        <span class="comment-user-info">
                            <strong>you</strong>
                            <strong>🕒</strong>
                        </span>
                        <p class="comment-text">${message}</p>
                    </div>
                `;
                commentsList.insertAdjacentHTML('beforeend', newCommentHtml);
            }

            Swal.fire({
                title: "Posted!",
                text: "Your comment has been added.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.log(error.response?.data || error);
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to add comment.",
                icon: "error"
            });
        }
    }
});


document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delteComment_Btn")) {
        const commentId = e.target.dataset.id;

        const result = await Swal.fire({
            title: "Delete comment?",
            text: "This comment will be removed.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete",
            cancelButtonText: "Cancel"
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.delete(`/comments/${commentId}`);

                const commentElement = e.target.closest(".comments_look");
                if (commentElement) {
                    commentElement.remove();
                }

                Swal.fire({
                    title: "Deleted!",
                    text: response.data.message || "Comment removed.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error(error.response?.data || error);
                Swal.fire({
                    title: "Error!",
                    text: error.response?.data?.message || "An error occurred.",
                    icon: "error"
                });
            }
        }
    }
});

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
