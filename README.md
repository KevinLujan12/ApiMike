# NASA Deep Space Archive Explorer

A modern, high-performance Single Page Application (SPA) designed for exploring the official **NASA Image and Video Library**. Built with a minimalist deep-space dark aesthetic and strict XSS-safe DOM rendering.

---

## ✨ Features & Architecture

- **Navbar**:
  - Orbital emblem and clean navigation.
  - Functional search input with keyboard shortcut (`/` or `Ctrl+K`), live clear button, and search trigger.
  - Live NASA API Gateway connection indicator.
  - Mobile drawer toggle.

- **Curated Archives Sidebar**:
  - Quick category filters: *Apollo Missions*, *Mars Exploration*, *James Webb (JWST)*, *Hubble Heritage*, *Galaxies & Nebulae*, *Black Holes*, *Artemis Program*, *Earth from Space*, *Exoplanets*, and *Space Shuttle*.
  - NASA Operations Center filters (*JSC*, *JPL*, *KSC*, *GSFC*, *ARC*, *MSFC*).
  - Telemetry summary card.

- **Main Gallery & Cards Grid**:
  - Responsive CSS Grid (`auto-fill, minmax(320px, 1fr)`).
  - Shimmering skeleton loader states during data transfer.
  - Safe card rendering using `document.createElement` and `textContent` for complete XSS immunity.
  - Card hover scale effects with smooth cubic-bezier transitions.
  - Center badges, catalog dates, truncated descriptions, and NASA IDs.
  - Sort selector (Relevance, Latest First, Historical First).
  - Load More pagination button.

- **Inspection Modal Dialog**:
  - Accessible native `<dialog>` element with smooth backdrop blur.
  - High-resolution asset viewer with direct link to original uncompressed source.
  - Metadata breakdown (NASA Center, Date Cataloged, Asset ID, Secondary Creator).
  - Interactive descriptor tags: clicking any tag immediately triggers a search.

- **Footer**:
  - NASA Image Library links, Open API documentation reference, media usage guidelines, and public domain attribution.

---

## 🚀 Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview production bundle:
   ```bash
   npm run preview
   ```

---

## ⚡ Deployment to Vercel

This repository includes a preconfigured [vercel.json](file:///c:/Users/nhaiy/OneDrive/Escritorio/api/vercel.json).

### Method 1: Vercel CLI
```bash
npx vercel
```

### Method 2: Git Integration
Push this repository to GitHub or GitLab and import it into [Vercel](https://vercel.com):
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
