/* ============================================================
   RESEARCHPILOT — script.js
   Handles: API calls · agent pipeline animation · result rendering
   ============================================================

   HOW TO CONNECT YOUR BACKEND
   ─────────────────────────────
   1. Set API_BASE_URL below to your FastAPI server address.
   2. Your /generate endpoint should accept POST with JSON body:
        { "domain": "string" }
      and return the structured JSON described in the project docs.
   3. Run your FastAPI server, then open index.html in a browser.
      (Use a local server like: python -m http.server 5500)
   ============================================================ */


/* ── 1. Config ──────────────────────────────────────────────
   Replace this URL with your running FastAPI backend address.
   Examples:
     - Local dev:    'http://localhost:8000'
     - Railway:      'https://your-app.up.railway.app'
     - Render:       'https://your-app.onrender.com'
   ─────────────────────────────────────────────────────────── */
const API_BASE_URL = "https://research-pilot-jhb9.onrender.com";

/* ── 2. DOM References ───────────────────────────────────── */
const domainInput     = document.getElementById('domain-input');
const generateBtn     = document.getElementById('generate-btn');
const loadingSection  = document.getElementById('loading-section');
const resultsSection  = document.getElementById('results-section');
const errorBanner     = document.getElementById('error-banner');
const errorText       = document.getElementById('error-text');

// Results display elements
const resultsDomainTag = document.getElementById('results-domain-tag');
const ideaTitle        = document.getElementById('idea-title');
const scoreNum         = document.getElementById('score-num');
const scoreBadge       = document.getElementById('score-badge');
const ringProgress     = document.getElementById('ring-progress');
const strengthsBody    = document.getElementById('strengths-body');
const weaknessesBody   = document.getElementById('weaknesses-body');
const planTimeline     = document.getElementById('plan-timeline');

// SVG score ring: circumference = 2π × r = 2π × 40 ≈ 251.33
const RING_CIRCUMFERENCE = 2 * Math.PI * 40;


/* ── 3. Event Listeners ──────────────────────────────────── */

// Click generate button
generateBtn.addEventListener('click', handleGenerate);

// Press Enter inside the input field
domainInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleGenerate();
});

// Clear error border styling when user starts typing again
domainInput.addEventListener('input', () => {
  domainInput.classList.remove('input-error');
});

// Quick-select domain chips
document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    domainInput.value = chip.dataset.value;
    domainInput.classList.remove('input-error');
    domainInput.focus();
  });
});


/* ── 4. Main Handler ─────────────────────────────────────── */

async function handleGenerate() {
  const domain = domainInput.value.trim();

  // Validate — domain must not be empty
  if (!domain) {
    domainInput.classList.add('input-error');
    domainInput.focus();
    // Remove error style after animation completes
    setTimeout(() => domainInput.classList.remove('input-error'), 800);
    return;
  }

  // Lock UI
  setButtonState('loading');
  hideError();
  hideResults();
  showLoading();

  // Kick off the agent progress animation independently of the API call.
  // 2800ms is a comfortable estimate; the actual API response determines
  // when we stop the animation.
  const agentAnimation = startAgentAnimation(2800);

  try {
    const data = await fetchProjectIdea(domain);

    // Stop animation and mark all steps done before showing results
    agentAnimation.stop();
    markAllAgentsDone();

    // Brief pause so user sees the "all done" state before transition
    await delay(450);

    hideLoading();
    renderResults(data);
    showResults();

    // Smooth-scroll down to the results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    agentAnimation.stop();
    hideLoading();
    showError(err.message);
    console.error('[ResearchPilot]', err);

  } finally {
    setButtonState('idle');
  }
}


/* ── 5. API Call ─────────────────────────────────────────── */

