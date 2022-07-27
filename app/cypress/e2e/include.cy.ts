/// <reference types="cypress" />

describe("include-elements", () => {
  it("loads the hierarchy expected", () => {
    cy.visit("/#?data=include.json");
    cy.get("#element-name").should("have.text", "Include Example");

    cy.visit("/#/root/top_blk?data=include.json");
    cy.get("#element-name").should("have.text", "top_blk");

    cy.visit("/#/root/top_blk/include1?data=include.json");
    cy.get("#element-name").should("have.text", "Include 1");

    cy.visit("/#/root/top_blk/include2?data=include.json");
    cy.get("#element-name").should("have.text", "Include 2");

    cy.visit("/#/root/top_blk/include1/blkA?data=include.json");
    cy.get("#element-name").should("have.text", "blkA");

    cy.visit("/#/root/top_blk/include2/blkA?data=include.json");
    cy.get("#element-name").should("have.text", "blkA");
  });

  it("includes html in doc", () => {
    cy.visit("/#/root/top_blk/include1?data=include.json");
    cy.get("h6:contains('Embedded html - include')").should("exist");
  });
});
