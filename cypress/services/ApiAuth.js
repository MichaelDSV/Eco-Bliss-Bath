const apiLogin = `${Cypress.env("apiUrl")}/login`;

export const login = (username, password, returnCode) => {
    return cy.request({
        method: "POST",
        url: apiLogin,
        failOnStatusCode: false,
        body: { 
            username: username,
            password: password 
        }
    }).then((response) => {
        if (response.status === returnCode) {
            const token = response.body.token;
            Cypress.env("authToken", token); 
        }
        return response;
    });
};