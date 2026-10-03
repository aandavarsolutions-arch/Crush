/* 💘 SHARED UTILITY SCRIPTS */

// Floating Hearts Background Animation
function initFloatingHearts() {
  const container = document.createElement('div');
  container.className = 'floating-hearts-container';
  document.body.prepend(container);

  const hearts = ['❤️', '💖', '💕', '💘', '💗', '✨'];
  
  function createHeart() {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.innerText = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (Math.random() * 5 + 5) + 's';
    heart.style.fontSize = (Math.random() * 1 + 1) + 'rem';
    container.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 10000);
  }

  setInterval(createHeart, 600);
}

// Toast Notifications
function showToast(message, duration = 3000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Copy Text to Clipboard
async function copyToClipboard(text, successMessage = '✅ Link copied to clipboard!') {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      showToast(successMessage);
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast(successMessage);
    }
  } catch (err) {
    showToast('Failed to copy. Please select and copy manually.');
  }
}

// WhatsApp Share Link Helper
function shareOnWhatsApp(url, customMessage) {
  const defaultText = `😂 Try this Crush Calculator!\nLet's see what your result is 👀❤️\n${url}`;
  const message = customMessage || defaultText;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}

// Native Share API
async function triggerNativeShare(title, text, url) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: title || 'Crush Love Calculator Prank',
        text: text || '😂 Try this Crush Calculator! Let\'s see what your result is 👀❤️',
        url: url
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        copyToClipboard(url);
      }
    }
  } else {
    copyToClipboard(url);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initFloatingHearts();
});
