import { login } from "../../services/ApiAuth";
import { faker } from "@faker-js/faker";

describe("Tests d'authentification", () => {
    it("Doit réussir avec des identifiants valides", () => {
        login("test2@test.fr", "testtest", 200).then((response) => {
           
            expect(response.body.token).to.exist;
        });
    });

    it("Doit échouer avec des identifiants invalides", () => {
        let fakerUserName = faker.internet.email();
        let fakerPassword = faker.internet.password();
        
        login(fakerUserName, fakerPassword).then((response) => {
            expect(response.status).to.eq(401);
            expect(response.body).to.have.property("message"); 
           
            cy.log("Échec de connexion attendu");
            cy.log(`Utilisateur testé : ${fakerUserName}`);
            cy.log(`Mot de passe testé : ${fakerPassword}`);
            cy.log(`Message retourné : ${response.body.message}`);

            cy.writeFile("cypress/logs/auth_failure.json", {
                username: fakerUserName,
                password: fakerPassword,
                status: response.status,
                message: response.body.message,
                timestamp: new Date().toISOString()
            });
        });
    });
});





