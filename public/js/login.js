// 1. Էջի բլոկների (div) էլեմենտները
const loginSection = document.getElementById("loginSection");
const forgotSection = document.getElementById("forgotSection");

// 2. Կոճակները
const loginBtn = document.getElementById("loginBtn");
const forgotBtn = document.getElementById("forgot"); // Ձեր "forgot password?" կոճակը loginSection-ում
const forgotSubmitBtn = document.getElementById("forgotSubmitBtn"); // Կոճակը forgotSection-ում
const backToLoginBtn = document.getElementById("backToLoginBtn"); // Back կոճակը forgotSection-ում

// --- ԼՈԳԻՆԻ ՏՐԱՄԱԲԱՆՈՒԹՅՈՒՆԸ ---
loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await axios.post(
            "/users/login",
            {
                email,
                password
            }
        );
        console.log(response.data);
        alert("Login success");
        window.location.href = "/users/users";
    } catch (error) {
        console.log(error.response?.data);
        alert("Login error");
    }
});

// --- ԷԿՐԱՆՆԵՐԻ ՓՈՓՈԽՈՒԹՅՈՒՆԸ (TOGGLING) ---

// Երբ սեղմում են "forgot password?" կոճակին, բացվում են նոր input-ները
forgotBtn.addEventListener("click", () => {
    loginSection.style.display = "none";
    forgotSection.style.display = "block";
});

// Երբ սեղմում են "Back to Login", վերադառնում են սկզբնական էջին
backToLoginBtn.addEventListener("click", () => {
    forgotSection.style.display = "none";
    loginSection.style.display = "block";
});

forgotSubmitBtn.addEventListener("click", async () => {
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
            alert("confirm new password");

            forgotSection.style.display = "none";
            loginSection.style.display = "block";
        }
    } catch (error) {
        console.log(error);
        alert("An error occurred while resetting the password");
    }
});
