/**
 * Skeleton Loader Component
 * Renders shimmering cards while NASA API data is being fetched.
 */

export function renderSkeletons(container, count = 12) {
  container.innerHTML = '';
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'skeleton-card';
    card.setAttribute('aria-hidden', 'true');

    const media = document.createElement('div');
    media.className = 'skeleton-media';

    const body = document.createElement('div');
    body.className = 'skeleton-body';

    const lineId = document.createElement('div');
    lineId.className = 'skeleton-line id';

    const lineTitle1 = document.createElement('div');
    lineTitle1.className = 'skeleton-line title-1';

    const lineTitle2 = document.createElement('div');
    lineTitle2.className = 'skeleton-line title-2';

    const lineDesc1 = document.createElement('div');
    lineDesc1.className = 'skeleton-line desc-1';

    const lineDesc2 = document.createElement('div');
    lineDesc2.className = 'skeleton-line desc-2';

    const lineFooter = document.createElement('div');
    lineFooter.className = 'skeleton-line footer';

    body.append(lineId, lineTitle1, lineTitle2, lineDesc1, lineDesc2, lineFooter);
    card.append(media, body);
    fragment.appendChild(card);
  }

  container.appendChild(fragment);
}
