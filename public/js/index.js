const createBtn = document.getElementById("create-btn");
const sendBtns = document.querySelectorAll(".send-btn");


createBtn.addEventListener("click", async (e) => {
    try {
        e.preventDefault();


        const titleVal = document.getElementById("titleInp").value;
        const descriptionVal = document.getElementById("descriptionInp").value;

        const imageInput = document.getElementById("imageInp");
        const imageFile = imageInput.files[0];

        const formData = new FormData();
        formData.append("title", titleVal);
        formData.append("description", descriptionVal);

        if (imageFile) {
            formData.append("image", imageFile);
        }

        const response = await axios.post('/posts/posts', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });



        alert('Successfully created posts.');
        location.reload();
    } catch (error) {
        console.log(error);
        alert('Something went wrong!');
    }
});

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

sendBtns.forEach((btn) => {

    btn.addEventListener("click", async (e) => {

        const postId = e.target.dataset.id;

        const input = document.querySelector(
            `.commnetsInp[data-id="${postId}"]`
        );

        const message = input.value;

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

        } catch (error) {
            console.log(error.response?.data || error);
        }

    });

});


