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


Cypress.Commands.add("saveLocalStorage", (storageAlias) => {
    let storage = {};
    for (let i = 0; i < localStorage.length; i++) {
        const name = localStorage.key(i);
        storage[name] = localStorage.getItem(name);
    }
    return cy.wrap(storage).as(storageAlias);
});

Cypress.Commands.add("restoreLocalStorage", (storageAlias) => {
    cy.clearLocalStorage();
    cy.get(storageAlias).then((storage) => {
        for (const name in storage) {
            localStorage.setItem(name, storage[name]);
        }
    });
});