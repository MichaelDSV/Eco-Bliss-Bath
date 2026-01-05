import { login } from "../../services/ApiAuth";
import { getProducts } from "../../services/ApiProducts";
import { getCart, addToCart, clearCart, submitOrder } from "../../services/ApiCart";

/**
 * Helper : vide le panier proprement (si items existants)
 */
const emptyCart = (token) => {
  return getCart(token).then((cartRes) => {
    const lines = cartRes.body?.orderLines || [];
    if (!lines.length) return;

    // On supprime chaque ligne
    lines.forEach((line) => {
      clearCart(token, line.id);
    });
  });
};

describe("Tests POST /orders (validation commande)", () => {
  let token;

  beforeEach(() => {
    // Login API -> récup token
    login("test2@test.fr", "testtest", 200).then((res) => {
      token = res.body.token;
      expect(token, "token JWT").to.exist;
    });
  });

  it("POST /orders - valide la commande avec un produit EN STOCK", () => {
    // 1) On part d'un panier vide
    emptyCart(token).then(() => {
      // 2) On récupère un produit en stock
      getProducts(token).then((productsRes) => {
        expect(productsRes.status).to.eq(200);

        const products = productsRes.body || [];
        const produitEnStock = products.find((p) => p.availableStock > 0);

        expect(produitEnStock, "Produit en stock trouvé").to.exist;

        // 3) Ajout au panier (API réelle : PUT /orders/add)
        addToCart(token, produitEnStock.id, 1).then((addRes) => {
          expect(addRes.status, "Ajout au panier").to.eq(200);

          // 4) Validation commande (POST /orders)
          submitOrder(token).then((orderRes) => {
            expect(orderRes.status, "Validation commande").to.eq(200);

            // Log utile (preuve)
            cy.writeFile("cypress/logs/order_post_success.json", {
              status: orderRes.status,
              responseBody: orderRes.body,
              productAdded: { id: produitEnStock.id, name: produitEnStock.name },
              timestamp: new Date().toISOString(),
            });
          });
        });
      });
    });
  });

  it("POST /orders - échoue quand on tente avec un produit EN RUPTURE", () => {
    // 1) On part d'un panier vide
    emptyCart(token).then(() => {
      // 2) On récupère un produit en rupture
      getProducts(token).then((productsRes) => {
        expect(productsRes.status).to.eq(200);

        const products = productsRes.body || [];
        const produitEnRupture = products.find((p) => p.availableStock <= 0);

        expect(produitEnRupture, "Produit en rupture trouvé").to.exist;

        // 3) Tentative d'ajout (PUT /orders/add) -> doit échouer (pas 200)
        addToCart(token, produitEnRupture.id, 1).then((addRes) => {
          expect(addRes.status, "Ajout produit rupture doit échouer").to.not.eq(200);

          // 4) Tentative de validation commande (POST /orders) -> doit échouer aussi
          submitOrder(token).then((orderRes) => {
            expect(orderRes.status, "Validation commande doit échouer").to.not.eq(200);

            // Log utile (preuve)
            cy.writeFile("cypress/logs/order_post_out_of_stock.json", {
              addToCartStatus: addRes.status,
              addToCartBody: addRes.body,
              postOrderStatus: orderRes.status,
              postOrderBody: orderRes.body,
              productAttempted: { id: produitEnRupture.id, name: produitEnRupture.name },
              timestamp: new Date().toISOString(),
            });
          });
        });
      });
    });
  });
});
