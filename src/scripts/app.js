/**
 * NASA Deep Space Archive Explorer
 * Core Application Controller
 */

import { searchNasaArchives } from './api.js';
import { createCardElement } from './components/card.js';
import { renderSkeletons } from './components/skeleton.js';
import { setupModal } from './components/modal.js';

// Application State
const state = {
  query: 'apollo',
  queryLabel: 'Apollo Missions',
  center: '',
  page: 1,
  sortBy: 'relevance',
  items: [],
  totalHits: 0,
  isLoading: false,
};

// DOM Element References
const elements = {
  // Search Bar
  searchForm: document.getElementById('search-form'),
  searchInput: document.getElementById('search-input'),
  searchClearBtn: document.getElementById('search-clear-btn'),
  brandHomeLink: document.getElementById('brand-home-link'),

  // Mobile Navigation
  mobileToggleBtn: document.getElementById('mobile-toggle-btn'),
  sidebar: document.getElementById('sidebar'),
  sidebarBackdrop: document.getElementById('sidebar-backdrop'),

  // Sidebar Filters
  categoryList: document.getElementById('category-filter-list'),
  centerChips: document.getElementById('center-filter-chips'),

  // Main Content & Header
  activeQueryTitle: document.getElementById('active-query-title'),
  resultsStatsText: document.getElementById('results-stats-text'),
  activeCenterBadge: document.getElementById('active-center-badge'),
  sortSelect: document.getElementById('sort-select'),

  // Gallery & States
  cardsGrid: document.getElementById('cards-grid'),
  emptyState: document.getElementById('empty-state'),
  emptyResetBtn: document.getElementById('empty-reset-btn'),
  errorState: document.getElementById('error-state'),
  errorMessage: document.getElementById('error-message'),
  errorRetryBtn: document.getElementById('error-retry-btn'),

  // Pagination
  paginationContainer: document.getElementById('pagination-container'),
  loadMoreBtn: document.getElementById('load-more-btn'),

  // Year
  currentYear: document.getElementById('current-year'),
};

// Initialize Inspection Modal
const modal = setupModal({
  onKeywordSelect: (keyword) => {
    executeNewSearch(keyword, `Tag: ${keyword}`);
    elements.searchInput.value = keyword;
    toggleClearButton();
  }
});

/**
 * Executes a search query from scratch.
 * @param {string} query - Query string
 * @param {string} label - Friendly display title
 */
export async function executeNewSearch(query, label = '') {
  if (!query || !query.trim()) return;

  state.query = query.trim();
  state.queryLabel = label || query.trim();
  state.page = 1;
  state.items = [];

  // Update header text immediately
  elements.activeQueryTitle.textContent = state.queryLabel;
  elements.resultsStatsText.textContent = 'Contacting NASA Gateway...';

  // Deselect sidebar category button if searching arbitrary term
  updateSidebarActiveCategory(query);

  await fetchArchiveData();
}

/**
 * Fetches NASA records using current state and updates UI.
 */
async function fetchArchiveData(isAppending = false) {
  if (state.isLoading) return;
  state.isLoading = true;

  // UI state updates
  hideAllStates();

  if (!isAppending) {
    renderSkeletons(elements.cardsGrid, 9);
    elements.paginationContainer.classList.add('hidden');
  } else {
    elements.loadMoreBtn.disabled = true;
    elements.loadMoreBtn.querySelector('.btn-text').textContent = 'Loading records...';
  }

  try {
    const { items, totalHits } = await searchNasaArchives({
      query: state.query,
      center: state.center,
      page: state.page
    });

    state.totalHits = totalHits;

    if (isAppending) {
      state.items = [...state.items, ...items];
    } else {
      state.items = items;
    }

    renderGallery();

  } catch (error) {
    if (error.name === 'AbortError') return;

    console.error('Archive query error:', error);
    elements.cardsGrid.innerHTML = '';
    elements.paginationContainer.classList.add('hidden');
    elements.errorMessage.textContent = error.message || 'Unable to connect to NASA API service.';
    elements.errorState.classList.remove('hidden');
    elements.resultsStatsText.textContent = 'Telemetry error';
  } finally {
    state.isLoading = false;
    elements.loadMoreBtn.disabled = false;
    elements.loadMoreBtn.querySelector('.btn-text').textContent = 'Load Additional Records';
  }
}

/**
 * Renders the gallery cards with sort order applied.
 */
function renderGallery() {
  hideAllStates();

  if (!state.items || state.items.length === 0) {
    elements.cardsGrid.innerHTML = '';
    elements.emptyState.classList.remove('hidden');
    elements.resultsStatsText.textContent = '0 records found in archive';
    elements.paginationContainer.classList.add('hidden');
    return;
  }

  // Apply sorting
  const sortedItems = sortItems([...state.items], state.sortBy);

  // Update stats summary
  const formattedCount = new Intl.NumberFormat().format(state.totalHits);
  const showingCount = sortedItems.length;
  elements.resultsStatsText.textContent = `Showing ${showingCount} of ${formattedCount} verified archives`;

  // Populate grid using safe DOM cards
  elements.cardsGrid.innerHTML = '';
  const fragment = document.createDocumentFragment();

  sortedItems.forEach((item) => {
    const cardEl = createCardElement(item, (clickedItem) => {
      modal.open(clickedItem);
    });
    fragment.appendChild(cardEl);
  });

  elements.cardsGrid.appendChild(fragment);

  // Determine pagination visibility
  if (state.items.length < state.totalHits) {
    elements.paginationContainer.classList.remove('hidden');
  } else {
    elements.paginationContainer.classList.add('hidden');
  }
}

