const loginBtn = document.getElementById("loginBtn");

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
        window.location.href = "/users/index";
    } catch (error) {
        console.log(error.response?.data);
        alert("Login error");
    }
});