document.addEventListener('DOMContentLoaded', () => {
  // Vault Accordion Logic
  const vaultRows = document.querySelectorAll('.vault-row');
  vaultRows.forEach(row => {
    const head = row.querySelector('.vault-head');
    if (!head) return;

    head.addEventListener('click', () => {
      const isActive = row.classList.contains('active');
      vaultRows.forEach(r => {
        r.classList.remove('active');
        const arrow = r.querySelector('.vault-arrow');
        if (arrow) arrow.textContent = '+';
      });

      if (!isActive) {
        row.classList.add('active');
        const arrow = row.querySelector('.vault-arrow');
        if (arrow) arrow.textContent = '−';
      }
    });
  });

  // Modal
  const modal = document.getElementById('enrollModal');
  const closeModal = document.getElementById('closeModal');
  const planTitle = document.getElementById('planTitle');
  const openButtons = document.querySelectorAll('.open-modal-btn');
  const b54Form = document.getElementById('b54Form');

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const plan = e.currentTarget.getAttribute('data-plan') || 'Black54 Private Membership';
      if (planTitle) {
        planTitle.textContent = plan;
      }
      if (modal) {
        modal.classList.add('open');
      }
    });
  });

  if (closeModal && modal) {
    closeModal.addEventListener('click', () => {
      modal.classList.remove('open');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  }

  // Application Submission
  if (b54Form) {
    b54Form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('bName').value;
      const revenue = document.getElementById('bRev').value;
      
      const submitBtn = b54Form.querySelector('button[type="submit"]');
      const origText = submitBtn.textContent;
      submitBtn.textContent = 'Encrypting & Transmitting...';
      submitBtn.disabled = true;

      setTimeout(() => {
        alert(`Application Received, ${name}. Your profile (${revenue}) is currently under private review by the Black54 admissions council. You will receive an invitation link on WhatsApp if accepted.`);
        submitBtn.textContent = origText;
        submitBtn.disabled = false;
        b54Form.reset();
        modal.classList.remove('open');
      }, 1000);
    });
  }
});
