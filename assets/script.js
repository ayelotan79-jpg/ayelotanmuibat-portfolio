(function () {
  'use strict';

  var CONTACT_EMAIL = 'ayelotan97@gmail.com';
  var CALENDLY_URL = 'https://calendly.com/ayelotan97/30min';

  // ── Theme toggle (dark/light) ──
  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    var setThemeLabel = function (theme) {
      themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    };
    setThemeLabel(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    themeToggle.addEventListener('click', function () {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      var next = isLight ? 'dark' : 'light';
      if (next === 'light') document.documentElement.setAttribute('data-theme', 'light');
      else document.documentElement.removeAttribute('data-theme');
      setThemeLabel(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // ── Mobile nav toggle ──
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    var closeMenu = function () {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeMenu();
    });
    document.addEventListener('click', function (e) {
      if (links.classList.contains('is-open') && !links.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
        closeMenu();
      }
    });
    window.addEventListener('resize', closeMenu);
  }

  // ── Services nav dropdown ──
  var servicesDropdown = document.querySelector('.nav__dropdown');
  var servicesDropdownToggle = document.getElementById('servicesDropdownToggle');
  if (servicesDropdown && servicesDropdownToggle) {
    var closeDropdown = function () {
      servicesDropdown.classList.remove('is-open');
      servicesDropdownToggle.setAttribute('aria-expanded', 'false');
    };
    servicesDropdownToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = servicesDropdown.classList.toggle('is-open');
      servicesDropdownToggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) {
      if (servicesDropdown.classList.contains('is-open') && !servicesDropdown.contains(e.target)) {
        closeDropdown();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDropdown();
    });
    servicesDropdown.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeDropdown();
    });
  }

  // ── Back to top ──
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    var updateBackToTop = function () {
      var distanceFromBottom = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      backToTop.classList.toggle('is-visible', distanceFromBottom < 200);
      backToTop.classList.toggle('is-above-footer', distanceFromBottom < 140);
    };
    var onBackToTopClick = function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('scroll', updateBackToTop, { passive: true });
    backToTop.addEventListener('click', onBackToTopClick);
    window.addEventListener('pagehide', function () {
      window.removeEventListener('scroll', updateBackToTop);
      backToTop.removeEventListener('click', onBackToTopClick);
    });
    updateBackToTop();
  }

  // ── Services: flip-in reveal every time it scrolls into view ──
  var servicesGrid = document.querySelector('.services__grid');
  if (servicesGrid) {
    if ('IntersectionObserver' in window) {
      var servicesIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          servicesGrid.classList.toggle('is-visible', entry.isIntersecting);
        });
      }, { threshold: 0.2 });
      servicesIO.observe(servicesGrid);
    } else {
      servicesGrid.classList.add('is-visible');
    }
  }

  // ── Contact form: client-side only (no backend) ──
  var form = document.getElementById('contactForm');
  if (!form) return;
  var submitBtn = document.getElementById('submitBtn');
  var defaultLabel = submitBtn.textContent;

  var fields = {
    name: { input: document.getElementById('cf-name'), error: document.getElementById('err-name') },
    email: { input: document.getElementById('cf-email'), error: document.getElementById('err-email') },
    message: { input: document.getElementById('cf-message'), error: document.getElementById('err-message') },
  };

  function setFieldError(key, msg) {
    var f = fields[key];
    if (!f) return;
    f.input.classList.toggle('is-invalid', !!msg);
    f.error.textContent = msg || '';
  }

  function validate() {
    var ok = true;

    if (!fields.name.input.value.trim()) {
      setFieldError('name', 'Please enter your name.');
      ok = false;
    } else {
      setFieldError('name', '');
    }

    var email = fields.email.input.value.trim();
    if (!email) {
      setFieldError('email', 'Please enter your email.');
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError('email', 'Enter a valid email address.');
      ok = false;
    } else {
      setFieldError('email', '');
    }

    if (!fields.message.input.value.trim()) {
      setFieldError('message', 'Tell me a bit about your channel.');
      ok = false;
    } else {
      setFieldError('message', '');
    }

    return ok;
  }

  Object.keys(fields).forEach(function (key) {
    fields[key].input.addEventListener('input', function () {
      if (fields[key].input.classList.contains('is-invalid')) validate();
    });
  });

  // No backend on a static site, so submitting opens a pre-filled email
  // draft in the visitor's own mail app, addressed to CONTACT_EMAIL — the
  // visitor still hits send there, but the message lands in the right
  // inbox with no server or third-party form service required.
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;

    var name = fields.name.input.value.trim();
    var email = fields.email.input.value.trim();
    var platform = document.getElementById('cf-platform').value.trim();
    var message = fields.message.input.value.trim();

    var subject = 'New inquiry from ' + name;
    var body =
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Platform: ' + (platform || 'Not specified') + '\n\n' +
      'Message:\n' + message;

    var mailtoUrl =
      'mailto:' + CONTACT_EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);

    submitBtn.disabled = true;
    submitBtn.textContent = 'Opening Email App…';
    window.location.href = mailtoUrl;
    form.reset();

    setTimeout(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = defaultLabel;
    }, 3000);
  });
})();
