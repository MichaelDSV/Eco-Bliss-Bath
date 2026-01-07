import { login } from "../../services/ApiAuth";
import { getProducts } from "../../services/ApiProducts";
import {
  getCart,
  addToCart,
  clearCart,
  submitOrder,
} from "../../services/ApiCart";

// Payload Swagger
const ORDER_PAYLOAD = {
  firstname: "Test",
  lastname: "User",
  address: "1 rue de Test",
  zipCode: "75001",
  city: "Paris",
};

const emptyCart = (token) => {
  return getCart(token).then((cartRes) => {
    const lines = cartRes?.body?.orderLines || [];
    if (!lines.length) return;

    return cy.wrap(lines, { log: false }).each((line) => {
      clearCart(token, line.id);
    });
  });
};

describe("Tests POST /orders (validation commande)", () => {
  let token;

  beforeEach(() => {
    login("test2@test.fr", "testtest", 200).then((res) => {
      token = res.body.token;
      expect(token, "token JWT").to.exist;
    });
  });

  it("POST /orders - valide la commande avec un produit EN STOCK", () => {
    emptyCart(token).then(() => {
      getProducts(token).then((productsRes) => {
        expect(productsRes.status).to.eq(200);

        const products = productsRes.body || [];
        const produitEnStock = products.find(
          (p) => (p.availableStock ?? 0) > 0
        );

        expect(produitEnStock, "Produit en stock trouvé").to.exist;

        addToCart(token, produitEnStock.id, 1).then((addRes) => {
          expect(addRes.status, "Ajout au panier").to.eq(200);

          submitOrder(token, ORDER_PAYLOAD).then((orderRes) => {
            cy.writeFile("cypress/logs/order_post_debug.json", {
              status: orderRes.status,
              body: orderRes.body,
              productAdded: {
                id: produitEnStock.id,
                name: produitEnStock.name,
                stock: produitEnStock.availableStock,
              },
              timestamp: new Date().toISOString(),
            });

            expect(
              orderRes.status,
              `Validation commande (body: ${JSON.stringify(orderRes.body)})`
            ).to.eq(200);
          });
        });
      });
    });
  });

  it("POST /orders - échoue avec un produit EN RUPTURE (BUG attendu)", () => {
    emptyCart(token).then(() => {
      getProducts(token).then((productsRes) => {
        expect(productsRes.status).to.eq(200);

        const products = productsRes.body || [];
        const produitEnRupture = products.find(
          (p) => (p.availableStock ?? 0) <= 0
        );

        expect(produitEnRupture, "Produit en rupture trouvé").to.exist;

        addToCart(token, produitEnRupture.id, 1).then((addRes) => {
          cy.writeFile("cypress/logs/order_add_out_of_stock.json", {
            addToCartStatus: addRes.status,
            addToCartBody: addRes.body,
            productAttempted: {
              id: produitEnRupture.id,
              name: produitEnRupture.name,
              stock: produitEnRupture.availableStock,
            },
            timestamp: new Date().toISOString(),
          });

          submitOrder(token, ORDER_PAYLOAD).then((orderRes) => {
            cy.writeFile("cypress/logs/order_post_out_of_stock.json", {
              postOrderStatus: orderRes.status,
              postOrderBody: orderRes.body,
              productAttempted: {
                id: produitEnRupture.id,
                name: produitEnRupture.name,
                stock: produitEnRupture.availableStock,
              },
              timestamp: new Date().toISOString(),
            });

            expect(
              orderRes.status,
              "Validation commande doit échouer (rupture)"
            ).to.not.eq(200);
          });
        });
      });
    });
  });
});
