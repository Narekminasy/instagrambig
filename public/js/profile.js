const searchInput = document.getElementById('search-input');

searchInput.addEventListener('input', function(event) {

    const text = event.target.value.toLowerCase();

    const cards = document.querySelectorAll('.user-card');

    cards.forEach(function(card) {
        const name = card.querySelector('.user-fullname').textContent.toLowerCase();
        if (name.includes(text)) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
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
