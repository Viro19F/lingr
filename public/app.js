/* ==========================================
   LINGER — Landing Page JavaScript
   ========================================== */

const API = '';

// ---- NAV ----
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 12);
});

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ---- REVEAL ON SCROLL ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ---- WAITLIST FORM ----
const waitlistForm = document.getElementById('waitlistForm');
const waitlistSuccess = document.getElementById('waitlistSuccess');

waitlistForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(waitlistForm);
  const data = Object.fromEntries(formData);

  try {
    const res = await fetch(`${API}/api/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();

    if (res.ok) {
      waitlistForm.style.display = 'none';
      waitlistSuccess.style.display = 'block';
      updateWaitlistCount();
    } else {
      if (result.error === 'Email already registered') {
        alert('You\'re already on the list! We\'ll notify you when we launch.');
      } else {
        alert(result.error || 'Something went wrong. Try again.');
      }
    }
  } catch (err) {
    alert('Could not connect to server. Make sure the app is running.');
  }
});

async function updateWaitlistCount() {
  try {
    const res = await fetch(`${API}/api/waitlist/count`);
    const data = await res.json();
    const el = document.getElementById('waitlistCount');
    if (el && data.count > 0) el.textContent = 300 + data.count;
  } catch (e) {}
}

function scrollToWaitlist() {
  document.getElementById('waitlist').scrollIntoView({ behavior: 'smooth' });
}

// Init
updateWaitlistCount();
