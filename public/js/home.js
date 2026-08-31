const registerHome = document.getElementById("registerHome");
const loginHome = document.getElementById("loginHome");

registerHome.addEventListener("click", function (event) {
    window.location.href = "/users/register";
});

loginHome.addEventListener("click", function (event) {
    window.location.href = "/users/login";
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
