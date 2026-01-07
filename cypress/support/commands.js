import { selectors } from "./selectors";
import credentials from "../fixtures/credentials.json";

/**
 * Permet de sélectionner facilement des éléments via data-cy
 * Exemple : cy.getBySel("login-button")
 */
Cypress.Commands.add("getBySel", (selector, ...args) => {
  return cy.get(`[data-cy=${selector}]`, ...args);
});

/**
 * Va vers la page de login (on suppose que l'app est déjà ouverte)
 */
Cypress.Commands.add("goToLoginPage", () => {
  cy.get(selectors.loginButton).click();
});

/**
 * Login UI via le formulaire
 * - Suppose que tu as déjà fait cy.visit("/") avant (ou alors on le fait si besoin)
 */
Cypress.Commands.add("login", () => {
  // Si jamais le test n'a pas visité l'app avant, on sécurise
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

/**
 * Screenshot "safe" (évite les timeouts et les erreurs de chain Promise)
 * - On force une petite stabilité DOM
 * - On augmente le timeout
 * - IMPORTANT : pas de .catch() ici (ce n'est pas une Promise)
 */
Cypress.Commands.add("safeScreenshot", (name) => {
  // Assure que la page est bien "stable" avant de capturer
  cy.document().its("readyState").should("eq", "complete");
  cy.get("body", { timeout: 60000 }).should("be.visible");

  // Petite pause pour éviter les captures pendant un re-render
  cy.wait(250);

  cy.screenshot(name, {
    capture: "viewport",
    timeout: 60000,
    overwrite: true,
  });
});
