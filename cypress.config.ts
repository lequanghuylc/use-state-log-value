import { defineConfig } from 'cypress';

export default defineConfig({
  video: true,
  e2e: {
    baseUrl: 'http://localhost:4173',
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.ts',
  },
});
