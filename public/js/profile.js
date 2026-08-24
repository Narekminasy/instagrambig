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
