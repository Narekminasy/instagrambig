const registerBtn = document.getElementById("registerBtn");
const errorRegister = document.getElementById("errorRegister");
const otpSection = document.getElementById("otpSection");

let isOtpStep = false;

registerBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    errorRegister.style.display = "none";

    const name = document.getElementById("name").value;
    const age = document.getElementById("age").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!isOtpStep) {
        if (!name || !email || !password) {
            errorRegister.textContent = "Please fill in all required fields.";
            errorRegister.style.display = "block";
            return;
        }

        try {
            registerBtn.textContent = "Sending code...";
            registerBtn.disabled = true;

            const response = await axios.post("/users/register", { name, age, email, password });

            document.getElementById("name").style.display = "none";
            document.getElementById("age").style.display = "none";
            document.getElementById("password").style.display = "none";
            document.querySelector(".form-box p").style.display = "none";

            otpSection.style.display = "block";
            registerBtn.textContent = "Verify Code";
            registerBtn.disabled = false;
            isOtpStep = true;

        } catch (err) {
            registerBtn.textContent = "Register";
            registerBtn.disabled = false;
            const errorMessage = err.response?.data?.message || "Registration failed. Try again.";
            errorRegister.textContent = errorMessage;
            errorRegister.style.display = "block";
        }
    }
    else {
        const code = document.getElementById("otpCode").value;

        if (!code || code.length !== 6) {
            errorRegister.textContent = "Please enter a valid 6-digit code.";
            errorRegister.style.display = "block";
            return;
        }

        try {
            registerBtn.textContent = "Verifying...";
            registerBtn.disabled = true;

            const verifyResponse = await axios.post('/users/verify-code', { email, code });

            if (verifyResponse.data.success) {
                window.location.href = "/users/login";
            }
        } catch (err) {
            registerBtn.textContent = "Verify Code";
            registerBtn.disabled = false;
            const errorMessage = err.response?.data?.message || "Invalid code. Please try again.";
            errorRegister.textContent = errorMessage;
            errorRegister.style.display = "block";
        }
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
    const langContent = document.querySelector('.lang-dropdown-content');
    if (langContent) {
        langContent.classList.remove('show');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('selectedLanguage') || 'hy';
    updateLanguage(savedLang);

    const langBtn = document.getElementById('currentLangBtn');
    const langContent = document.querySelector('.lang-dropdown-content');

    if (langBtn && langContent) {
        langBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            langContent.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!langContent.contains(e.target) && e.target !== langBtn) {
                langContent.classList.remove('show');
            }
        });
    }
});
