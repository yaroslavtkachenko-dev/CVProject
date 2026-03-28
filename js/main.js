// Ініціалізація анімацій при прокрутці
if (typeof AOS !== 'undefined') {
  AOS.init({
    once: true,
    duration: 800,
    offset: 100
  });
}

document.addEventListener('DOMContentLoaded', function() {
  // === ПЕРЕМИКАЧ ТЕМИ ===
  const savedTheme = localStorage.getItem('theme');
  const theme = ['light', 'dark'].includes(savedTheme) ? savedTheme : 'light';
  document.documentElement.setAttribute('data-theme', theme);

  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
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

  const navbarHeight = document.querySelector('.navbar')?.offsetHeight ?? 80;

  sections.forEach(section => {
    const sectionTop = section.offsetTop - navbarHeight - 20;
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
      rootMargin: '50px 0px',
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
    if (!('IntersectionObserver' in window)) {
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
      return;
    }

    lazyImages.forEach(img => {
      if (!img.src || img.src === '') {
        img.src = this.options.placeholder;
      }

      img.classList.add('lazy-loading');
      this.imageObserver.observe(img);
    });
  }

  loadImage(img) {
    const src = img.dataset.src;
    const alt = img.dataset.alt || img.alt || '';

    if (!src) {
      this.handleImageError(img);
      return;
    }

    if (this.loadedImages.has(src) || this.failedImages.has(src)) {
      return;
    }

    const imageLoader = new Image();

    const timeout = setTimeout(() => {
      this.handleImageError(img, src);
    }, 10000);

    imageLoader.onload = () => {
      clearTimeout(timeout);
      this.handleImageLoad(img, src, alt);
    };

    imageLoader.onerror = () => {
      clearTimeout(timeout);
      this.handleImageError(img, src);
    };

    imageLoader.src = src;
  }

  handleImageLoad(img, src, alt) {
    img.src = src;
    img.alt = alt;

    img.classList.remove('lazy-loading');
    img.classList.add('loaded');

    img.removeAttribute('data-src');
    this.loadedImages.add(src);
    img.setAttribute('data-loaded', 'true');

    if (this.options.onLoad) {
      this.options.onLoad(img, src);
    }
  }

  handleImageError(img, src) {
    img.src = this.options.errorImage;

    img.classList.remove('lazy-loading');
    img.classList.add('error');

    this.failedImages.add(src);
    img.setAttribute('data-error', 'true');

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

  addImages(selector = 'img[data-src]') {
    if (!this.imageObserver) return;

    const newImages = document.querySelectorAll(selector);
    newImages.forEach(img => {
      if (!img.hasAttribute('data-loaded') && !img.hasAttribute('data-error')) {
        img.src = this.options.placeholder;
        img.classList.add('lazy-loading');
        this.imageObserver.observe(img);
      }
    });
  }

  destroy() {
    if (this.imageObserver) {
      this.imageObserver.disconnect();
      this.imageObserver = null;
    }

    this.loadedImages.clear();
    this.failedImages.clear();
  }

  getStats() {
    return {
      loaded: this.loadedImages.size,
      failed: this.failedImages.size,
      total: this.loadedImages.size + this.failedImages.size
    };
  }
}

let lazyLoader = null;

function initLazyLoading() {
  lazyLoader = new LazyImageLoader();
}

window.addEventListener('beforeunload', () => {
  if (lazyLoader) {
    lazyLoader.destroy();
  }
});
