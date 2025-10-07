// Theme toggle
(function(){
  const toggle = document.getElementById('themeToggle');
  const saved = localStorage.getItem('aura_theme');
  if (saved === 'dark') document.body.classList.add('dark');
  toggle?.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('aura_theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  });
})();

// Mobile nav
(function(){
  const burger = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  burger?.addEventListener('click', () => {
    links.classList.toggle('open');
    links.style.display = links.classList.contains('open') ? 'flex' : '';
  });
})();

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const el = document.querySelector(id);
    if (el){
      e.preventDefault();
      el.scrollIntoView({behavior:'smooth'});
    }
  });
});

