import { selectors } from "../../support/selectors";
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
        cy.log("Aucun élément à supprimer");
      }
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
      cy.get(selectors.productName, { timeout: 60000 }).should("be.visible");
      cy.get(selectors.productStock, { timeout: 60000 }).should("be.visible");
      cy.safeScreenshot("cartUiTests/1-FicheProduit-Avant-Ajout");

      cy.get(selectors.productName).should("contain", productName);
      cy.get(selectors.productStock).should("contain", productStock);

      cy.get(selectors.quantityInput).clear().type("1");
      cy.get(selectors.addToCartButton).click();

      cy.url().should("include", "/#/cart");
      cy.safeScreenshot("cartUiTests/2-Panier-Après-Ajout");

      cy.get(selectors.cartLineName).should("contain", productName);

      cy.visit(`/#/products/${productId}`);
      cy.safeScreenshot("cartUiTests/3-FicheProduit-Après-Ajout");

      cy.get(selectors.productStock).should("contain", productStock - 1);
    });
  });

  it("Bloque l'ajout au panier avec une quantité négative", () => {
    getRandomProduct(token).then((response) => {
      const product = response.body[0];
      const productId = product.id;

      cy.visit(`/#/products/${productId}`);

      cy.get(selectors.quantityInput).clear().type("-1");
      cy.get(selectors.addToCartButton).click();

      // le produit ne doit pas être dans le panier
      getCart(token).then((cartResponse) => {
        const orderLines = cartResponse.body.orderLines || [];
        const addedLine = orderLines.find(
          (line) => line.product?.id === productId
        );

        expect(
          addedLine,
          "Le produit ne doit pas être ajouté au panier avec une quantité négative"
        ).to.not.exist;
      });
    });
  });

  it("BUG - Ajout au panier autorisé avec une quantité égale à 0", () => {
  getRandomProduct(token).then((response) => {
    const product = response.body[0];
    const productId = product.id;
    const productName = product.name;

    cy.visit(`/#/products/${productId}`);

    // Saisie d'une quantité invalide (0)
    cy.get(selectors.quantityInput).clear().type("0");
    cy.get(selectors.addToCartButton).click();

    // BUG : le produit est quand même ajouté au panier
    cy.url().should("include", "/cart");
    cy.get(selectors.cartLineName).should("contain", productName);

    cy.log("BUG CONFIRMÉ : produit ajouté avec une quantité égale à 0");
  });
});


  it("BUG - Ajout au panier autorisé avec une quantité > 20", () => {
    getRandomProduct(token).then((response) => {
      const product = response.body[0];
      const productId = product.id;
      const productName = product.name;

      cy.visit(`/#/products/${productId}`);

      // Saisie d'une quantité invalide
      cy.get(selectors.quantityInput).clear().type("21");
      cy.get(selectors.addToCartButton).click();

      // BUG : le produit est quand même ajouté
      cy.url().should("include", "/cart");
      cy.get(selectors.cartLineName).should("contain", productName);

      cy.log("BUG CONFIRMÉ : produit ajouté avec quantité > 20");
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

      cy.safeScreenshot("cartUiTests/8-FicheProduit-Avant-Ajout-API");

      cy.get(selectors.quantityInput).clear().type("1");
      cy.get(selectors.addToCartButton).click();

      cy.url().should("include", "/#/cart");
      cy.get(selectors.cartLineName).should("contain", productName);

      cy.safeScreenshot("cartUiTests/9-Panier-Après-Ajout-API");

      cy.visit(`/#/products/${productId}`);
      cy.safeScreenshot("cartUiTests/10-FicheProduit-Après-Ajout-API");

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
