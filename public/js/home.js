const registerHome = document.getElementById("registerHome");
const loginHome = document.getElementById("loginHome");

registerHome.addEventListener("click", function (event) {
    window.location.href = "/users/register";
});

loginHome.addEventListener("click", function (event) {
    window.location.href = "/users/login";
});
