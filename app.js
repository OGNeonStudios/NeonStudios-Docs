/**
 * NeonStudios — App JavaScript
 * Handles: scroll animations, sidebar, scroll spy, search, copy-to-clipboard, mobile menu
 */

(function () {
  'use strict';

  // ===== Scroll Reveal Animation =====
  function initScrollReveal() {
    const elements = document.querySelectorAll('.fade-in');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
  }

  // ===== Mobile Menu =====
  function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('mobileNav');
    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
      const isOpen = nav.style.display === 'flex';
      nav.style.display = isOpen ? 'none' : 'flex';
      btn.setAttribute('aria-expanded', !isOpen);
    });

    // Close on link click
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.style.display = 'none';
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ===== Sidebar Toggle (docs page, mobile) =====
  function initSidebarToggle() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!toggle || !sidebar) return;

    function openSidebar() {
      sidebar.classList.add('open');
      if (overlay) overlay.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
    }

    function closeSidebar() {
      sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', () => {
      sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });

    if (overlay) {
      overlay.addEventListener('click', closeSidebar);
    }

    // Close on link click (mobile)
    sidebar.querySelectorAll('.sidebar-link').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) closeSidebar();
      });
    });
  }

  // ===== Scroll Spy (docs sidebar) =====
  function initScrollSpy() {
    const links = document.querySelectorAll('.sidebar-link[data-section]');
    if (!links.length) return;

    const sections = [];
    links.forEach((link) => {
      const id = link.getAttribute('data-section');
      const section = document.getElementById(id);
      if (section) sections.push({ id, el: section, link });
    });

    function updateActive() {
      const scrollY = window.scrollY + 100;
      let currentId = sections[0]?.id;

      for (let i = sections.length - 1; i >= 0; i--) {
        if (scrollY >= sections[i].el.offsetTop) {
          currentId = sections[i].id;
          break;
        }
      }

      links.forEach((l) => l.classList.remove('active'));
      const activeLink = document.querySelector(`.sidebar-link[data-section="${currentId}"]`);
      if (activeLink) activeLink.classList.add('active');
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActive();
          ticking = false;
        });
        ticking = true;
      }
    });

    updateActive();
  }

  // ===== Search =====
  const searchData = [
    { title: 'Overview', section: 'Getting Started', href: 'docs.html#overview', keywords: 'overview introduction neonspawn about' },
    { title: 'Installation', section: 'Getting Started', href: 'docs.html#installation', keywords: 'install setup requirements java paper spigot download' },
    { title: 'Commands', section: 'Usage', href: 'docs.html#commands', keywords: 'commands spawn set gui reload version tp teleport' },
    { title: 'Permissions', section: 'Usage', href: 'docs.html#permissions', keywords: 'permissions luckperms op admin bypass cooldown delay' },
    { title: 'GUI System', section: 'Usage', href: 'docs.html#gui-system', keywords: 'gui menu interface inventory spawn selector' },
    { title: 'Configuration', section: 'Configuration', href: 'docs.html#configuration', keywords: 'config yml settings options teleport delay cooldown effects sound particles messages' },
    { title: 'Customization', section: 'Configuration', href: 'docs.html#customization', keywords: 'customize messages colors disable features' },
    { title: 'Features', section: 'Advanced', href: 'docs.html#features', keywords: 'features per-world spawn effects safety multi-version folia' },
    { title: 'PlaceholderAPI', section: 'Advanced', href: 'docs.html#placeholderapi', keywords: 'placeholder papi scoreboard tab chat' },
    { title: 'API / Integrations', section: 'Advanced', href: 'docs.html#api-integrations', keywords: 'api developer java events hooks integration' },
    { title: 'Troubleshooting', section: 'Support', href: 'docs.html#troubleshooting', keywords: 'troubleshoot error fix bug not working loading saving' },
    { title: 'FAQ', section: 'Support', href: 'docs.html#faq', keywords: 'faq frequently asked questions bungeecord velocity essentials free' },
    { title: 'Minecraft Plugins', section: 'Products', href: 'index.html#products', keywords: 'minecraft plugins paper spigot server' },
    { title: 'Discord Bots', section: 'Products', href: 'index.html#products', keywords: 'discord bot moderation community' },
    { title: 'Skripts', section: 'Products', href: 'index.html#products', keywords: 'skript scripts automation custom mechanics' },
    { title: 'Server Setups', section: 'Products', href: 'index.html#products', keywords: 'server setup configuration deployment' },
    { title: 'NeonSpawn', section: 'Products', href: 'docs/neonspawn.html#introduction', keywords: 'neonspawn spawn management teleport' },
    { title: 'PvPGuard', section: 'Featured Projects', href: 'index.html#featured', keywords: 'pvpguard pvp combat protection' },
    { title: 'NeonGlows', section: 'Products', href: 'docs/neonglows.html#introduction', keywords: 'neonglows glow effects cosmetics' },
  ];

  function initSearch() {
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');
    if (!overlay || !input || !results) return;

    function renderResults(query) {
      if (!query.trim()) {
        results.innerHTML = '<div class="search-empty">Type to search the documentation...</div>';
        return;
      }

      const q = query.toLowerCase();
      const activeData = window._searchDataOverride || searchData;
      const matches = activeData.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.section.toLowerCase().includes(q) ||
          item.keywords.includes(q)
      );

      if (!matches.length) {
        results.innerHTML = '<div class="search-empty">No results found for "' + escapeHtml(query) + '"</div>';
        return;
      }

      results.innerHTML = matches
        .map(
          (item) =>
            `<a class="search-result-item" href="${item.href}">
              <div class="result-title">${highlightMatch(item.title, q)}</div>
              <div class="result-section">${item.section}</div>
            </a>`
        )
        .join('');
    }

    input.addEventListener('input', () => renderResults(input.value));

    // Close on background click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSearch();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        closeSearch();
      }
      // Cmd/Ctrl + K to open
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        overlay.classList.contains('active') ? closeSearch() : openSearchFn();
      }
    });

    function openSearchFn() {
      overlay.classList.add('active');
      input.value = '';
      renderResults('');
      setTimeout(() => input.focus(), 100);
    }

    function closeSearch() {
      overlay.classList.remove('active');
    }

    // Expose globally
    window.openSearch = openSearchFn;
    window.closeSearch = closeSearch;
  }

  function highlightMatch(text, query) {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark style="background:rgba(99,102,241,0.3);color:var(--text-primary);padding:0 2px;border-radius:2px;">$1</mark>');
  }

  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ===== Copy to Clipboard =====
  window.copyCode = function (btn) {
    const codeBlock = btn.closest('.code-block');
    const code = codeBlock.querySelector('pre code') || codeBlock.querySelector('pre');
    const text = code.textContent;

    navigator.clipboard.writeText(text).then(() => {
      btn.classList.add('copied');
      const originalHTML = btn.innerHTML;
      btn.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied!';

      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = originalHTML;
      }, 2000);
    });
  };

  // ===== FAQ Accordion =====
  function initFAQ() {
    // FAQ styles are in styles.css — nothing to inject dynamically
  }

  // ===== Smooth Scroll for Anchor Links =====
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (target) {
          e.preventDefault();
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });

          // Update URL without jump
          history.pushState(null, null, '#' + targetId);
        }
      });
    });
  }

  // ===== Heading Anchor Links =====
  function initHeadingAnchors() {
    const content = document.querySelector('.docs-content');
    if (!content) return;

    content.querySelectorAll('h2[id], h3[id]').forEach((heading) => {
      heading.style.cursor = 'pointer';
      heading.style.position = 'relative';

      heading.addEventListener('click', () => {
        const url = window.location.origin + window.location.pathname + '#' + heading.id;
        navigator.clipboard.writeText(url);

        // Show feedback
        const feedback = document.createElement('span');
        feedback.textContent = 'Link copied!';
        feedback.style.cssText =
          'position:absolute;right:0;top:50%;transform:translateY(-50%);font-size:0.75rem;color:var(--success);font-weight:500;opacity:0;transition:opacity 0.3s;';
        heading.appendChild(feedback);

        requestAnimationFrame(() => (feedback.style.opacity = '1'));
        setTimeout(() => {
          feedback.style.opacity = '0';
          setTimeout(() => feedback.remove(), 300);
        }, 1500);
      });

      heading.addEventListener('mouseenter', () => {
        heading.style.color = 'var(--color-primary-hover)';
      });

      heading.addEventListener('mouseleave', () => {
        heading.style.color = '';
      });
    });
  }

  // ===== Header Scroll Effect =====
  function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll > 50) {
        header.style.borderBottomColor = 'rgba(30, 41, 59, 0.8)';
        header.style.background = 'rgba(11, 15, 25, 0.95)';
      } else {
        header.style.borderBottomColor = '';
        header.style.background = '';
      }
      lastScroll = currentScroll;
    });
  }

  // ===== Init =====
  document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initMobileMenu();
    initSidebarToggle();
    initScrollSpy();
    initSearch();
    initFAQ();
    initSmoothScroll();
    initHeadingAnchors();
    initHeaderScroll();
  });
})();
