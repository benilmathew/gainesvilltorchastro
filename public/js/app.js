/* SPA routing, mobile menu, active link state, reveal-on-scroll, and donate CTA */
(function () {
  const NAV_SELECTOR = '#primary-nav';
  const SECTION_SELECTOR = '.section';
  const ACTIVE_CLASS = 'active';

  function select(selector, scope = document) { return scope.querySelector(selector); }
  function selectAll(selector, scope = document) { return Array.from(scope.querySelectorAll(selector)); }

  function setActiveRouteFromHash() {
    const hash = window.location.hash.replace('#', '') || 'home';
    const target = document.getElementById(hash);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    updateActiveNav(hash);
  }

  function showSection(id) { /* no-op now; we scroll instead for single-page layout */ }

  function updateActiveNav(id) {
    const links = selectAll(`${NAV_SELECTOR} a[data-route]`);
    links.forEach(link => {
      const linkHash = (link.getAttribute('href') || '').replace('#', '');
      link.classList.toggle('active', linkHash === id);
    });
  }

  function setupNavRouting() {
    // Delegate clicks on links with data-route
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[data-route]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();
      const id = href.replace('#', '');
      history.pushState({}, '', `#${id}`);
      setActiveRouteFromHash();
      // Close mobile menu after navigation
      closeMobileMenu();
    });

    window.addEventListener('hashchange', setActiveRouteFromHash);
    window.addEventListener('popstate', setActiveRouteFromHash);
  }

  function setupMobileMenu() {
    const toggle = select('.menu-toggle');
    const nav = select('#primary-nav');
    const header = select('.site-header');
    if (!toggle || !nav || !header) return;

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      header.style.background = isOpen ? 'var(--bg)' : '';
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    nav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    // Close on window resize
    function onResize() {
      if (window.innerWidth > 680) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    }
    window.addEventListener('resize', onResize);

    // Close on escape key
    function closeOnEscape(e) {
      if (e.key === 'Escape') {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    }
    document.addEventListener('keydown', closeOnEscape);
  }

  function setupRevealOnScroll() {
    const elements = selectAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    elements.forEach(el => io.observe(el));
  }

  function setupActiveSectionOnScroll() {
    const sections = selectAll(SECTION_SELECTOR);
    if (!('IntersectionObserver' in window) || sections.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          if (id) updateActiveNav(id);
        }
      });
    }, { root: null, rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    sections.forEach(section => observer.observe(section));
  }

  function setupDonateCTA() { /* no-op now - donate links go directly */ }

  function init() {
    setupNavRouting();
    setupMobileMenu();
    setupRevealOnScroll();
    setupActiveSectionOnScroll();
    setupDonateCTA();
    setActiveRouteFromHash();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

