import { login } from "../../services/ApiAuth";
import { addReview } from "../../services/apiReviews";

describe("API - Reviews : validation + tentative XSS", () => {
  let authToken;

  beforeEach(() => {
    login("test2@test.fr", "testtest", 200).then(() => {
      authToken = Cypress.env("authToken");
      expect(authToken, "authToken doit être défini après login").to.exist;
    });
  });

  it("Ajout d'un avis valide -> 200", () => {
    addReview(authToken, "Avis OK", "Super produit, livraison rapide.", 5).then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  it("Tentative XSS -> doit être rejetée (attendu: 4xx)", () => {
    const xssPayload = `<script>alert("XSS")</script>`;

    addReview(authToken, "test XSS", xssPayload, 5).then((response) => {
      // on attend un rejet : 400 / 401 / 403 / 422
      expect([400, 401, 403, 422], `Status reçu: ${response.status}`).to.include(response.status);
    });
  });
});