async function fetchProjectIdea(domain) {
  const response = await fetch(`${API_BASE_URL}/research`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ domain }),
  });

  if (!response.ok) {
    // Try to extract a detail message from the FastAPI error body
    let detail = `Server responded with status ${response.status}`;
    try {
      const errBody = await response.json();
      if (errBody.detail) detail = errBody.detail;
    } catch (_) { /* ignore JSON parse errors on error responses */ }
    throw new Error(detail);
  }

  return response.json();
}


/* ── 6. Agent Pipeline Animation ────────────────────────────
   Sequentially activates each agent step over `totalMs`
   milliseconds, mimicking the LangGraph workflow stages.
   Returns a controller with a .stop() method.
   ─────────────────────────────────────────────────────────── */

function startAgentAnimation(totalMs) {
  const steps       = document.querySelectorAll('.agent-step');
  const stepCount   = steps.length;
  const stepDuration = totalMs / stepCount;
  let currentIndex  = 0;
  let intervalId    = null;

  // Reset all steps to dim state
  steps.forEach((s) => s.classList.remove('active', 'done'));

  // Activate first step immediately
  activateStep(0);

  intervalId = setInterval(() => {
    completeStep(currentIndex);
    currentIndex++;
    if (currentIndex < stepCount) {
      activateStep(currentIndex);
    } else {
      // All steps cycled — clear the interval naturally
      clearInterval(intervalId);
    }
  }, stepDuration);

  function activateStep(index) {
    if (steps[index]) steps[index].classList.add('active');
  }

  function completeStep(index) {
    if (steps[index]) {
      steps[index].classList.remove('active');
      steps[index].classList.add('done');
    }
  }

  return {
    stop() {
      clearInterval(intervalId);
    },
  };
}

function markAllAgentsDone() {
  document.querySelectorAll('.agent-step').forEach((s) => {
    s.classList.remove('active');
    s.classList.add('done');
  });
}


/* ── 7. Render Results ───────────────────────────────────── */

function renderResults(data) {
  // — Domain tag
  resultsDomainTag.textContent = data.domain;

  // — Project idea title
  ideaTitle.textContent = data.idea;

  // — Score (ring animation + counter)
  const score = Math.min(10, Math.max(0, Number(data.score)));
  animateScoreRing(score);
  animateScoreCounter(score);
  applyScoreBadge(score);

  // — Strengths & Weaknesses
  strengthsBody.textContent = data.strengths;
  weaknessesBody.textContent = data.weaknesses;

  // — Implementation plan steps
  renderPlan(data.plan);
}


/* ── 8. Score Ring ───────────────────────────────────────── */

function animateScoreRing(score) {
  // Determine stroke colour by score tier
  const colour = score >= 8 ? '#16A34A'  // green  — excellent
               : score >= 5 ? '#6D5FFA'  // accent — moderate / strong
               :              '#D97706'; // amber  — needs work

  ringProgress.style.stroke = colour;

  // Dash offset controls how much of the circle is filled
  const offset = RING_CIRCUMFERENCE - (score / 10) * RING_CIRCUMFERENCE;

  // Must be queued in rAF so the CSS transition fires after paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ringProgress.style.strokeDashoffset = offset;
    });
  });
}

