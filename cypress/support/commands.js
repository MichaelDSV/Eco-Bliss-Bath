import { selectors } from "./selectors";
import credentials from "../fixtures/credentials.json";

Cypress.Commands.add("getBySel", (selector, ...args) => {
  return cy.get(`[data-cy=${selector}]`, ...args);
});

Cypress.Commands.add("goToLoginPage", () => {
  cy.get(selectors.loginButton).click();
});

Cypress.Commands.add("login", () => {
  cy.location("href").then((href) => {
    if (!href || href === "about:blank") {
      cy.visit("/");
    }
  });

  cy.goToLoginPage();

  const username = credentials.user?.username ?? credentials.username;
  const password = credentials.user?.password ?? credentials.password;

  cy.get(selectors.usernameField).clear().type(username);
  cy.get(selectors.passwordField).clear().type(password);
  cy.get(selectors.submitButton).click();
});

/**Screenshot "safe" (évite les timeouts)*/
Cypress.Commands.add("safeScreenshot", (name) => {
  // Assure que la page est stable avant de capturer
  cy.document().its("readyState").should("eq", "complete");
  cy.get("body", { timeout: 60000 }).should("be.visible");

  // pause pour éviter les captures pendant un re-render
  cy.wait(250);

  cy.screenshot(name, {
    capture: "viewport",
    timeout: 60000,
    overwrite: true,
  });
});