/**
 * Sorts array of items based on user selection.
 */
function sortItems(items, sortBy) {
  if (sortBy === 'newest') {
    return items.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
  }
  if (sortBy === 'oldest') {
    return items.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
  }
  return items; // Default relevance from API
}

/**
 * Hides all special state containers.
 */
function hideAllStates() {
  elements.emptyState.classList.add('hidden');
  elements.errorState.classList.add('hidden');
}

/**
 * Updates active category styling in the sidebar.
 */
function updateSidebarActiveCategory(activeQuery) {
  const buttons = elements.categoryList.querySelectorAll('.filter-item');
  buttons.forEach(btn => {
    const cat = btn.getAttribute('data-category');
    if (cat.toLowerCase() === activeQuery.toLowerCase()) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/**
 * Shows/hides the search clear button.
 */
function toggleClearButton() {
  if (elements.searchInput.value.trim().length > 0) {
    elements.searchClearBtn.classList.remove('hidden');
  } else {
    elements.searchClearBtn.classList.add('hidden');
  }
}

/**
 * Toggles mobile sidebar drawer.
 */
function toggleMobileSidebar(forceState) {
  const isOpen = forceState !== undefined ? forceState : !elements.sidebar.classList.contains('mobile-open');
  elements.sidebar.classList.toggle('mobile-open', isOpen);
  elements.sidebarBackdrop.classList.toggle('active', isOpen);
  elements.mobileToggleBtn.setAttribute('aria-expanded', isOpen.toString());
}

/**
 * Registers application event listeners.
 */
function registerEventListeners() {
  // Search Form Submit
  elements.searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = elements.searchInput.value.trim();
    if (query) {
      executeNewSearch(query, `Search: "${query}"`);
      // Scroll to content on small screens
      if (window.innerWidth < 900) {
        elements.cardsGrid.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

  // Search Input live typing
  elements.searchInput.addEventListener('input', toggleClearButton);

  // Clear Search Button
  elements.searchClearBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    elements.searchInput.focus();
    toggleClearButton();
  });

  // Home Brand click
  elements.brandHomeLink.addEventListener('click', (e) => {
    e.preventDefault();
    elements.searchInput.value = '';
    toggleClearButton();
    const defaultBtn = elements.categoryList.querySelector('[data-category="apollo"]');
    if (defaultBtn) defaultBtn.click();
  });

  // Global Keyboard Shortcut: Press '/' or 'Ctrl+K' to focus search
  window.addEventListener('keydown', (e) => {
    if ((e.key === '/' && document.activeElement !== elements.searchInput) || 
        ((e.ctrlKey || e.metaKey) && e.key === 'k')) {
      e.preventDefault();
      elements.searchInput.focus();
      elements.searchInput.select();
    }
  });

  // Sidebar Category Filters
  elements.categoryList.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-item');
    if (!btn) return;

    const categoryQuery = btn.getAttribute('data-category');
    const categoryLabel = btn.getAttribute('data-label') || btn.querySelector('.filter-name').textContent;

    elements.searchInput.value = '';
    toggleClearButton();

    executeNewSearch(categoryQuery, categoryLabel);

    if (window.innerWidth < 900) {
      toggleMobileSidebar(false);
    }
  });

  // NASA Center Chips
  elements.centerChips.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;

    elements.centerChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    const centerVal = chip.getAttribute('data-center');
    state.center = centerVal;

    // Update active center badge in header
    if (centerVal) {
      elements.activeCenterBadge.textContent = `CENTER: ${centerVal}`;
      elements.activeCenterBadge.classList.remove('hidden');
    } else {
      elements.activeCenterBadge.classList.add('hidden');
    }

    state.page = 1;
    fetchArchiveData();
  });

  // Sort Selector Change
  elements.sortSelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    renderGallery();
  });

  // Load More Button
  elements.loadMoreBtn.addEventListener('click', () => {
    state.page += 1;
    fetchArchiveData(true);
  });

  // Error Retry
  elements.errorRetryBtn.addEventListener('click', () => {
    fetchArchiveData();
  });

  // Empty State Reset
  elements.emptyResetBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    toggleClearButton();
    const defaultBtn = elements.categoryList.querySelector('[data-category="apollo"]');
    if (defaultBtn) defaultBtn.click();
  });

  // Mobile Drawer togglers
  elements.mobileToggleBtn.addEventListener('click', () => {
    toggleMobileSidebar();
  });

  elements.sidebarBackdrop.addEventListener('click', () => {
    toggleMobileSidebar(false);
  });

  // Current year in footer
  if (elements.currentYear) {
    elements.currentYear.textContent = new Date().getFullYear().toString();
  }
}

/**
 * Bootstraps the application.
 */
function init() {
  registerEventListeners();
  // Fetch initial curated category (Apollo Missions)
  fetchArchiveData();
}

// Start app once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
