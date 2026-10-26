document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const termPanels = document.querySelectorAll('.term-panel');

  if (!tabButtons.length || !termPanels.length) return;

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Deactivate all
      tabButtons.forEach((b) => b.classList.remove('active'));
      termPanels.forEach((p) => p.classList.remove('active'));

      // Activate selected
      btn.classList.add('active');
      const termId = 'term' + btn.dataset.term;
      const panel = document.getElementById(termId);
      if (panel) panel.classList.add('active');
    });
  });
});