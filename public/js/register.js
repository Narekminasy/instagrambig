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
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('selectedLanguage') || 'hy';
    updateLanguage(savedLang);
});
