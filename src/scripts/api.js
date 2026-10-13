/**
 * NASA Image and Video Library API Service
 * Endpoint: https://images-api.nasa.gov/search
 */

const NASA_API_BASE = 'https://images-api.nasa.gov/search';

let activeAbortController = null;

/**
 * Searches the NASA Image and Video Library.
 * @param {Object} options
 * @param {string} options.query - Search query string
 * @param {string} [options.center] - Optional NASA Center (e.g. JSC, JPL)
 * @param {number} [options.page=1] - Results page number
 * @returns {Promise<{items: Array, totalHits: number}>}
 */
export async function searchNasaArchives({ query, center = '', page = 1 }) {
  // Cancel any ongoing fetch request to avoid race conditions
  if (activeAbortController) {
    activeAbortController.abort();
  }
  activeAbortController = new AbortController();

  const params = new URLSearchParams();
  params.append('q', query.trim());
  params.append('media_type', 'image'); // Ensure visual image records
  params.append('page', page.toString());

  if (center) {
    params.append('center', center);
  }

  const url = `${NASA_API_BASE}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      signal: activeAbortController.signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`NASA API returned status ${response.status} (${response.statusText})`);
    }

    const data = await response.json();
    const collection = data.collection || {};
    const rawItems = collection.items || [];
    const totalHits = collection.metadata?.total_hits || rawItems.length;

    // Normalize items into consistent, safe data structures
    const normalizedItems = rawItems.map(item => normalizeNasaItem(item));

    return {
      items: normalizedItems,
      totalHits
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      // Intentionally cancelled by subsequent user search
      throw error;
    }
    console.error('NASA API Request Failure:', error);
    throw error;
  }
}

/**
 * Normalizes a raw NASA API item into a clean schema.
 * @param {Object} item - Raw NASA collection item
 * @returns {Object} Normalized item record
 */
function normalizeNasaItem(item) {
  const meta = (item.data && item.data[0]) || {};
  const links = item.links || [];

  // Locate the preview thumbnail image
  const previewLink = links.find(l => l.render === 'image' || l.rel === 'preview') || links[0];
  const thumbUrl = previewLink ? previewLink.href : '';

  // Clean date representation
  let formattedDate = 'Archival Date Unknown';
  if (meta.date_created) {
    try {
      const d = new Date(meta.date_created);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch {
      formattedDate = meta.date_created.slice(0, 10);
    }
  }

  // Derive high-resolution source url from thumbnail URL or collection
  let highResUrl = thumbUrl;
  if (thumbUrl && thumbUrl.includes('~thumb.')) {
    highResUrl = thumbUrl.replace('~thumb.', '~orig.');
  } else if (thumbUrl && thumbUrl.includes('~medium.')) {
    highResUrl = thumbUrl.replace('~medium.', '~orig.');
  }

  return {
    id: meta.nasa_id || 'UNKNOWN-ID',
    title: meta.title ? meta.title.trim() : 'Untitled NASA Record',
    description: (meta.description || meta.description_508 || 'No official mission description cataloged for this asset.').trim(),
    center: meta.center || 'NASA',
    date: formattedDate,
    rawDate: meta.date_created || '',
    keywords: Array.isArray(meta.keywords) ? meta.keywords : [],
    secondaryCreator: meta.secondary_creator || meta.photographer || '',
    thumbUrl,
    highResUrl,
    collectionHref: item.href || ''
  };
}
