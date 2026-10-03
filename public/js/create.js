/* 💘 LINK CREATION CLIENT LOGIC */

document.addEventListener('DOMContentLoaded', () => {
  const createLinkForm = document.getElementById('createLinkForm');
  const creatorNameInput = document.getElementById('creatorName');
  const btnCreateLink = document.getElementById('btnCreateLink');
  
  const creationCard = document.getElementById('creationCard');
  const resultCard = document.getElementById('resultCard');
  const generatedShareUrl = document.getElementById('generatedShareUrl');
  const viewStatsLink = document.getElementById('viewStatsLink');

  const btnCopyLink = document.getElementById('btnCopyLink');
  const btnShareWhatsApp = document.getElementById('btnShareWhatsApp');
  const btnNativeShare = document.getElementById('btnNativeShare');

  let currentShareData = null;

  if (createLinkForm) {
    createLinkForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const creatorName = creatorNameInput.value.trim();
      if (!creatorName) {
        showToast('Please enter your name.');
        return;
      }

      btnCreateLink.disabled = true;
      btnCreateLink.innerText = '⌛ Generating Link...';

      try {
        const res = await fetch('/api/create-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creatorName })
        });

        const data = await res.json();

        if (data.success) {
          currentShareData = data.data;

          generatedShareUrl.value = currentShareData.shareUrl;
          viewStatsLink.href = currentShareData.statsUrl;

          // Save link code & secret key in localStorage for convenience
          localStorage.setItem('my_prank_code', currentShareData.code);
          localStorage.setItem('my_prank_key', currentShareData.secretKey);
          localStorage.setItem('my_prank_stats_url', currentShareData.statsUrl);

          // Transition UI cards
          creationCard.classList.add('hidden');
          resultCard.classList.remove('hidden');

          showToast('✅ Prank link created successfully!');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          showToast(data.error || 'Something went wrong. Please try again.');
        }
      } catch (err) {
        showToast('Network error. Please check your connection.');
      } finally {
        btnCreateLink.disabled = false;
        btnCreateLink.innerText = '🔗 Create Your Link';
      }
    });
  }

  // Copy Link Button
  if (btnCopyLink) {
    btnCopyLink.addEventListener('click', () => {
      if (generatedShareUrl.value) {
        copyToClipboard(generatedShareUrl.value, '📋 Prank link copied! Send it to your friend now 😂');
      }
    });
  }

  // WhatsApp Share Button
  if (btnShareWhatsApp) {
    btnShareWhatsApp.addEventListener('click', () => {
      if (currentShareData && currentShareData.shareUrl) {
        const shareMsg = `😂 Try this Crush Calculator!\nLet's see what your result is 👀❤️\n${currentShareData.shareUrl}`;
        shareOnWhatsApp(currentShareData.shareUrl, shareMsg);
      }
    });
  }

  // Native Share Button
  if (btnNativeShare) {
    btnNativeShare.addEventListener('click', () => {
      if (currentShareData && currentShareData.shareUrl) {
        triggerNativeShare(
          '💘 Crush Love Calculator',
          '😂 Try this Crush Calculator! Let\'s see what your result is 👀❤️',
          currentShareData.shareUrl
        );
      }
    });
  }
});
