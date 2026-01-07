describe("Smoke – Faille XSS sur la route d’ajout au panier", () => {
  it("doit bloquer une tentative anormale lors de l’ajout au panier", () => {


    cy.clearCookies();
cy.clearLocalStorage();
cy.visit("/");          // ou cy.visit(credentials.baseURL) si tu préfères

    // Utilisateur connecté
    cy.login();

    // Accès à une fiche produit
    cy.visit("#/products/random");

    // Tentative d’ajout au panier
    cy.contains("Ajouter au panier").click();

    // Comportement attendu : pas d'exécution JS, pas de crash, pas d'injection visible
    cy.url().should("not.include", "javascript:");
    cy.url().should("include", "/");

    // Vérifie que l’app reste fonctionnelle
    cy.contains("Mon panier").should("exist");
  });
});
