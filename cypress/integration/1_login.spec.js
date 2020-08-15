describe('1 Login', () => {
    it('can log in successfully', () => {
        cy.visit('/login');
        cy.get('#userName').type('admin');
        cy.get('#password').type('password');
        cy.contains('Log in').click();
        cy.url().should('include', '/dashboard');
    });
});
