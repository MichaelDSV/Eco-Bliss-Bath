/// <reference types="cypress" />

/**
 * Objectif (grille d’évaluation) :
 * "403 sur les données confidentielles d’un utilisateur si l’utilisateur n’est pas connecté"
 *
 * En pratique, selon l’implémentation backend, le refus peut être :
 * - 401 (Unauthorized) : pas de token => non authentifié
 * - 403 (Forbidden) : authentifié mais pas autorisé
 *
 * Ici, on valide que l’accès aux données du panier (/orders) est REFUSÉ sans authentification.
 */

describe("Sécurité API - Accès refusé sans connexion (401/403)", () => {
  it("GET /orders sans token doit refuser l'accès (401 ou 403)", () => {
    cy.request({
      method: "GET",
      url: `${Cypress.env("apiUrl")}/orders`,
      failOnStatusCode: false, // important : on veut récupérer le code d’erreur
    }).then((response) => {
      // On accepte 401 ou 403 selon le backend
      expect([401, 403], `Status reçu: ${response.status}`).to.include(response.status);

      // Petite trace utile pour ton dossier / preuves
      cy.writeFile("cypress/logs/orders_no_auth.json", {
        endpoint: "/orders",
        expected: "401 or 403",
        status: response.status,
        body: response.body,
        timestamp: new Date().toISOString(),
      });
    });
  });
});
