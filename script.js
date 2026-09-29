(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  $$('[data-year]').forEach(node => node.textContent = new Date().getFullYear());

  // The welcome intro appears on the home page once per browser tab/session.
  const intro = $('#introScreen');
  if (intro) {
    const introKey = 'prologueIntroSeen';
    let alreadySeen = false;
    try { alreadySeen = sessionStorage.getItem(introKey) === 'yes'; } catch (_) {}
    if (alreadySeen) intro.classList.add('is-leaving');

    const closeIntro = () => {
      intro.classList.add('is-leaving');
      intro.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('intro-open');
      try { sessionStorage.setItem(introKey, 'yes'); } catch (_) {}
    };
    if (!alreadySeen) document.body.classList.add('intro-open');
    $('#skipIntro')?.addEventListener('click', closeIntro);
    $('#enterPrologue')?.addEventListener('click', () => {
      closeIntro();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Accessible light/dark theme toggle, shared by every page.
  const themeButtons = $$('.theme-toggle');
  const themeStorageKey = 'prologueTheme';
  let savedTheme = 'light';
  try { savedTheme = localStorage.getItem(themeStorageKey) || 'light'; } catch (_) {}
  const applyTheme = theme => {
    document.documentElement.dataset.theme = theme;
    themeButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.innerHTML = theme === 'dark' ? '☀' : '☾';
      button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
    try { localStorage.setItem(themeStorageKey, theme); } catch (_) {}
  };
  applyTheme(savedTheme === 'dark' ? 'dark' : 'light');
  themeButtons.forEach(button => button.addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  }));

  const menuButton = $('.menu-toggle');
  const nav = $('.main-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const opened = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(opened));
      menuButton.setAttribute('aria-label', opened ? 'Close navigation' : 'Open navigation');
      menuButton.textContent = opened ? '×' : '☰';
    });
    $$('a', nav).forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.textContent = '☰';
    }));
  }

  const grid = $('#bookGrid');
  if (grid && Array.isArray(window.PROLOGUE_BOOKS)) {
    const search = $('#bookSearch');
    const genre = $('#genreFilter');
    const mood = $('#moodFilter');
    const empty = $('#emptyBooks');
    const modal = $('#previewModal');
    const modalContent = $('#modalContent');
    let previousFocus = null;
    let activeBook = null;

    const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    // Edition-specific cover images. Google Books IDs below identify actual catalogue editions;
    // other ISBNs use the Open Library Covers service. Failed/missing covers are never replaced
    // by custom artwork: that title is simply removed from the visible catalogue.
    const googleBookCovers = {
      'indulekha': 'bry9EAAAQBAJ',
      'balyakalasakhi': 'hloeAycr1XYC',
      'godaan': 'kbMfyAEACAAJ',
      'nirmala': 'EGHj0AEACAAJ'
    };
    const coverURL = book => {
      if (googleBookCovers[book.id]) {
        return `https://books.google.com/books/content?id=${googleBookCovers[book.id]}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
      }
      return book.isbn ? `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(book.isbn)}-L.jpg?default=false` : '';
    };

    function renderBooks() {
      const term = (search?.value || '').trim().toLowerCase();
      const selectedGenre = genre?.value || 'all';
      const selectedMood = mood?.value || 'all';
      const filtered = window.PROLOGUE_BOOKS.filter(book => {
        const matchesTerm = !term || `${book.title} ${book.author} ${book.genreLabel} ${book.description} ${book.language || ''}`.toLowerCase().includes(term);
        const matchesGenre = selectedGenre === 'all' || (selectedGenre === 'malayalam' ? book.language === 'Malayalam' : selectedGenre === 'hindi' ? book.language === 'Hindi' : book.genre === selectedGenre);
        const matchesMood = selectedMood === 'all' || book.moods.includes(selectedMood);
        return matchesTerm && matchesGenre && matchesMood && Boolean(coverURL(book));
      });
      grid.innerHTML = filtered.map(book => `
        <article class="book-card cover-pending" data-book-card="${escapeHTML(book.id)}">
          <div class="cover-wrap">
            <img class="cover-img" src="${escapeHTML(coverURL(book))}" alt="Original edition cover of ${escapeHTML(book.title)} by ${escapeHTML(book.author)}" loading="lazy" decoding="async">
            <button class="preview-badge" type="button" data-preview="${escapeHTML(book.id)}">PREVIEW</button>
          </div>
          <div class="book-meta"><h3>${escapeHTML(book.title)}</h3><p class="book-author">${escapeHTML(book.author)}</p><p class="book-genre">${escapeHTML(book.genreLabel)}</p><p class="book-year">First published · ${escapeHTML(book.year)}</p></div>
        </article>`).join('');
      const cards = $$('.book-card', grid);
      const updateCount = () => {
        const visibleCount = $$('.book-card.has-original-cover', grid).length;
        const countNode = $('#bookCount');
        if (countNode) countNode.textContent = String(visibleCount);
        empty.hidden = visibleCount > 0 || $$('.book-card.cover-pending', grid).length > 0;
      };
      cards.forEach(card => {
        const img = $('.cover-img', card);
        const showOnlyRealCover = () => {
          if (img.naturalWidth > 1 && img.naturalHeight > 1) {
            card.classList.remove('cover-pending');
            card.classList.add('has-original-cover');
          } else {
            card.remove();
          }
          updateCount();
        };
        img.addEventListener('load', showOnlyRealCover, { once: true });
        img.addEventListener('error', () => { card.remove(); updateCount(); }, { once: true });
        if (img.complete) showOnlyRealCover();
      });
      if (!cards.length) empty.hidden = false;
      updateCount();
    }

    function openPreview(bookId) {
      const book = window.PROLOGUE_BOOKS.find(item => item.id === bookId);
      if (!book || !modal || !modalContent) return;
      activeBook = book;
      previousFocus = document.activeElement;
      modalContent.innerHTML = `
        <div class="modal-book-head">
          <div class="modal-cover-wrap">${coverURL(book) ? `<img class="modal-cover" src="${escapeHTML(coverURL(book))}" alt="Original edition cover of ${escapeHTML(book.title)}" />` : ''}</div>
          <div><p class="eyebrow">${escapeHTML(book.genreLabel)} · ${escapeHTML(book.year)}</p><h2 id="modalTitle">${escapeHTML(book.title)}</h2><p class="book-author">${escapeHTML(book.author)}</p><p class="modal-description">${escapeHTML(book.description)}</p><div class="modal-actions">${(book.textUrl || book.gutenberg) ? `<a class="button button-dark" href="${escapeHTML(book.textUrl || book.gutenberg)}" target="_blank" rel="noopener noreferrer">Read full text ↗</a>` : `<a class="button button-dark" href="https://openlibrary.org/search?q=${encodeURIComponent(book.title)}" target="_blank" rel="noopener noreferrer">Find an edition ↗</a>`}${coverURL(book) ? `<a class="button" style="border:1px solid var(--line)" href="${escapeHTML(coverURL(book))}" target="_blank" rel="noopener noreferrer">View cover ↗</a>` : ''}</div></div>
        </div>
        <p class="eyebrow" style="margin-top:25px">OPEN A CHAPTER PREVIEW</p>
        <div class="chapter-tabs" role="tablist" aria-label="Chapter previews">${book.chapters.map((chapter, index) => `<button class="chapter-tab ${index === 0 ? 'active' : ''}" type="button" role="tab" aria-selected="${index === 0}" data-chapter="${index}">${escapeHTML(chapter.title.split(' · ')[0])}</button>`).join('')}</div>
        <div id="chapterPreview" class="chapter-preview" role="tabpanel"></div>
        <p class="library-note">Chapter previews include brief public-domain excerpts where available and original reading guides for other titles. Edition and chapter divisions may vary.</p>`;
      $$('.chapter-tab', modalContent).forEach(button => button.addEventListener('click', () => {
        $$('.chapter-tab', modalContent).forEach(tab => { tab.classList.remove('active'); tab.setAttribute('aria-selected', 'false'); });
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');
        renderChapter(Number(button.dataset.chapter));
      }));
      renderChapter(0);
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      $('.modal-close', modal)?.focus();
    }

    function renderChapter(index) {
      if (!activeBook) return;
      const chapter = activeBook.chapters[index];
      const target = $('#chapterPreview', modalContent);
      if (!chapter || !target) return;
      target.innerHTML = `<p class="chapter-caption">CHAPTER PREVIEW</p><h3>${escapeHTML(chapter.title)}</h3><blockquote>${escapeHTML(chapter.excerpt)}</blockquote><p>${escapeHTML(chapter.summary)}</p>`;
    }

    function closePreview() {
      if (!modal) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
    }

    search?.addEventListener('input', renderBooks);
    genre?.addEventListener('change', renderBooks);
    mood?.addEventListener('change', renderBooks);
    grid.addEventListener('click', event => {
      const button = event.target.closest('[data-preview]');
      if (button) openPreview(button.dataset.preview);
    });
    $$('[data-close-modal]').forEach(button => button.addEventListener('click', closePreview));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && modal?.classList.contains('is-open')) closePreview();
    });
    const params = new URLSearchParams(window.location.search);
    const moodParam = params.get('mood');
    if (moodParam && mood && [...mood.options].some(option => option.value === moodParam)) mood.value = moodParam;
    renderBooks();
  }


  // Gallery image lightbox for a more immersive visual experience.
  const gallery = $('.gallery-grid');
  const lightbox = $('#galleryLightbox');
  const lightboxImage = $('#galleryLightboxImage');
  const lightboxCaption = $('#galleryLightboxCaption');
  if (gallery && lightbox && lightboxImage) {
    const closeGalleryLightbox = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lightboxImage.src = '';
    };
    gallery.addEventListener('click', event => {
      const image = event.target.closest('.gallery-item img');
      if (!image) return;
      const figure = image.closest('.gallery-item');
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt || 'PROLOGUE gallery image';
      if (lightboxCaption) lightboxCaption.textContent = figure?.querySelector('figcaption strong')?.textContent || image.alt;
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      $('.gallery-lightbox-close', lightbox)?.focus();
    });
    $('.gallery-lightbox-close', lightbox)?.addEventListener('click', closeGalleryLightbox);
    lightbox.addEventListener('click', event => { if (event.target === lightbox) closeGalleryLightbox(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && lightbox.classList.contains('is-open')) closeGalleryLightbox(); });
  }

  // Reveal content as it enters the viewport, while respecting reduced-motion settings.
  const revealTargets = $$('.section, .ticker, .quote-band, .join-banner, .gallery-item');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealTargets.forEach(node => node.classList.add('reveal-on-scroll'));
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealTargets.forEach(node => revealObserver.observe(node));
  }

  const form = $('#joinForm');
  if (form) {
    const fields = [
      {id:'fullName', error:'nameError', validate:value => value.trim().length >= 2, message:'Please enter your full name.'},
      {id:'email', error:'emailError', validate:value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()), message:'Please enter a valid email address.'},
      {id:'year', error:'yearError', validate:value => Boolean(value), message:'Please choose your year of study.'},
      {id:'branch', error:'branchError', validate:value => value.trim().length >= 2, message:'Please enter your branch.'},
      {id:'genre', error:'genreError', validate:value => Boolean(value), message:'Please choose a reading mood.'}
    ];
    const success = $('#formSuccess');
    function validateField(field) {
      const input = $('#' + field.id);
      const error = $('#' + field.error);
      const valid = field.validate(input.value);
      if (error) error.textContent = valid ? '' : field.message;
      input.setAttribute('aria-invalid', String(!valid));
      return valid;
    }
    fields.forEach(field => {
      const input = $('#' + field.id);
      input?.addEventListener('blur', () => validateField(field));
      input?.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') validateField(field); });
      input?.addEventListener('change', () => validateField(field));
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const validFields = fields.map(validateField).every(Boolean);
      if (!validFields) {
        success.hidden = true;
        const firstInvalid = fields.map(field => $('#' + field.id)).find(input => input.getAttribute('aria-invalid') === 'true');
        firstInvalid?.focus();
        return;
      }
      success.hidden = false;
      success.scrollIntoView({behavior:'smooth', block:'nearest'});
      form.reset();
      fields.forEach(field => { const input = $('#' + field.id); input?.removeAttribute('aria-invalid'); const error = $('#' + field.error); if (error) error.textContent = ''; });
      
    });
  }
})();
