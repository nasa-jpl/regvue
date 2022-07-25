/// <reference types="cypress" />

describe("element-title-component", () => {
  beforeEach(() => {
    cy.visit("/#/root/blkA/sub_blkA/regA0?data=example.json");
  });

  it("shows the breadcrumb links as the id", () => {
    cy.get("#breadcrumb-links").should("include.text", "blkA.sub_blkA.regA0");
  });

  it("navigates on breadcrumb link", () => {
    cy.get("#breadcrumb-link-sub_blkA").click();
    cy.url().should("include", "/root/blkA/sub_blkA?data=example.json");

    cy.get("#breadcrumb-link-blkA").click();
    cy.url().should("include", "/root/blkA?data=example.json");
  });
});
