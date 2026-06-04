/* ============================================================
   CHERRYBERRY FOODS AND CATERING — MAIN JAVASCRIPT
   ============================================================ */

(function () {
  'use strict';

  /* ===================== HEADER SCROLL ================== */
  const header = document.getElementById('header');

  function updateHeader() {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  /* ===================== MOBILE MENU ==================== */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileClose = document.getElementById('mobile-close');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-cta');

  function openMenu() {
    mobileMenu.classList.add('open');
    mobileOverlay.classList.add('active');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    mobileClose.focus();
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    mobileOverlay.classList.remove('active');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  hamburger.addEventListener('click', openMenu);
  mobileClose.addEventListener('click', closeMenu);
  mobileOverlay.addEventListener('click', closeMenu);

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu();
    }
  });

  /* ===================== HERO SLIDER ==================== */
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  const prevBtn = document.querySelector('.hero-prev');
  const nextBtn = document.querySelector('.hero-next');
  let current = 0;
  let sliderTimer = null;

  function goToSlide(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function startSlider() {
    sliderTimer = setInterval(function () {
      goToSlide(current + 1);
    }, 6000);
  }

  function resetSlider() {
    clearInterval(sliderTimer);
    startSlider();
  }

  if (slides.length > 0) {
    prevBtn.addEventListener('click', function () {
      goToSlide(current - 1);
      resetSlider();
    });

    nextBtn.addEventListener('click', function () {
      goToSlide(current + 1);
      resetSlider();
    });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        goToSlide(i);
        resetSlider();
      });
    });

    startSlider();

    // Touch swipe support
    let touchStartX = 0;
    const heroEl = document.querySelector('.hero');
    heroEl.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    heroEl.addEventListener('touchend', function (e) {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? goToSlide(current + 1) : goToSlide(current - 1);
        resetSlider();
      }
    }, { passive: true });
  }

  /* ===================== AOS SCROLL ANIMATIONS ========= */
  function initAOS() {
    const aosElements = document.querySelectorAll('[data-aos]');

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.getAttribute('data-aos-delay') || '0', 10);
          setTimeout(function () {
            el.classList.add('aos-animate');
          }, delay);
          observer.unobserve(el);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    aosElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  initAOS();

  /* ===================== COUNTER ANIMATION ============= */
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 2200;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(update);
  }

  const statsObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const counters = entry.target.querySelectorAll('.stat-number[data-count]');
        counters.forEach(animateCounter);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  const statsRow = document.querySelector('.stats-row');
  if (statsRow) statsObserver.observe(statsRow);

  /* ===================== REVIEWS CAROUSEL ============== */
  const track = document.getElementById('reviewsTrack');
  const reviewCards = document.querySelectorAll('.review-card');
  const dotsContainer = document.getElementById('carouselDots');
  const prevReview = document.getElementById('reviewPrev');
  const nextReview = document.getElementById('reviewNext');

  if (track && reviewCards.length > 0) {
    let reviewIndex = 0;
    let reviewTimer = null;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartTranslate = 0;

    function getVisibleCount() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function getMaxIndex() {
      return Math.max(0, reviewCards.length - getVisibleCount());
    }

    function buildDots() {
      dotsContainer.innerHTML = '';
      const max = getMaxIndex() + 1;
      for (let i = 0; i < max; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Review ' + (i + 1));
        dot.addEventListener('click', function () {
          goToReview(i);
          resetReviewTimer();
        });
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      const allDots = dotsContainer.querySelectorAll('.carousel-dot');
      allDots.forEach(function (d, i) {
        d.classList.toggle('active', i === reviewIndex);
      });
    }

    function getCardWidth() {
      if (reviewCards.length === 0) return 0;
      return reviewCards[0].offsetWidth + 24;
    }

    function goToReview(index) {
      reviewIndex = Math.max(0, Math.min(index, getMaxIndex()));
      track.style.transform = 'translateX(-' + (reviewIndex * getCardWidth()) + 'px)';
      updateDots();
    }

    function startReviewTimer() {
      reviewTimer = setInterval(function () {
        const next = reviewIndex >= getMaxIndex() ? 0 : reviewIndex + 1;
        goToReview(next);
      }, 5000);
    }

    function resetReviewTimer() {
      clearInterval(reviewTimer);
      startReviewTimer();
    }

    prevReview.addEventListener('click', function () {
      goToReview(reviewIndex - 1);
      resetReviewTimer();
    });
    nextReview.addEventListener('click', function () {
      goToReview(reviewIndex + 1);
      resetReviewTimer();
    });

    // Touch support
    track.addEventListener('touchstart', function (e) {
      dragStartX = e.changedTouches[0].clientX;
      isDragging = true;
    }, { passive: true });

    track.addEventListener('touchend', function (e) {
      if (!isDragging) return;
      const diff = dragStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? goToReview(reviewIndex + 1) : goToReview(reviewIndex - 1);
        resetReviewTimer();
      }
      isDragging = false;
    }, { passive: true });

    // Recalculate on resize
    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        buildDots();
        goToReview(Math.min(reviewIndex, getMaxIndex()));
      }, 200);
    });

    buildDots();
    startReviewTimer();
  }

  /* ===================== FAQ ACCORDION ================= */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    btn.addEventListener('click', function () {
      const isOpen = item.classList.contains('open');

      // Close all
      faqItems.forEach(function (fi) {
        fi.classList.remove('open');
        fi.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        fi.querySelector('.faq-answer').style.maxHeight = null;
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ===================== CONTACT FORM ================= */
  const contactForm = document.getElementById('contactForm');
  const toast = document.getElementById('toast');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = contactForm.querySelector('#name').value.trim();
      const phone = contactForm.querySelector('#phone').value.trim();

      if (!name || !phone) {
        // Highlight empty required fields
        [contactForm.querySelector('#name'), contactForm.querySelector('#phone')].forEach(function (field) {
          if (!field.value.trim()) {
            field.style.borderColor = 'var(--cherry)';
            field.style.boxShadow = '0 0 0 3px rgba(193,18,31,0.12)';
            setTimeout(function () {
              field.style.borderColor = '';
              field.style.boxShadow = '';
            }, 2500);
          }
        });
        return;
      }

      // Build WhatsApp message and redirect
      const eventType = contactForm.querySelector('#event-type').value;
      const email = contactForm.querySelector('#email').value.trim();
      const message = contactForm.querySelector('#message').value.trim();

      const waMsg = encodeURIComponent(
        'Hello Cherryberry Foods and Catering,\n\n' +
        'Name: ' + name + '\n' +
        'Phone: ' + phone + '\n' +
        (email ? 'Email: ' + email + '\n' : '') +
        (eventType ? 'Event Type: ' + eventType + '\n' : '') +
        (message ? '\nMessage: ' + message : '')
      );

      // Show success toast
      showToast();
      contactForm.reset();

      // Open WhatsApp after short delay
      setTimeout(function () {
        window.open('https://wa.me/2349010250079?text=' + waMsg, '_blank', 'noopener');
      }, 800);
    });
  }

  function showToast() {
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 4000);
  }

  /* ===================== SMOOTH SCROLL ================ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80);
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });

  /* ===================== ACTIVE NAV LINK ============== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNav() {
    let currentSection = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(function (section) {
      if (scrollPos >= section.offsetTop) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentSection) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  /* ===================== FOOTER YEAR ================= */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===================== LAZY LOAD =================== */
  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading supported; handled via HTML attribute
  } else {
    // Fallback: observe images
    const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
    const imgObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) img.src = img.dataset.src;
          imgObserver.unobserve(img);
        }
      });
    });
    lazyImgs.forEach(function (img) { imgObserver.observe(img); });
  }

  /* ===================== PARALLAX HERO BG ============ */
  const heroBgs = document.querySelectorAll('.hero-bg');
  window.addEventListener('scroll', function () {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroBgs.forEach(function (bg) {
        bg.style.transform = 'translateY(' + (scrolled * 0.3) + 'px) scale(1.05)';
      });
    }
  }, { passive: true });

  /* ===================== SERVICE CARD RIPPLE ========= */
  document.querySelectorAll('.service-card, .why-card, .menu-card').forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      this.style.willChange = 'transform';
    });
    card.addEventListener('mouseleave', function () {
      this.style.willChange = '';
    });
  });

  /* ===================== NAV LINK ACTIVE STYLE ======= */
  const style = document.createElement('style');
  style.textContent = '.nav-link.active { color: var(--gold) !important; } .header.scrolled .nav-link.active { color: var(--cherry) !important; }';
  document.head.appendChild(style);

  /* ===================== INIT LOG ==================== */
  console.log('%cCherryberry Foods & Catering', 'color:#C1121F;font-family:Georgia;font-size:18px;font-weight:bold;');
  console.log('%cPremium Catering in Uyo, Akwa Ibom State', 'color:#D9A441;font-size:12px;');

})();

