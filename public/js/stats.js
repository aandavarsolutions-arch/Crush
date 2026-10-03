/* 💘 CREATOR STATS DASHBOARD LOGIC */

document.addEventListener('DOMContentLoaded', async () => {
  const statsSubheading = document.getElementById('statsSubheading');
  const openCountElem = document.getElementById('openCount');
  const completedCountElem = document.getElementById('completedCount');
  const crushCountElem = document.getElementById('crushCount');
  const topReactionElem = document.getElementById('topReaction');
  const submissionsTableBody = document.getElementById('submissionsTableBody');

  const btnCopyLinkStats = document.getElementById('btnCopyLinkStats');
  const btnShareWhatsAppStats = document.getElementById('btnShareWhatsAppStats');

  // Parse path & query params
  const pathParts = window.location.pathname.split('/');
  const shortCode = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2];
  
  const urlParams = new URLSearchParams(window.location.search);
  let secretKey = urlParams.get('key');

  // Fallback to localStorage if key not in URL
  if (!secretKey && localStorage.getItem('my_prank_code') === shortCode) {
    secretKey = localStorage.getItem('my_prank_key');
  }

  if (!shortCode) {
    statsSubheading.innerText = 'Invalid link code.';
    return;
  }

  let shareUrl = `${window.location.origin}/c/${shortCode}`;

  try {
    const res = await fetch(`/api/stats/${shortCode}?key=${encodeURIComponent(secretKey || '')}`);
    const data = await res.json();

    if (data.success && data.data) {
      const stats = data.data;

      if (stats.creatorName) {
        statsSubheading.innerHTML = `Welcome back, <strong>${stats.creatorName}</strong>! Here's who fell for your prank 😂`;
      }

      openCountElem.innerText = stats.openCount || 0;
      completedCountElem.innerText = stats.completedCount || 0;
      crushCountElem.innerText = stats.crushSubmissionsCount || 0;
      if (stats.shareUrl) shareUrl = stats.shareUrl;

      // Find top reaction emoji
      if (stats.reactionsBreakdown) {
        let maxCount = -1;
        let topEmoji = '😂';
        Object.entries(stats.reactionsBreakdown).forEach(([emoji, count]) => {
          if (count > maxCount) {
            maxCount = count;
            topEmoji = emoji;
          }
        });
        topReactionElem.innerText = topEmoji;
      }

      // Populate Submissions Table
      if (stats.submissions && stats.submissions.length > 0) {
        submissionsTableBody.innerHTML = '';
        stats.submissions.forEach(sub => {
          const tr = document.createElement('tr');
          
          const timeFormatted = formatTime(sub.createdAt);
          
          tr.innerHTML = `
            <td style="font-weight: 700;">${escapeHtml(sub.visitorName)}</td>
            <td style="color: var(--primary-pink); font-weight: 800;">${escapeHtml(sub.crushName)}</td>
            <td style="font-size: 1.2rem;">${sub.reaction || '😂'}</td>
            <td style="font-size: 0.8rem; color: var(--text-dim);">${timeFormatted}</td>
          `;
          submissionsTableBody.appendChild(tr);
        });
      } else {
        submissionsTableBody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align: center; color: var(--text-dim); padding: 24px;">
              No friends have entered their crush name yet! Share your link now 😂
            </td>
          </tr>
        `;
      }
    } else {
      statsSubheading.innerText = data.error || 'Access denied or link expired.';
      submissionsTableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: #ff4d6d; padding: 20px;">
            ⚠️ Access Denied: Invalid authorization key. You can only view statistics for links you created.
          </td>
        </tr>
      `;
    }
  } catch (err) {
    statsSubheading.innerText = 'Error loading statistics.';
  }

  // Action Buttons
  if (btnCopyLinkStats) {
    btnCopyLinkStats.addEventListener('click', () => {
      copyToClipboard(shareUrl, '📋 Prank link copied!');
    });
  }

  if (btnShareWhatsAppStats) {
    btnShareWhatsAppStats.addEventListener('click', () => {
      const msg = `😂 Try this Crush Calculator!\nLet's see what your result is 👀❤️\n${shareUrl}`;
      shareOnWhatsApp(shareUrl, msg);
    });
  }

  // Format timestamp helper
  function formatTime(isoString) {
    if (!isoString) return 'Just now';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Just now';
    }
  }

  // Escape HTML helper
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
});
