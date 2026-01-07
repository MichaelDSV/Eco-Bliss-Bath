import { login } from "../../services/ApiAuth";
import { getProducts } from "../../services/ApiProducts";
import { getCart, addToCart, clearCart } from "../../services/ApiCart";

/**
 * Helper : vide le panier proprement si une commande existe
 * (si l'API renvoie 404 "pas de commande en cours", on ignore)
 */
const emptyCart = (token) => {
  return getCart(token).then((cartRes) => {
    // Selon ton API : 404 si pas de panier en cours
    if (cartRes.status === 404) return;

    const lines = cartRes.body?.orderLines || [];
    if (!lines.length) return;

    lines.forEach((line) => {
      clearCart(token, line.id);
    });
  });
};

describe("Tests API panier (/orders)", () => {
  let token;

  beforeEach(() => {
    login("test2@test.fr", "testtest", 200).then((res) => {
      token = res.body.token;
      expect(token, "token JWT").to.exist;
    });
  });

  it("GET /orders sans connexion -> retourne 401 ou 403", () => {
    // Pas de token
    getCart(null).then((res) => {
      expect([401, 403]).to.include(res.status);
    });
  });

  it("GET /orders connecté -> renvoie le panier (après ajout d'un produit)", () => {
    emptyCart(token).then(() => {
      getProducts(token).then((productsRes) => {
        expect(productsRes.status).to.eq(200);

        const products = productsRes.body || [];
        const produitEnStock = products.find((p) => (p.availableStock ?? 0) > 0);
        expect(produitEnStock, "Produit en stock trouvé").to.exist;

        // 1) On ajoute un produit => ça crée un panier
        addToCart(token, produitEnStock.id, 1).then((addRes) => {
          expect(addRes.status, "Ajout au panier").to.eq(200);

          // 2) Ensuite seulement, on GET le panier
          getCart(token).then((cartRes) => {
            // Ici, on attend un panier existant => 200
            expect(cartRes.status, "GET panier connecté").to.eq(200);

            const lines = cartRes.body?.orderLines || [];
            expect(lines.length, "Panier contient au moins 1 ligne").to.be.greaterThan(0);

            // Optionnel : vérifier que le produit ajouté est bien présent
            const found = lines.some((l) => l.product?.id === produitEnStock.id);
            expect(found, "Produit ajouté présent dans le panier").to.eq(true);
          });
        });
      });
    });
  });

  it("PUT /orders/add -> ajoute un produit en stock", () => {
    emptyCart(token).then(() => {
      getProducts(token).then((productsRes) => {
        expect(productsRes.status).to.eq(200);

        const products = productsRes.body || [];
        const produitEnStock = products.find((p) => (p.availableStock ?? 0) > 0);
        expect(produitEnStock, "Produit en stock trouvé").to.exist;

        addToCart(token, produitEnStock.id, 1).then((res) => {
          expect(res.status).to.eq(200);
        });
      });
    });
  });

  it("PUT /orders/add -> REFUSE un produit en rupture (BUG attendu si 200)", () => {
    emptyCart(token).then(() => {
      getProducts(token).then((productsRes) => {
        expect(productsRes.status).to.eq(200);

        const products = productsRes.body || [];
        const produitEnRupture = products.find((p) => (p.availableStock ?? 0) <= 0);
        expect(produitEnRupture, "Produit en rupture trouvé").to.exist;

        addToCart(token, produitEnRupture.id, 1).then((res) => {
          // Comportement attendu (métier) : ne pas accepter => donc PAS 200
          // Si ton API renvoie 200, le test échoue => preuve du BUG.
          expect(res.status, "Ajout produit rupture doit échouer").to.not.eq(200);
        });
      });
    });
  });
});
