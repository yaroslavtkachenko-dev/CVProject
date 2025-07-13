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

  // === ПЕРЕМИКАЧ ТЕМИ ===
  // Отримати збережену тему або встановити світлу за замовчуванням
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Обробник кнопки перемикача
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);

      // Плавна анімація перемикання
      document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
      setTimeout(() => {
        document.body.style.transition = '';
      }, 300);
    });
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
let ticking = false;
function updateActiveNavigation() {
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

  ticking = false;
}

window.addEventListener('scroll', function() {
  if (!ticking) {
    requestAnimationFrame(updateActiveNavigation);
    ticking = true;
  }
});
