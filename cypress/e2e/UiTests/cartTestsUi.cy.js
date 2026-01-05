import { selectors } from "../../support/selectors";
import credentials from "../../fixtures/credentials.json";


import { getRandomProduct } from "../../services/ApiProducts";
import { getCart, clearCart } from "../../services/ApiCart";

describe("Ajout au panier", () => {
  let token;

  beforeEach(() => {

    cy.visit("/");

    cy.intercept("POST", "/login").as("loginRequest");
    cy.goToLoginPage();
    cy.login();
    cy.wait("@loginRequest").then((interception) => {
      token = interception.response.body.token;
      cy.window().then((win) => {
        win.localStorage.setItem("user", token);
      });
    });
  });

  afterEach("Supprimer les éléments du panier", () => {
    if (!token) {
      cy.log("Aucun token disponible, suppression du panier impossible");
      return;
    }

    getCart(token).then((cart) => {
      const lines = cart.body.orderLines;

      if (lines?.length) {
        cy.log(`Suppression de ${lines.length} éléments du panier`);
        lines.forEach((orderLine) => {
          clearCart(token, orderLine.id);
        });
      } else {
        cy.log("Aucun élément à supprimer")
      };
    });

    cy.get(selectors.logoutButton).click();
  });

  it("Produit ajouté au panier, stock déduit", () => {
    getRandomProduct(token).then((response) => {
      const product = response.body[0];
      const productId = product.id;
      const productName = product.name;
      const productStock = product.availableStock;

      cy.visit(`/#/products/${productId}`);
      cy.screenshot("cartUiTests/1-FicheProduit-Avant-Ajout");

      cy.get(selectors.productName).should("contain", productName);
      cy.get(selectors.productStock).should("contain", productStock);

      cy.get(selectors.quantityInput).clear().type("1");
      cy.get(selectors.addToCartButton).click();

      cy.url().should("include", "/#/cart");
      cy.screenshot("cartUiTests/2-Panier-Après-Ajout");

      cy.get(selectors.cartLineName).should("contain", productName);

      cy.visit(`/#/products/${productId}`);
      cy.screenshot("cartUiTests/3-FicheProduit-Après-Ajout");

      cy.get(selectors.productStock).should("contain", productStock - 1);
    });
  });

  it("Empêche l'ajout au panier avec une quantité négative", () => {
    getRandomProduct(token).then((response) => {
      const product = response.body[0];
      const productId = product.id;
      const productName = product.name;
      const productStock = product.availableStock;

      cy.visit(`/#/products/${productId}`);
      cy.get(selectors.productName).should("contain", productName);
      cy.get(selectors.productStock).should("contain", productStock);

      cy.screenshot("cartUiTests/4-FicheProduit-Avant-Saisie-Négative");
      cy.get(selectors.quantityInput).clear().type("-1");
      cy.screenshot("cartUiTests/5-Saisie-Négative");
      cy.get(selectors.quantityInput).should("have.class", "ng-invalid");
      cy.get(selectors.quantityInput).should("have.value", "1");
    });
  });

  it("Empêche l'ajout au panier avec une quantité supérieur à 20", () => {
    getRandomProduct(token).then((response) => {
      const product = response.body[0];
      const productId = product.id;
      const productName = product.name;
      const productStock = product.availableStock;

      cy.visit(`/#/products/${productId}`);
      cy.get(selectors.productName).should("contain", productName);
      cy.get(selectors.productStock).should("contain", productStock);

      cy.screenshot("cartUiTests/6-FicheProduit-Avant-Saisie-21");
      cy.get(selectors.quantityInput).clear().type("21");
      cy.screenshot("cartUiTests/7-Saisie-Supérieure-À-20");

      cy.get(selectors.quantityInput).should("have.value", "20")
    });
  });

  it("Produit ajouté au panier, présent dans le panier via l'API", () => {
    getRandomProduct(token).then((response) => {
      const product = response.body[0];
      const productId = product.id;
      const productName = product.name;
      const productStock = product.availableStock;

      cy.visit(`/#/products/${productId}`);

      cy.get(selectors.productName).should("contain", productName);
      cy.get(selectors.productStock).should("contain", productStock);

      cy.screenshot("cartUiTests/8-FicheProduit-Avant-Ajout-API");

      cy.get(selectors.quantityInput).clear().type("1");
      cy.get(selectors.addToCartButton).click();

      cy.url().should("include", "/#/cart");
      cy.get(selectors.cartLineName).should("contain", productName);

      cy.screenshot("cartUiTests/9-Panier-Après-Ajout-API");

      cy.visit(`/#/products/${productId}`);
      cy.screenshot("cartUiTests/10-FicheProduit-Après-Ajout-API");

      getCart(token).then((cartResponse) => {
        const orderLines = cartResponse.body.orderLines;

        expect(orderLines).to.have.length.greaterThan(0);
        const addedProduct = orderLines.find(
          (line) => line.product.id === productId
        );

        expect(addedProduct).to.exist;
        expect(addedProduct.product.name).to.equal(productName);
        expect(addedProduct.quantity).to.equal(1);

        cy.log("Vérification API réussie pour le produit ajouté");
      });
    });
  });
});

