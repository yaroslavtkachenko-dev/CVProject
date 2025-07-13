// Ініціалізація анімацій при прокрутці
AOS.init({
    once: true,
    duration: 800,
    offset: 100
});

// Генерація посилання на email, щоб захистити його від спам-ботів
document.addEventListener('DOMContentLoaded', function() {
    // ЗАМІНІТЬ ЦІ ДАНІ НА ВАШІ ЕЛЕКТРОННУ ПОШТУ
    const user = 'yaroslav.tkachenko';        // Замініть на ваш email логін
    const domain = 'example.com';             // Замініть на ваш домен

    const emailLink = document.getElementById('email-link');
    if (emailLink) {
        emailLink.setAttribute('href', 'mailto:' + user + '@' + domain);
    }
});

// Плавна прокрутка для навігаційних посилань
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Активне підсвічування поточного розділу в навігації
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id], header[id]');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link[href^="#"]');

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;

        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSection) {
            link.classList.add('active');
        }
    });
});