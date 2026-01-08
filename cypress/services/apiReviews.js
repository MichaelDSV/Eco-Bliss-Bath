export function addReview(token, title, comment, rating) {
  return cy.request({
    method: "POST",
    url: `${Cypress.env("apiUrl")}/reviews`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    failOnStatusCode: false, // pour tester les erreurs (400, etc.)
    body: {
      title,
      comment,
      rating,
    },
  });
}
