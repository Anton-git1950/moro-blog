(() => {
  const $ = (s, el = document) => el.querySelector(s);

  // Year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile nav toggle
  const toggle = $('.nav-toggle');
  const nav = $('#nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close nav when clicking a link (mobile UX)
    nav.addEventListener('click', (e) => {
      const target = e.target;
      if (
        target &&
        target.tagName === 'A' &&
        nav.classList.contains('is-open')
      ) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Contact form (client-side only demo)
  const form = $('#contactForm');
  const status = $('#formStatus');

  if (form && status) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();

      if (!name || !email || !message) {
        status.textContent = 'Ups — ispuni ime, email i poruku.';
        return;
      }

      // Here you'd normally POST to your backend / email service.
      // For now: friendly confirmation.
      status.textContent =
        'Poslano ✅ (demo) — spoji backend da stvarno šalje email.';
      form.reset();
    });
  }
})();

// MODAL KONTAKT
const kontaktBtn = document.getElementById('kontaktBtn');
const kontaktModal = document.getElementById('kontaktModal');
const modalClose = document.getElementById('modalClose');

if (kontaktBtn) {
  kontaktBtn.addEventListener('click', function (e) {
    e.preventDefault();
    kontaktModal.classList.add('active');
  });
}

if (modalClose) {
  modalClose.addEventListener('click', function () {
    kontaktModal.classList.remove('active');
  });
}

window.addEventListener('click', function (e) {
  if (e.target === kontaktModal) {
    kontaktModal.classList.remove('active');
  }
});

window.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    kontaktModal.classList.remove('active');
  }
});

