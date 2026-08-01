import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5174",
    specPattern: "tests/e2e/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    fixturesFolder: "cypress/fixtures",
    video: false,
    screenshotOnRunFailure: true,
    screenshotsFolder: "cypress/screenshots",
    // Tiempos generosos para CI en contenedores lentos
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000,
    // Reintentos automáticos en CI para evitar flakiness
    retries: {
      runMode: 2,   // en `cypress run` (CI)
      openMode: 0,  // en `cypress open` (dev)
    },
    env: {
      // Variables de entorno disponibles en tests
      API_BASE: "/api/v1",
    },
  },
});
