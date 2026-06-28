import { defineConfig } from 'vite';

export default defineConfig({
  // Relative URLs so the built site works on GitHub Pages project sites
  // (e.g. …/S3-Chem/) as well as at domain root and on Vite dev server.
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('elementsDetail')) return 'elements-detail';
          if (id.includes('elementsIndex') || id.includes('elementShells')) return 'elements-index';
          if (id.includes('elementsData')) return 'elements-data';
          if (id.includes('threeRenderer')) return 'three-renderer';
          if (id.includes('tutorialController')) return 'tutorial';
          if (id.includes('uiController')) return 'ui-controller';
          if (id.includes('toolContentFactories')) return 'tool-content';
          if (id.includes('chemFlashcardApp')) return 'flashcards';
          if (id.includes('mascotController')) return 'mascot';
          if (id.includes('chapterDrawOverlay')) return 'chapter-overlays';
          if (id.includes('toolsModalController') || id.includes('chemToolContent') || id.includes('chemToolInteractions')) {
            return 'tools-bundle';
          }
          if (id.includes('worksheetHubController')) return 'worksheet-hub';
          if (id.includes('summaryHubController')) return 'summary-hub';
        },
      },
    },
  },
  server: {
    headers: {
      // iPad Safari can aggressively cache; ensure refresh pulls latest dev bundle.
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    proxy: {
      // Proxy all /api/chem requests to the chemistry API server
      '/api/chem': {
        target: 'http://10.0.0.149:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chem/, ''),
      },
    },
  },
});
