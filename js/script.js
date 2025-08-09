document.addEventListener('DOMContentLoaded', () => {
    console.log('[init] DOM ready');
    const btn  = document.getElementById('nav-toggle');
    const menu = document.getElementById('nav-links');
  
    if (!btn || !menu) { console.error('Missing #nav-toggle or #nav-links'); return; }
    // Ensure legacy hidden attr doesn't interfere
    menu.removeAttribute('hidden');

    const nav = document.querySelector('nav.main-nav');

    const layoutMenu = () => {
      if (!menu.classList.contains('show')) return;
      const navRect = nav.getBoundingClientRect();
      const topPx = Math.round(navRect.bottom + window.scrollY);
      menu.style.setProperty('position', 'fixed', 'important');
      menu.style.setProperty('left', '8px', 'important');
      menu.style.setProperty('right', '8px', 'important');
      menu.style.setProperty('top', `${topPx}px`, 'important');
      menu.style.setProperty('z-index', '4000', 'important');
      menu.style.setProperty('display', 'flex', 'important');
      menu.style.setProperty('opacity', '1', 'important');
      menu.style.setProperty('visibility', 'visible', 'important');
    };

    const open  = () => {
      menu.classList.add('show');
      btn.setAttribute('aria-expanded','true');
      document.body.classList.add('menu-open');
      layoutMenu();
      const cs = getComputedStyle(menu);
      console.log('[menu] open', { display: cs.display, position: cs.position, top: cs.top, opacity: cs.opacity, visibility: cs.visibility });
    };
    const close = () => {
      menu.classList.remove('show');
      menu.style.removeProperty('position');
      menu.style.removeProperty('left');
      menu.style.removeProperty('right');
      menu.style.removeProperty('top');
      menu.style.removeProperty('z-index');
      menu.style.removeProperty('display');
      menu.style.removeProperty('opacity');
      menu.style.removeProperty('visibility');
      btn.setAttribute('aria-expanded','false');
      document.body.classList.remove('menu-open');
      const cs = getComputedStyle(menu);
      console.log('[menu] close', { display: cs.display, position: cs.position, top: cs.top, opacity: cs.opacity, visibility: cs.visibility });
    };
  
    // Shared state: prevent duplicate toggles on touch devices and double events
    let lastToggleTimestamp = 0;
    let isToggling = false;

    const handleToggle = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }

      // Debounce double fire (touchend -> click)
      const now = Date.now();
      if (isToggling || now - lastToggleTimestamp < 400) {
        console.log('[menu] skip duplicate', event.type);
        return;
      }
      lastToggleTimestamp = now;
      isToggling = true;

      const willOpen = !menu.classList.contains('show');
      if (willOpen) open(); else close();
      console.log('[menu] toggled via', event.type, 'now:', menu.className);

      setTimeout(() => { isToggling = false; }, 300);
      // Arm outside-click a tick later to avoid closing from the same tap
      setTimeout(() => { armed = true; }, 50);
    };

    // Use click only to avoid double-firing sequences on some devices
    btn.addEventListener('click', handleToggle, { passive: false });
  
    let armed = false;
    // Close when clicking/tapping outside the menu and button
    const handleOutsideClose = (event) => {
      if (!armed) return;
      if (!menu.classList.contains('show')) return;
      const target = event.target;
      if (menu.contains(target) || btn.contains(target)) return;
      close();
    };
    document.addEventListener('click', handleOutsideClose, { passive: true });

    // Close when a nav link is clicked (good mobile UX)
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => { if (menu.classList.contains('show')) close(); });
    });
  
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

    // Keep state consistent on resize (e.g., switching between mobile/desktop)
    const MOBILE_MAX = 768;
    const syncForViewport = () => {
      const isMobile = window.innerWidth <= MOBILE_MAX;
      if (!isMobile) {
        // On desktop, ensure closed
        document.body.classList.remove('menu-open');
        btn.setAttribute('aria-expanded','false');
        menu.classList.remove('show');
        armed = false;
      } else {
        // On mobile: do not force-close; just sync aria to current state
        btn.setAttribute('aria-expanded', menu.classList.contains('show') ? 'true' : 'false');
      }
    };
    // Initial sync and on resize/scroll keep menu placed correctly
    syncForViewport();
    window.addEventListener('resize', () => { syncForViewport(); layoutMenu(); });
    window.addEventListener('scroll', layoutMenu, { passive: true });

    // ===== Modals (Programs page) =====
    const openModal = (modal) => {
      if (!modal) return;
      modal.classList.add('show');
      document.body.classList.add('menu-open');
    };
    const closeModal = (modal) => {
      if (!modal) return;
      modal.classList.remove('show');
      document.body.classList.remove('menu-open');
    };
    document.querySelectorAll('[data-modal-target]')?.forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const selector = trigger.getAttribute('data-modal-target');
        const modal = document.querySelector(selector);
        openModal(modal);
      });
    });
    document.querySelectorAll('.modal [data-close]')?.forEach((el) => {
      el.addEventListener('click', () => closeModal(el.closest('.modal')));
    });
    document.querySelectorAll('.modal .modal__overlay')?.forEach((ov) => {
      ov.addEventListener('click', () => closeModal(ov.closest('.modal')));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.show')?.forEach((m) => closeModal(m));
      }
    });

    // (state declared above)
  });
  