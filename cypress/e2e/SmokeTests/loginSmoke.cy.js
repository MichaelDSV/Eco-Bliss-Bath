describe("Page de connexion", () => {
  it("Présence des champs et du bouton de connexion", () => {
    cy.visit("#/login");
    cy.getBySel("login-input-username").should("be.visible");
    cy.getBySel("login-input-password").should("be.visible");
    cy.getBySel("login-submit").should("be.visible");
  });
});