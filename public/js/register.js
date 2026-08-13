console.log("register.js loaded");

const registerBtn = document.getElementById("registerBtn");

registerBtn.addEventListener("click", async (e) => {
    const name = document.getElementById("name").value;

    const age = document.getElementById("age").value;

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;

    try {
        const response = await axios.post("/users/register", {
            name,
            age,
            email,
            password,
        });


        alert("register successfully");
        window.location.href = "/users/login";
    }catch(err) {
        console.log(err);
        alert("Error");
    }


})
