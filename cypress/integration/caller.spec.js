const uuid = () => Cypress._.random(0, 1e6);

describe("Caller", () => {
    it('Can edit the caller', () => {
        cy.login();
        const uniqueLastName = 'Caller1ChangedLastName' + uuid();
        cy.visit('/dashboard');
        cy.contains('Callers').then(el => cy.wrap(el.siblings('a')).click({force: true}));
        cy.contains('Callers for District').should('exist');
        cy.contains('Caller1FirstName').parent()
            .findByText('Details').click({force: true});
        cy.findByRole('tab', {name: 'Caller Details'}).click();
        cy.get('.ant-modal').contains('Edit').click();
        cy.findByLabelText('Last Name').clear().type(uniqueLastName);
        cy.findByRole('button', {name: 'Save'}).click();
        cy.findByRole('button', {name: 'Save'}).should('not.be.visible');

        cy.contains('Caller1FirstName').parent()
        .findByText(uniqueLastName).should('exist');
    });
});
