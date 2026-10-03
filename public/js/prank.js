/* 💘 RECIPIENT PRANK STATE MACHINE & ANIMATION LOGIC */

document.addEventListener('DOMContentLoaded', async () => {
  const prankForm = document.getElementById('prankForm');
  const visitorNameInput = document.getElementById('visitorName');
  const crushNameInput = document.getElementById('crushName');
  const btnCalculate = document.getElementById('btnCalculate');

  const prankFormCard = document.getElementById('prankFormCard');
  const animationCard = document.getElementById('animationCard');
  const revealCard = document.getElementById('revealCard');

  const progressBar = document.getElementById('progressBar');
  const statusText = document.getElementById('statusText');

  const revealedCrushName = document.getElementById('revealedCrushName');
  const revealedCreatorName = document.getElementById('revealedCreatorName');
  const reactionButtons = document.querySelectorAll('.reaction-btn');

  // Extract short code from URL path (/c/:code)
  const pathParts = window.location.pathname.split('/');
  const shortCode = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2];

  let creatorName = 'your friend';
  let submissionId = null;

  // Load prank info (creator name) from API
  if (shortCode) {
    try {
      const res = await fetch(`/api/prank/${shortCode}`);
      const data = await res.json();
      if (data.success && data.data) {
        creatorName = data.data.creatorName || 'your friend';
      }
    } catch (err) {
      console.warn('Unable to pre-fetch creator info:', err);
    }
  }

  if (prankForm) {
    prankForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const visitorName = visitorNameInput.value.trim();
      const crushName = crushNameInput.value.trim();

      if (!visitorName || !crushName) {
        showToast('Please enter both your name and your crush\'s name!');
        return;
      }

      // Hide form card, show calculation animation card
      prankFormCard.classList.add('hidden');
      animationCard.classList.remove('hidden');

      // Start Fake Calculation Animation Sequence (3.2 seconds total)
      runFakeCalculationAnimation(async () => {
        // Submit prank payload to backend
        try {
          const res = await fetch('/api/submit-prank', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: shortCode,
              visitorName: visitorName,
              crushName: crushName
            })
          });

          const data = await res.json();
          if (data.success && data.data) {
            submissionId = data.data.submissionId;
            if (data.data.creatorName) {
              creatorName = data.data.creatorName;
            }
          }
        } catch (err) {
          console.error('Error submitting prank data:', err);
        }

        // Display Prank Reveal Screen
        revealedCrushName.innerText = crushName.toUpperCase();
        revealedCreatorName.innerText = creatorName;

        animationCard.classList.add('hidden');
        revealCard.classList.remove('hidden');

        // Trigger celebratory confetti burst
        triggerConfettiBurst();

        // Optional device vibration if supported
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      });
    });
  }

  // Fake Calculation Animation Helper
  function runFakeCalculationAnimation(onComplete) {
    const steps = [
      { text: '🔍 Analysing names...', progress: '20%', duration: 700 },
      { text: '❤️ Checking compatibility...', progress: '50%', duration: 800 },
      { text: '💕 Calculating love percentage...', progress: '75%', duration: 800 },
      { text: '🔥 Almost done...', progress: '95%', duration: 600 },
      { text: '██████████ 100%', progress: '100%', duration: 300 }
    ];

    let currentStep = 0;

    function executeNextStep() {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        statusText.innerText = step.text;
        progressBar.style.width = step.progress;
        currentStep++;
        setTimeout(executeNextStep, step.duration);
      } else {
        onComplete();
      }
    }

    executeNextStep();
  }

  // Confetti Burst Trigger
  function triggerConfettiBurst() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    }
  }

  // Reaction Button Click Handler
  reactionButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const selectedEmoji = btn.getAttribute('data-emoji');
      
      // Toggle selected class
      reactionButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      showToast(`Reaction set: ${selectedEmoji}`);

      if (submissionId) {
        try {
          await fetch('/api/reaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              submissionId: submissionId,
              reaction: selectedEmoji
            })
          });
        } catch (err) {
          console.error('Error saving reaction:', err);
        }
      }
    });
  });
});
