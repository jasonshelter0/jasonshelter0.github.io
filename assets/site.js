(() => {
  const isChinese = document.documentElement.lang.toLowerCase().startsWith('zh');
  const labels = isChinese
    ? { open: '打开导航', close: '关闭导航', copied: '已复制', select: '请选择文本复制' }
    : { open: 'Open navigation', close: 'Close navigation', copied: 'Copied', select: 'Select text to copy' };
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? labels.close : labels.open);
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', labels.open);
      }
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', labels.open);
      }
    });
  }

  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const projects = Array.from(document.querySelectorAll('[data-categories]'));
  const emptyMessage = document.querySelector('.filter-empty');
  for (const button of filterButtons) {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      for (const item of filterButtons) {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      }
      let shown = 0;
      for (const project of projects) {
        const matches = filter === 'all' || (project.dataset.categories || '').split(' ').includes(filter);
        project.hidden = !matches;
        if (matches) shown++;
      }
      if (emptyMessage) emptyMessage.hidden = shown > 0;
    });
  }

  for (const button of document.querySelectorAll('.copy-button')) {
    button.addEventListener('click', async () => {
      const selector = button.getAttribute('data-copy-target');
      const target = selector ? document.querySelector(selector) : button.closest('.code-panel')?.querySelector('code');
      if (!target) return;
      try {
        await navigator.clipboard.writeText(target.textContent.trim());
        const previous = button.textContent;
        button.textContent = labels.copied;
        window.setTimeout(() => { button.textContent = previous; }, 1800);
      } catch {
        button.textContent = labels.select;
      }
    });
  }

  const tocLinks = Array.from(document.querySelectorAll('.docs-toc a[href^="#"]'));
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const links = new Map(tocLinks.map(link => [link.getAttribute('href').slice(1), link]));
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          for (const link of tocLinks) link.classList.remove('is-current');
          links.get(entry.target.id)?.classList.add('is-current');
        }
      }
    }, { rootMargin: '-15% 0px -70% 0px' });
    for (const id of links.keys()) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
  }
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });
})();
