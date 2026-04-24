const body = document.body;
const onScroll = () => body.classList.toggle('scrolled', window.scrollY > 80);
addEventListener('scroll', onScroll, { passive: true });
onScroll();
