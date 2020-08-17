// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import '@testing-library/cypress/add-commands';

Cypress.Commands.add("login", () => {
    const username = 'admin';
    const password = 'password';
    const requestOptions = {
        url: 'http://localhost:8080/api/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain'

        },
        body: JSON.stringify({ 'userName': username, 'password': password }),
    };
    cy.request(requestOptions).then((response) => {
        const token = response.body.accessToken;
        const expiration = Date.now() + (1000 * response.body.expiresIn);
        localStorage.setItem('user', token);
        localStorage.setItem('username', username);
        localStorage.setItem('expires', expiration.toString());
    });
});