// Close on ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeImamModal();
    closeMarjaModal();
    closeMobileNav();
    closeDua();
  }
});
