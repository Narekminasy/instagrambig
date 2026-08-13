
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

        // Վերցնում ենք checkbox-ի վիճակը (true կամ false)
        const isApparatusChecked = document.getElementById("isApparatusInp").checked;

        const formData = new FormData();
        formData.append("title", titleVal);
        formData.append("description", descriptionVal);
        formData.append("isApparatus", isApparatusChecked); // ԱՅՍՏԵՂ ՈՒՂԱՐԿՎՈՒՄ Է ԲԱԶԱ

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


// Ջնջում ենք հին սխալ տողը վերևից, իսկ ներքևի document.addEventListener-ի մեջ ավելացնում ենք սա.

document.addEventListener("click", async (e) => {
    // Ստուգում ենք՝ արդյոք սեղմված տարրը մեկնաբանության ջնջման կոճակն է
    if (e.target.classList.contains("delteComment_Btn")) {
        try {
            console.log('Ջնջման հարցում...');

            const commentId = e.target.dataset.id;

            const response = await axios.delete(`/comments/${commentId}`);

            alert('Մեկնաբանությունը հաջողությամբ ջնջվեց:');

            const commentElement = e.target.closest(".comments_look");
            if (commentElement) {
                commentElement.remove();
            } else {
                location.reload();
            }

        } catch (error) {
            console.error("Չհաջողվեց ջնջել մեկնաբանությունը", error.response?.data || error);
            alert(error.response?.data?.message || "Տեղի է ունեցել սխալ։");
        }
    }
});
