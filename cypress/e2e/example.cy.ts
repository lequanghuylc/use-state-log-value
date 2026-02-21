describe('use-state-log-value imdb demo', () => {
  it('shows imdb list, opens details, and displays raw logged json', () => {
    cy.visit('/');
    cy.wait(1000);
    cy.get('[data-cy="page-list"]').should('contain.text', 'IMDb List');

    cy.get('[data-cy="filter-tv"]').click();
    cy.wait(1000);

    cy.get('[data-cy="card-tt0903747"]').should('be.visible').click();
    cy.wait(1000);

    cy.url().should('include', '/details/tt0903747');
    cy.get('[data-cy="page-detail"]').should('contain.text', 'IMDb Details');
    cy.wait(1000);

    cy.get('[data-cy="detail-title"]').should('contain.text', 'Breaking Bad');
    cy.wait(1000);

    cy.get('[data-cy="logs-json"]').should('contain.text', '"key": "imdb-filter"');
    cy.wait(1000);
    cy.get('[data-cy="logs-json"]').should('contain.text', '"value": "tv"');
    cy.wait(1000);
  });
});
