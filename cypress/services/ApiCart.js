const apiOrders = `${Cypress.env("apiUrl")}/orders`;

export const getCart = (token = null) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  return cy.request({
    method: "GET",
    url: apiOrders,
    headers,
    failOnStatusCode: false,
  });
};

export const addToCart = (token, productId, quantity = 1) => {
  return cy.request({
    method: "PUT",
    url: `${apiOrders}/add`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      product: productId,
      quantity,
    },
    failOnStatusCode: false,
  });
};

export const submitOrder = (token, body = {}) => {
  return cy.request({
    method: "POST",
    url: apiOrders,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body,
    failOnStatusCode: false,
  });
};

export const clearCart = (token, orderLineId) => {
  return cy
    .request({
      method: "DELETE",
      url: `${apiOrders}/${orderLineId}/delete`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      expect(response.status).to.eq(200);
      return response.body;
    });
};
