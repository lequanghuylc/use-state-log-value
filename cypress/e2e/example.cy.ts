describe('use-state-log-value example app', () => {
  it('increments and decrements value', () => {
    cy.visit('/');
    cy.get('[data-cy="value"]').should('contain.text', 'Current value: 0');
    cy.get('[data-cy="inc"]').click().click();
    cy.get('[data-cy="value"]').should('contain.text', 'Current value: 2');
    cy.get('[data-cy="dec"]').click();
    cy.get('[data-cy="value"]').should('contain.text', 'Current value: 1');
  });
});
