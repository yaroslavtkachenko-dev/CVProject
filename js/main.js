// Захист Email
document.addEventListener('DOMContentLoaded', function() {
    const user = 'your-login';
    const domain = 'your-domain.com';
    const emailLink = document.getElementById('email-link');
    if (emailLink) {
        emailLink.setAttribute('href', 'mailto:' + user + '@' + domain);
    }
});

// Ініціалізація анімацій
AOS.init({
    once: true,
    duration: 800,
    offset: 100,
});