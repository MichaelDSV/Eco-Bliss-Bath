import { login } from "../../services/ApiAuth";
import { getCart, addToCart } from "../../services/ApiCart";
import { getProducts } from "../../services/ApiProducts";


describe("Test GET sur le panier sans connection", () => {
  context("GET /orders", () => {
    it("La requête doit retourner un code erreur 401 si l'utilisateur n'est pas connecté", () => {
      getCart().then((response) => {
        expect(response.status).to.eq(401);

        cy.writeFile("cypress/logs/cart_no_auth.json", {
          status: response.status,
          body: response.body,
          timestamp: new Date().toISOString()
        });
      });
    });
  });
});

describe("Test sur le pannier si l'utilisateur est connecté", () => {
  let authToken;

  beforeEach(() => {
    login("test2@test.fr", "testtest", 200).then((response) => {

      authToken = Cypress.env("authToken");
    });
  });

  it("La requête doit renvoyer la liste des produits qui sont dans le panier", () => {
    getCart(authToken).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("orderLines").that.is.an("array");

      if (response.body.orderLines.length > 0) {
        response.body.orderLines.forEach((line) => {
          expect(line).to.have.property("id");
          expect(line).to.have.property("quantity");
          expect(line).to.have.property("product");

          expect(line.product).to.have.property("id");
          expect(line.product).to.have.property("name");
          expect(line.product).to.have.property("price");
        });
      } else {
        cy.log("Le panier est vide");
      }
    });
  });

});

describe("Test PUT sur le panier", () => {
  let authToken;
  let produitEnStock;
  let produitEnRupture;

  beforeEach(() => {
    cy.wrap(null).then(() => {
      return login("test2@test.fr", "testtest", 200);
    }).then((response) => {

      authToken = response.body.token;

      return getProducts(authToken);
    }).then((response) => {
      expect(response.status).to.eq(200);
      const produits = response.body;
      produitEnStock = produits.find((p) => p.availableStock > 0);
      produitEnRupture = produits.find((p) => p.availableStock <= 0);
    });
  });

  it("Ajoute un produit en stock au panier", () => {
    cy.wrap(null).then(() => {
      expect(produitEnStock).to.not.be.undefined;
      return addToCart(authToken, produitEnStock.id, 1);
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  it("N'ajoute pas un produit en rupture de stock", () => {
    cy.wrap(null).then(() => {
      expect(produitEnRupture).to.not.be.undefined;
      return addToCart(authToken, produitEnRupture.id, 1);
    }).then((response) => {
      expect(response.status).to.not.eq(200);

      cy.writeFile("cypress/logs/cart_out_of_stock.json", {
        status: response.status,
        product: produitEnRupture.id,
        responseBody: response.body,
        timestamp: new Date().toISOString()
      });
    });
  });
});