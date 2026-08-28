const createBtn = document.getElementById("create-btn");
const sendBtns = document.querySelectorAll(".send-btn");
const delteCommnetBtn = document.querySelectorAll(".delteComment_Btn");

createBtn.addEventListener("click", async (e) => {
    try {
        e.preventDefault();

        const titleVal = document.getElementById("titleInp").value;
        const descriptionVal = document.getElementById("descriptionInp").value;

        const imageInput = document.getElementById("imageInp");
        const imageFile = imageInput.files[0];

        const isApparatusChecked = document.getElementById("isApparatusInp").checked;

        const formData = new FormData();
        formData.append("title", titleVal);
        formData.append("description", descriptionVal);
        formData.append("isApparatus", isApparatusChecked);

        if (imageFile) {
            formData.append("image", imageFile);
        }

        const response = await axios.post('/posts/posts', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        await Swal.fire({
            title: "Success!",
            text: "Post created successfully.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
        });

        location.reload();
    } catch (error) {
        console.log(error);
        Swal.fire({
            title: "Error!",
            text: error.response?.data?.message || "Failed to create post.",
            icon: "error"
        });
    }
});

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

                console.log(response.data.message);

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

sendBtns.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
        const postId = e.target.dataset.id;
        const input = document.querySelector(`.commnetsInp[data-id="${postId}"]`);
        const message = input.value;

        if (!message.trim()) return;

        console.log("POST ID:", postId);
        console.log("MESSAGE:", message);

        try {
            const response = await axios.post("/comments/comments", {
                postId: postId,
                message: message
            }, {
                withCredentials: true
            });

            console.log(response.data);
            input.value = "";

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
    });
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
