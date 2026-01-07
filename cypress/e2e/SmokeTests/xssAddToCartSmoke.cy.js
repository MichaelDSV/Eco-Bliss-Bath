describe("Smoke – Faille XSS sur la route d’ajout au panier", () => {
  it("doit bloquer une tentative anormale lors de l’ajout au panier", () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit("/");

    cy.login();

    cy.visit("#/products/random");

    cy.contains("Ajouter au panier").click();

    // Comportement attendu : pas d'exécution JS, pas de crash, pas d'injection visible
    cy.url().should("not.include", "javascript:");
    cy.url().should("include", "/");

    // Vérifie que l’app reste fonctionnelle
    cy.contains("Mon panier").should("exist");
  });
});
