/**
 * NASA Asset Inspection Modal Component
 */

export function setupModal({ onKeywordSelect }) {
  const dialog = document.getElementById('item-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const backdrop = document.getElementById('modal-backdrop-close');
  
  const modalImg = document.getElementById('modal-image');
  const modalFullresLink = document.getElementById('modal-fullres-link');
  const modalTitle = document.getElementById('modal-title');
  const modalCenterPill = document.getElementById('modal-center-pill');
  const modalDatePill = document.getElementById('modal-date-pill');
  const modalIdPill = document.getElementById('modal-id-pill');
  
  const modalCenterVal = document.getElementById('modal-center-val');
  const modalDateVal = document.getElementById('modal-date-val');
  const modalIdVal = document.getElementById('modal-id-val');
  const modalCreatorVal = document.getElementById('modal-creator-val');
  
  const modalDescription = document.getElementById('modal-description-text');
  const keywordsContainer = document.getElementById('modal-keywords-container');

  function open(item) {
    if (!dialog) return;

    // Reset media
    modalImg.src = item.highResUrl || item.thumbUrl || '';
    modalImg.alt = item.title;

    if (item.highResUrl || item.collectionHref) {
      modalFullresLink.href = item.highResUrl || item.collectionHref;
      modalFullresLink.style.display = 'inline-flex';
    } else {
      modalFullresLink.style.display = 'none';
    }

    // Set text contents strictly with textContent
    modalTitle.textContent = item.title;
    modalCenterPill.textContent = item.center;
    modalDatePill.textContent = item.date;
    modalIdPill.textContent = item.id;

    modalCenterVal.textContent = item.center || 'NASA Headquarters';
    modalDateVal.textContent = item.date;
    modalIdVal.textContent = item.id;
    modalCreatorVal.textContent = item.secondaryCreator || 'Official NASA Archives';

    modalDescription.textContent = item.description;

    // Populate keywords as interactive buttons
    keywordsContainer.innerHTML = '';
    if (item.keywords && item.keywords.length > 0) {
      item.keywords.forEach(keyword => {
        const tagBtn = document.createElement('button');
        tagBtn.type = 'button';
        tagBtn.className = 'keyword-tag-btn';
        tagBtn.textContent = `#${keyword.trim()}`;
        tagBtn.title = `Search archive for "${keyword.trim()}"`;
        
        tagBtn.addEventListener('click', () => {
          close();
          if (typeof onKeywordSelect === 'function') {
            onKeywordSelect(keyword.trim());
          }
        });

        keywordsContainer.appendChild(tagBtn);
      });
    } else {
      const noneNotice = document.createElement('span');
      noneNotice.style.fontSize = '0.75rem';
      noneNotice.style.color = 'var(--text-muted)';
      noneNotice.textContent = 'No index descriptors recorded';
      keywordsContainer.appendChild(noneNotice);
    }

    dialog.showModal();
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!dialog) return;
    dialog.close();
    document.body.style.overflow = '';
  }

  // Event bindings
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (backdrop) backdrop.addEventListener('click', close);

  // Close on Escape
  dialog.addEventListener('cancel', () => {
    document.body.style.overflow = '';
  });

  return {
    open,
    close
  };
}
