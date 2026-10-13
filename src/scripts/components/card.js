/**
 * NASA Record Card Component
 * Strictly uses DOM APIs & textContent to ensure 100% XSS immunity.
 */

/**
 * Creates an interactive NASA record card element.
 * @param {Object} item - Normalized NASA item record
 * @param {Function} onClick - Handler when card is clicked
 * @returns {HTMLElement} Card DOM element
 */
export function createCardElement(item, onClick) {
  const card = document.createElement('article');
  card.className = 'nasa-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `Inspect ${item.title}`);

  // Card Media Container
  const mediaContainer = document.createElement('div');
  mediaContainer.className = 'card-media';

  // Placeholder fallback icon
  const placeholder = document.createElement('div');
  placeholder.className = 'card-img-placeholder';
  placeholder.innerHTML = `
    <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="m4.93 4.93 14.14 14.14"></path>
    </svg>
  `;
  mediaContainer.appendChild(placeholder);

  // Card Image
  if (item.thumbUrl) {
    const img = document.createElement('img');
    img.className = 'card-img';
    img.alt = item.title;
    img.loading = 'lazy';
    img.src = item.thumbUrl;

    img.addEventListener('load', () => {
      img.classList.add('loaded');
      placeholder.style.display = 'none';
    });

    img.addEventListener('error', () => {
      img.remove();
      placeholder.style.display = 'flex';
    });

    mediaContainer.appendChild(img);
  }

  // Overlay Badges
  const badgesRow = document.createElement('div');
  badgesRow.className = 'card-overlay-badges';

  const centerBadge = document.createElement('span');
  centerBadge.className = 'card-center-badge';
  centerBadge.textContent = item.center;

  const dateBadge = document.createElement('span');
  dateBadge.className = 'card-date-badge';
  dateBadge.textContent = item.date;

  badgesRow.appendChild(centerBadge);
  badgesRow.appendChild(dateBadge);
  mediaContainer.appendChild(badgesRow);

  // Card Content Body
  const content = document.createElement('div');
  content.className = 'card-content';

  const titleRow = document.createElement('div');
  titleRow.className = 'card-title-row';

  const nasaIdEl = document.createElement('span');
  nasaIdEl.className = 'card-nasa-id';
  nasaIdEl.textContent = item.id;

  const titleEl = document.createElement('h3');
  titleEl.className = 'card-title';
  titleEl.textContent = item.title;
  titleEl.title = item.title;

  titleRow.appendChild(nasaIdEl);
  titleRow.appendChild(titleEl);

  const descEl = document.createElement('p');
  descEl.className = 'card-description';
  // Sanitized text content (prevents any injected script or HTML)
  descEl.textContent = item.description;

  // Card Footer Meta
  const footerMeta = document.createElement('div');
  footerMeta.className = 'card-footer-meta';

  const actionCue = document.createElement('span');
  actionCue.className = 'card-action-cue';
  
  const actionText = document.createElement('span');
  actionText.textContent = 'Inspect Record';
  
  const actionSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  actionSvg.setAttribute('viewBox', '0 0 24 24');
  actionSvg.setAttribute('width', '14');
  actionSvg.setAttribute('height', '14');
  actionSvg.setAttribute('stroke', 'currentColor');
  actionSvg.setAttribute('stroke-width', '2');
  actionSvg.setAttribute('fill', 'none');
  actionSvg.setAttribute('stroke-linecap', 'round');
  actionSvg.setAttribute('stroke-linejoin', 'round');
  
  const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  polyline.setAttribute('points', '9 18 15 12 9 6');
  actionSvg.appendChild(polyline);

  actionCue.appendChild(actionText);
  actionCue.appendChild(actionSvg);

  const keywordsCount = document.createElement('span');
  keywordsCount.className = 'card-keywords-preview';
  if (item.keywords && item.keywords.length > 0) {
    keywordsCount.textContent = `${item.keywords.length} descriptors`;
  }

  footerMeta.appendChild(actionCue);
  footerMeta.appendChild(keywordsCount);

  content.appendChild(titleRow);
  content.appendChild(descEl);
  content.appendChild(footerMeta);

  card.appendChild(mediaContainer);
  card.appendChild(content);

  // Event handlers
  const triggerClick = () => {
    if (typeof onClick === 'function') {
      onClick(item);
    }
  };

  card.addEventListener('click', triggerClick);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerClick();
    }
  });

  return card;
}
