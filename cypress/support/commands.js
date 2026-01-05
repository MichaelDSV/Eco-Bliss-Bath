import { selectors } from "./selectors";
import credentials from "../fixtures/credentials.json";


Cypress.Commands.add("getBySel", (selector, ...args) => {
  return cy.get(`[data-cy=${selector}]`, ...args);
});


Cypress.Commands.add("goToLoginPage", () => {
  cy.get(selectors.loginButton).click();
});


Cypress.Commands.add("login", () => {
  cy.visit("");
  cy.goToLoginPage();
  cy.get(selectors.usernameField).type(credentials.user.username);
  cy.get(selectors.passwordField).type(credentials.user.password);
  cy.get(selectors.submitButton).click();
});