describe('smoke', () => {
  it('ouvre la home', () => {
    cy.visit('http://localhost:4200');
    cy.contains('Eco').should('exist');
  });
});
