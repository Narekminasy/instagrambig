console.log("register.js loaded");

const registerBtn = document.getElementById("registerBtn");
const errorRegister = document.getElementById("errorRegister");

registerBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    errorRegister.style.display = "none";

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

        window.location.href = "/users/login";
    } catch (err) {
        console.log(err.response?.data);
        errorRegister.textContent = err.response?.data?.error || "Registration failed. Please try again.";
        errorRegister.style.display = "block";
    }
});
