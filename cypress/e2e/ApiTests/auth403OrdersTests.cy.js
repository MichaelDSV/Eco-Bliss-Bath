/// <reference types="cypress" />

/**
 * "403 sur les données confidentielles d’un utilisateur si l’utilisateur n’est pas connecté"
 * - 401 : non authentifié
 * - 403 : authentifié mais pas autorisé
 **/

describe("Sécurité API - Accès refusé sans connexion (401/403)", () => {
  it("GET /orders sans token doit refuser l'accès (401 ou 403)", () => {
    cy.request({
      method: "GET",
      url: `${Cypress.env("apiUrl")}/orders`,
      failOnStatusCode: false, // récupérer le code d’erreur
    }).then((response) => {
      // 401 ou 403 selon backend
      expect([401, 403], `Status reçu: ${response.status}`).to.include(
        response.status
      );

      // Génère un rapport
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
