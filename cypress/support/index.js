// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

before(() => {
    cy.server();
    ['GET', 'POST', 'PUT'].forEach(method => {
        cy.route({
            method,
            url: /project-grand-canyon\.appspot\.com/,
            status: 450, // "blocked by windows parental controls", heh.
            response: "You should not run the cypress tests against the production API!  Doing so could overwrite live data!",
        });
    });
});
