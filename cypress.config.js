const { defineConfig } = require("cypress");

module.exports = defineConfig({
  // Variables d'environnement
  env: {
    apiUrl: "http://localhost:8081",
    username: "test2@test.fr",
    password: "testtest",
  },

  // Vidéos & screenshots
  video: true,
  videosFolder: "cypress/videos",
  screenshotOnRunFailure: true,
  screenshotsFolder: "cypress/screenshots",
  defaultCommandTimeout: 10000,

  // Reporter Mochawesome
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: "cypress/reports",
    reportPageTitle: "Eco Bliss Bath - Cypress Report",
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },

  e2e: {
    baseUrl: "http://localhost:4200",

    specPattern: "cypress/e2e/**/*.cy.{js,ts}",

    setupNodeEvents(on, config) {
      require("cypress-mochawesome-reporter/plugin")(on);
      return config;
    },
  },
});
