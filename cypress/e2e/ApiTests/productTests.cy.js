import { login } from "../../services/ApiAuth";
import { getRandomProduct } from "../../services/ApiProducts";

describe("Test GET sur une fiche produit", () => {
  let authToken;
  let produitsAleatoires;

  beforeEach(() => {
    cy.wrap(null).then(() => {
      return login("test2@test.fr", "testtest", 200).then((response) => {
        
        authToken = response.body.token;
        expect(authToken).to.not.be.undefined;
      });
    }).then(() => {
      return getRandomProduct(authToken, 3).then((response) => {
        expect(response.status).to.eq(200);
        produitsAleatoires = response.body;
        expect(produitsAleatoires).to.be.an("array").and.have.length(3);
      });
    });
  });

  it("Doit vérifier les propriétés d'une fiche produit", () => {
    const produitTest = produitsAleatoires[0];
    expect(produitTest).to.not.be.undefined;
    
    expect(produitTest).to.have.property("id");
    expect(produitTest).to.have.property("name");
    expect(produitTest).to.have.property("availableStock");
    expect(produitTest).to.have.property("skin");
    expect(produitTest).to.have.property("ingredients");
    expect(produitTest).to.have.property("description");
    expect(produitTest).to.have.property("price");
    expect(produitTest).to.have.property("picture");
    expect(produitTest).to.have.property("varieties");
  });
});