/* ===================== SHOW MORE / SHOW LESS ============= */
(function initShowMore() {
  var toggleIds = ['servicesToggle', 'menuToggle', 'whyToggle'];

  toggleIds.forEach(function (id) {
    var btn = document.getElementById(id);
    if (!btn) return;

    var gridId = btn.getAttribute('data-target');
    var grid = document.getElementById(gridId);
    if (!grid) return;

    var labelMore = btn.getAttribute('data-label-more') || 'View More';
    var labelLess = btn.getAttribute('data-label-less') || 'Show Less';
    var expanded = false;

    // Set initial label
    btn.querySelector('span, :first-child') && (btn.childNodes[0].textContent = labelMore);

    btn.addEventListener('click', function () {
      expanded = !expanded;
      var hiddenCards = grid.querySelectorAll('.hidden-card');

      hiddenCards.forEach(function (card, i) {
        if (expanded) {
          card.classList.add('revealed');
          // Stagger re-init AOS for newly revealed cards
          setTimeout(function () {
            card.classList.add('aos-animate');
          }, i * 80);
        } else {
          card.classList.remove('revealed', 'aos-animate');
        }
      });

      // Update button text (text node is first child)
      var textNode = null;
      btn.childNodes.forEach(function (n) {
        if (n.nodeType === 3 && n.textContent.trim()) textNode = n;
      });
      if (textNode) {
        textNode.textContent = expanded ? (' ' + labelLess + ' ') : (' ' + labelMore + ' ');
      } else {
        // fallback: update first text-bearing child
        var firstText = btn.querySelector('span');
        if (firstText) firstText.textContent = expanded ? labelLess : labelMore;
        else btn.firstChild.textContent = expanded ? labelLess : labelMore;
      }

      btn.classList.toggle('expanded', expanded);

      // Scroll to first newly-revealed card if expanding
      if (expanded) {
        var first = grid.querySelector('.hidden-card.revealed');
        if (first) {
          var top = first.getBoundingClientRect().top + window.scrollY - 120;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      }
    });
  });
})();