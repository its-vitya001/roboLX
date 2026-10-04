const wrapper = document.querySelector('.wrapper');
const addButton = document.getElementById('add');
const modal = document.querySelector('.modal');
const closeButton = document.querySelector('.close');
const form = document.getElementById('add-ad-form');
const themeButtons = document.querySelectorAll('.theme-option');

let ads = [];

function setGreeting() {
  const greetingLabel = document.querySelector('.greeting-label');
  if (!greetingLabel) return;

  const hour = new Date().getHours();
  let greeting = 'Good evening';

  if (hour < 12) {
    greeting = 'Good morning';
  } else if (hour < 18) {
    greeting = 'Good afternoon';
  }

  greetingLabel.textContent = greeting;
}

function setTheme(themeName) {
  document.body.setAttribute('data-theme', themeName);

  themeButtons.forEach((button) => {
    const isActive = button.dataset.theme === themeName;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  localStorage.setItem('roblox-theme', themeName);
}

function renderAds() {
  if (!wrapper) return;

  wrapper.innerHTML = '';

  if (ads.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'No advertisements yet.';
    empty.className = 'empty-state';
    wrapper.appendChild(empty);
    return;
  }

  ads.forEach((ad) => {
    const card = document.createElement('article');
    card.className = 'ad-card';

    const title = document.createElement('h2');
    title.textContent = ad.title;

    const description = document.createElement('p');
    description.textContent = ad.description;

    card.appendChild(title);
    card.appendChild(description);
    wrapper.appendChild(card);
  });
}

async function loadAds() {
  try {
    const response = await fetch('/api/ads');
    if (!response.ok) {
      throw new Error('Failed to load ads');
    }

    ads = await response.json();
    renderAds();
  } catch (error) {
    console.error(error);
  }
}

function openModal() {
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('visible');
  }
}

function closeModal() {
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('visible');
    if (form) form.reset();
  }
}

addButton?.addEventListener('click', openModal);
closeButton?.addEventListener('click', closeModal);
modal?.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const title = String(formData.get('ad-title') || '').trim();
  const description = String(formData.get('ad-description') || '').trim();

  if (!title || !description) return;

  try {
    const response = await fetch('/api/ads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, description })
    });

    if (!response.ok) {
      throw new Error('Failed to add advertisement');
    }

    fetch('/api/add', {
      method: 'POST',
      body: new FormData(e.target)
    }).then(location.reload());

    const data = await response.json();
    ads = data.ads;
    renderAds();
    closeModal();
  } catch (error) {
    console.error(error);
  }
});

themeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setTheme(button.dataset.theme);
  });
});

const savedTheme = localStorage.getItem('roblox-theme') || 'navy';
setGreeting();
setTheme(savedTheme);
loadAds();
