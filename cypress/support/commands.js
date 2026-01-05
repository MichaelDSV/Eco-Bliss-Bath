import { selectors } from "./selectors";
import credentials from "../fixtures/credentials.json";

Cypress.Commands.add("getBySel", (selector, ...args) => {
  return cy.get(`[data-cy=${selector}]`, ...args);
});

Cypress.Commands.add("goToLoginPage", () => {
  cy.get(selectors.loginButton).click();
});

Cypress.Commands.add("login", () => {
  // Utilise baseUrl défini dans cypress.config.js
  cy.visit("/");

  cy.goToLoginPage();

  cy.get(selectors.usernameField).clear().type(credentials.username);
  cy.get(selectors.passwordField).clear().type(credentials.password);

  cy.get(selectors.submitButton).click();
});
