// Ініціалізація анімацій при прокрутці
AOS.init({
  once: true,
  duration: 800,
  offset: 100
});

// Генерація посилання на email, щоб захистити його від спам-ботів
document.addEventListener('DOMContentLoaded', function() {
  // Дані для генерації email посилання
  const user = 'yaroslav.tkachenko';        // Логін email адреси
  const domain = 'example.com';             // Домен email адреси

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

  // === ІНІЦІАЛІЗАЦІЯ LAZY LOADING ===
  initLazyLoading();
});

// Плавна прокрутка для навігаційних посилань
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const href = this.getAttribute('href');
    
    // Перевіряємо чи href не є просто '#'
    if (href && href !== '#') {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
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

// === LAZY LOADING ДЛЯ ЗОБРАЖЕНЬ ===

class LazyImageLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '50px 0px', // Завантажуємо за 50px до появи
      threshold: 0.1,
      placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=',
      errorImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmZjQ0MzYiLz48L3N2Zz4=',
      ...options
    };

    this.imageObserver = null;
    this.loadedImages = new Set();
    this.failedImages = new Set();
    
    this.init();
  }

  init() {
    // Перевіряємо підтримку Intersection Observer
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver не підтримується, завантажуємо всі зображення одразу');
      this.loadAllImages();
      return;
    }

    this.createObserver();
    this.observeImages();
  }

  createObserver() {
    this.imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          this.loadImage(img);
          this.imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: this.options.rootMargin,
      threshold: this.options.threshold
    });
  }

  observeImages() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if (lazyImages.length === 0) {
      console.log('Не знайдено зображень для lazy loading');
      return;
    }

    console.log(`Знайдено ${lazyImages.length} зображень для lazy loading`);

    lazyImages.forEach(img => {
      // Встановлюємо placeholder якщо ще не встановлено
      if (!img.src || img.src === '') {
        img.src = this.options.placeholder;
      }
      
      // Додаємо клас для стилізації
      img.classList.add('lazy-loading');
      
      // Спостерігаємо за зображенням
      this.imageObserver.observe(img);
    });
  }

  loadImage(img) {
    const src = img.dataset.src;
    const alt = img.dataset.alt || img.alt || '';
    
    if (!src) {
      console.warn('Не знайдено data-src для зображення:', img);
      this.handleImageError(img);
      return;
    }

    // Перевіряємо чи зображення вже завантажувалось
    if (this.loadedImages.has(src) || this.failedImages.has(src)) {
      return;
    }

    console.log('Завантажуємо зображення:', src);

    // Створюємо нове зображення для попереднього завантаження
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      this.handleImageLoad(img, src, alt);
    };
    
    imageLoader.onerror = () => {
      this.handleImageError(img, src);
    };

    // Додаємо timeout для завантаження
    const timeout = setTimeout(() => {
      console.warn('Timeout завантаження зображення:', src);
      this.handleImageError(img, src);
    }, 10000); // 10 секунд timeout

    imageLoader.onload = () => {
      clearTimeout(timeout);
      this.handleImageLoad(img, src, alt);
    };

    imageLoader.onerror = () => {
      clearTimeout(timeout);
      this.handleImageError(img, src);
    };

    // Починаємо завантаження
    imageLoader.src = src;
  }

  handleImageLoad(img, src, alt) {
    console.log('Зображення успішно завантажено:', src);
    
    // Оновлюємо src та alt
    img.src = src;
    img.alt = alt;
    
    // Додаємо класи для анімації
    img.classList.remove('lazy-loading');
    img.classList.add('loaded');
    
    // Видаляємо data-src щоб уникнути повторного завантаження
    img.removeAttribute('data-src');
    
    // Додаємо в список завантажених
    this.loadedImages.add(src);
    
    // Додаємо атрибут для відстеження
    img.setAttribute('data-loaded', 'true');
    
    // Викликаємо callback якщо є
    if (this.options.onLoad) {
      this.options.onLoad(img, src);
    }
  }

  handleImageError(img, src) {
    console.error('Помилка завантаження зображення:', src);
    
    // Встановлюємо placeholder для помилки
    img.src = this.options.errorImage;
    
    // Додаємо класи для стилізації помилки
    img.classList.remove('lazy-loading');
    img.classList.add('error');
    
    // Додаємо в список невдалих
    this.failedImages.add(src);
    
    // Додаємо атрибут для відстеження
    img.setAttribute('data-error', 'true');
    
    // Викликаємо callback якщо є
    if (this.options.onError) {
      this.options.onError(img, src);
    }
  }

  loadAllImages() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      this.loadImage(img);
    });
  }

  // Метод для додавання нових зображень після завантаження сторінки
  addImages(selector = 'img[data-src]') {
    const newImages = document.querySelectorAll(selector);
    newImages.forEach(img => {
      if (!img.hasAttribute('data-loaded') && !img.hasAttribute('data-error')) {
        img.src = this.options.placeholder;
        img.classList.add('lazy-loading');
        this.imageObserver.observe(img);
      }
    });
  }

  // Метод для очищення ресурсів
  destroy() {
    if (this.imageObserver) {
      this.imageObserver.disconnect();
      this.imageObserver = null;
    }
    
    this.loadedImages.clear();
    this.failedImages.clear();
  }

  // Статистика завантаження
  getStats() {
    return {
      loaded: this.loadedImages.size,
      failed: this.failedImages.size,
      total: this.loadedImages.size + this.failedImages.size
    };
  }
}

// Ініціалізація lazy loading
let lazyLoader = null;

function initLazyLoading() {
  lazyLoader = new LazyImageLoader({
    onLoad: (img, src) => {
      // Додаткова логіка при успішному завантаженні
      console.log(`✅ Зображення завантажено: ${src}`);
    },
    onError: (img, src) => {
      // Додаткова логіка при помилці
      console.log(`❌ Помилка завантаження: ${src}`);
    }
  });
}

// Очищення при виході зі сторінки
window.addEventListener('beforeunload', () => {
  if (lazyLoader) {
    lazyLoader.destroy();
  }
});
