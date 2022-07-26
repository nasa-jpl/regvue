/// <reference types="cypress" />

describe("embedded-html", () => {
  it("shows html in the root description", () => {
    cy.visit("/#/?data=example.json");
    cy.get("h6:contains('Embedded html - example')").should("exist");
  });

  it("shows html in block and BlockTableEntry descriptions", () => {
    cy.visit("/#/root/blkA?data=example.json");
    cy.get("h6:contains('Embedded html - blkA')").should("exist");

    // Check that HTML is rendered in BlockTableEntry rows
    cy.get("tr").first().click();
    cy.get("h6:contains('Embedded html - sub_blkA')").should("exist");
  });

  it("show html in register and field desciptions", () => {
    cy.visit("/#/root/blkA/sub_blkA/regA0?data=example.json");
    cy.get("h6:contains('Embedded html - regA0')").should("exist");

    // Check that HTML is rendered in field tables
    cy.get("h6:contains('Embedded html - rsvd')").should("exist");

    // Check that HTML is rendered in the enum tables
    cy.get("h6:contains('Embedded html - enum')").should("exist");
  });
});