function animateScoreCounter(targetScore) {
  const duration = 1300; // ms
  const startTime = performance.now();
  let lastValue = -1;

  function tick(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic: feels snappy then settles
    const eased   = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * targetScore);

    // Only update DOM when the displayed number actually changes
    if (current !== lastValue) {
      scoreNum.textContent = current;
      lastValue = current;
    }

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

function applyScoreBadge(score) {
  let text, bg, color;

  if (score >= 9) {
    text = 'Excellent';  bg = '#DCFCE7'; color = '#16A34A';
  } else if (score >= 7) {
    text = 'Strong';     bg = '#EDEAFF'; color = '#6D5FFA';
  } else if (score >= 5) {
    text = 'Moderate';   bg = '#FEF3C7'; color = '#D97706';
  } else {
    text = 'Needs Work'; bg = '#FEE2E2'; color = '#DC2626';
  }

  scoreBadge.textContent       = text;
  scoreBadge.style.background  = bg;
  scoreBadge.style.color       = color;
}


/* ── 9. Implementation Plan ──────────────────────────────── */

function renderPlan(steps) {
  planTimeline.innerHTML = '';

  steps.forEach((stepText, index) => {
    const li = document.createElement('li');
    li.className = 'plan-step';
    li.setAttribute('data-step', index + 1);

    // Stagger the slide-in animation
    li.style.animationDelay = `${index * 75}ms`;

    // Progress bar fill width — earlier steps shown with higher confidence
    // (visual metaphor: clearer path for foundational steps)
    const totalSteps  = steps.length;
    const fillPercent = totalSteps > 1
      ? Math.round(95 - (index / (totalSteps - 1)) * 50)
      : 80;

    li.innerHTML = `
      <span class="plan-step-label">${escapeHTML(stepText)}</span>
      <div class="plan-step-bar">
        <div class="plan-step-bar-fill" data-fill="${fillPercent}"></div>
      </div>
    `;

    planTimeline.appendChild(li);
  });

  // Trigger fill animations after a short delay so they cascade in
  requestAnimationFrame(() => {
    const fills = planTimeline.querySelectorAll('.plan-step-bar-fill');
    fills.forEach((fill, i) => {
      setTimeout(() => {
        fill.style.width = fill.dataset.fill + '%';
        // Also animate the step number bubble colour
        const step = fill.closest('.plan-step');
        if (step) step.classList.add('step-ready');
      }, 150 + i * 90);
    });
  });
}


/* ── 10. UI State Helpers ────────────────────────────────── */

function showLoading() {
  loadingSection.classList.add('visible');
  loadingSection.setAttribute('aria-hidden', 'false');
}

function hideLoading() {
  loadingSection.classList.remove('visible');
  loadingSection.setAttribute('aria-hidden', 'true');
}

function showResults() {
  resultsSection.classList.add('visible');
  resultsSection.setAttribute('aria-hidden', 'false');
}

function hideResults() {
  resultsSection.classList.remove('visible');
  resultsSection.setAttribute('aria-hidden', 'true');
}

function showError(message) {
  const friendly = buildErrorMessage(message);
  errorText.textContent = friendly;
  errorBanner.classList.add('visible');
  errorBanner.setAttribute('aria-hidden', 'false');
}

function hideError() {
  errorBanner.classList.remove('visible');
  errorBanner.setAttribute('aria-hidden', 'true');
}

function setButtonState(state) {
  const label  = generateBtn.querySelector('.btn-label');
  const arrow  = generateBtn.querySelector('.btn-arrow');

  if (state === 'loading') {
    generateBtn.disabled = true;
    label.textContent    = 'Generating…';
    arrow.textContent    = '⏳';
  } else {
    generateBtn.disabled = false;
    label.textContent    = 'Generate';
    arrow.textContent    = '→';
  }
}


/* ── 11. Utility Helpers ─────────────────────────────────── */

/** Converts common fetch errors into clear, actionable messages. */
function buildErrorMessage(raw) {
  if (!raw) return 'An unknown error occurred. Please try again.';

  if (raw.toLowerCase().includes('failed to fetch') ||
      raw.toLowerCase().includes('networkerror') ||
      raw.toLowerCase().includes('load failed')) {
    return 'Could not reach the server. Make sure your FastAPI backend is running at: ' + API_BASE_URL;
  }

  if (raw.includes('status 422')) {
    return 'The server rejected the request — check that your /generate endpoint accepts { "domain": "string" }.';
  }

  if (raw.includes('status 500')) {
    return 'The server encountered an internal error. Check your FastAPI logs for details.';
  }

  return raw;
}

/** Escapes HTML special characters to prevent XSS from API data. */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Simple promise-based delay helper. */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}