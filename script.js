// ===================================================
// INVITATION LOGIC & INTERACTION
// ===================================================

document.addEventListener('DOMContentLoaded', () => {
  initGuestName();
  initCountdown();
  loadSavedWishes();
});

// 1. Tampilkan Nama Tamu Otomatis dari URL Parameter (?to=Nama+Tamu)
function initGuestName() {
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('to') || urlParams.get('u');
  
  if (guestName) {
    const guestElem = document.getElementById('guest-name');
    if (guestElem) {
      guestElem.textContent = decodeURIComponent(guestName.replace(/\+/g, ' '));
    }
  }
}

// 2. Fungsi Membuka Undangan (Transisi Layer 1 ke Layer 2)
function openInvitation() {
  const coverLayer = document.getElementById('cover-layer');
  const mainLayer = document.getElementById('main-layer');
  const audioControl = document.getElementById('audio-control');
  const bgAudio = document.getElementById('bg-audio');

  // Mulai putar musik
  if (bgAudio) {
    bgAudio.play().then(() => {
      audioControl.classList.remove('hide');
    }).catch(err => {
      console.log('Autoplay dicegah browser, audio diizinkan saat klik:', err);
      audioControl.classList.remove('hide');
    });
  }

  // Animasi Cover Slide Up
  if (coverLayer) {
    coverLayer.classList.add('slide-up');
  }

  // Tampilkan Layer Utama
  if (mainLayer) {
    mainLayer.classList.remove('hidden-init');
  }

  // Scroll halus ke atas
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// 3. Kontrol Musik (Play / Pause)
function toggleAudio() {
  const bgAudio = document.getElementById('bg-audio');
  const audioControl = document.getElementById('audio-control');
  const icon = audioControl.querySelector('i');

  if (bgAudio.paused) {
    bgAudio.play();
    icon.classList.remove('disc-paused');
  } else {
    bgAudio.pause();
    icon.classList.add('disc-paused');
  }
}

// 4. Hitung Mundur Acara (Countdown Timer)
function initCountdown() {
  // Atur tanggal target acara (Tahun, Bulan 0-indexed, Tanggal, Jam, Menit)
  // Contoh: 15 November 2026, pukul 09:30 WIB
  const targetDate = new Date('2026-11-15T09:30:00+07:00').getTime();

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      document.getElementById('days').textContent = '00';
      document.getElementById('hours').textContent = '00';
      document.getElementById('minutes').textContent = '00';
      document.getElementById('seconds').textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// 5. Buku Tamu & Ucapan Doa (Local Storage)
function handleGuestbookSubmit(event) {
  event.preventDefault();

  const nameInput = document.getElementById('sender-name');
  const attendanceSelect = document.getElementById('sender-attendance');
  const messageInput = document.getElementById('sender-message');

  const name = nameInput.value.trim();
  const attendance = attendanceSelect.value;
  const message = messageInput.value.trim();

  if (!name || !message) return;

  const newWish = {
    name,
    attendance,
    message,
    time: 'Baru saja'
  };

  // Simpan ke local storage
  saveWishToLocal(newWish);

  // Tambahkan langsung ke tampilan
  renderWishItem(newWish, true);

  // Reset form
  nameInput.value = '';
  messageInput.value = '';

  alert('Terima kasih! Doa dan ucapan Anda telah berhasil dikirimkan.');
}

function renderWishItem(wish, isPrepend = false) {
  const wishesList = document.getElementById('wishes-list');
  if (!wishesList) return;

  let badgeClass = 'attend-yes';
  if (wish.attendance === 'Berhalangan') badgeClass = 'attend-no';
  else if (wish.attendance === 'Ragu-ragu') badgeClass = 'attend-maybe';

  const card = document.createElement('div');
  card.className = 'wish-item fade-in';
  card.innerHTML = `
    <div class="wish-header">
      <span class="wish-name">${escapeHTML(wish.name)}</span>
      <span class="wish-badge ${badgeClass}">${escapeHTML(wish.attendance)}</span>
    </div>
    <p class="wish-text">${escapeHTML(wish.message)}</p>
    <span class="wish-time"><i class="fa-regular fa-clock"></i> ${escapeHTML(wish.time)}</span>
  `;

  if (isPrepend) {
    wishesList.insertBefore(card, wishesList.firstChild);
  } else {
    wishesList.appendChild(card);
  }
}

function saveWishToLocal(wish) {
  let stored = JSON.parse(localStorage.getItem('aqiqah_wishes') || '[]');
  stored.unshift(wish);
  localStorage.setItem('aqiqah_wishes', JSON.stringify(stored));
}

function loadSavedWishes() {
  const stored = JSON.parse(localStorage.getItem('aqiqah_wishes') || '[]');
  stored.forEach(w => renderWishItem(w, false));
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// 6. Salin Nomor Rekening
function copyAccountNumber(accountNumber) {
  navigator.clipboard.writeText(accountNumber).then(() => {
    const toast = document.getElementById('copy-toast');
    if (toast) {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2500);
    }
  }).catch(err => {
    console.error('Gagal menyalin:', err);
  });
}
