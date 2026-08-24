//div
const loginSection = document.getElementById("loginSection");
const forgotSection = document.getElementById("forgotSection");

//buttons
const loginBtn = document.getElementById("loginBtn");
const forgotBtn = document.getElementById("forgot");
const forgotSubmitBtn = document.getElementById("forgotSubmitBtn");
const backToLoginBtn = document.getElementById("backToLoginBtn");
const errorLogin = document.getElementById("errorLogin");
const errorForgot = document.getElementById("errorForgot");

loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    errorLogin.style.display = "none";

    try {
        const response = await axios.post(
            "/users/login",
            {
                email,
                password
            }
        );
        console.log(response.data);
        window.location.href = "/users/users";
    } catch (error) {
        console.log(error.response?.data);
        errorLogin.textContent = errorLogin.textContent = error.response?.data?.error || "Incorrect email or password";
        errorLogin.style.display = "block";
    }
});

forgotBtn.addEventListener("click", () => {
    loginSection.style.display = "none";
    forgotSection.style.display = "block";
    errorForgot.style.display = "none";
});

backToLoginBtn.addEventListener("click", () => {
    forgotSection.style.display = "none";
    loginSection.style.display = "block";
    errorLogin.style.display = "none";
});

forgotSubmitBtn.addEventListener("click", async () => {
    errorForgot.style.display = "none";

    try {
        const email = document.getElementById("forgotEmail").value;
        const password = document.getElementById("newPasswordInput").value;

        if (!email || !password) {
            alert("please enter valid email or new password");
            return;
        }

        const response = await axios.post('/users/forgot-password', {
            email: email,
            newPassword: password
        });

        if (response.data.success) {
            forgotSection.style.display = "none";
            loginSection.style.display = "block";
        }
    } catch (error) {
        console.log(error);
        errorForgot.textContent = error.response?.data?.error || "Email not found or invalid";
        errorForgot.style.display = "block";
    }
});
