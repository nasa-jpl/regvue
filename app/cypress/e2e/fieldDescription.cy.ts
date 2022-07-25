/// <reference types="cypress" />

describe("register-fields-table", () => {
  beforeEach(() => {
    cy.visit("/#/root/blkA/sub_blkA/regA0?data=example.json");
  });

  it("toggles field display order", () => {
    // Starts with displaying MSB field first
    cy.get("#bit-range-0").should("have.text", "31:8");
    cy.get("[id^=bit-range-]").last().should("have.text", "0");

    // Can toggle to show LSB field first
    cy.get("#toggle-field-display-order-button").click();
    cy.get("#bit-range-0").should("have.text", "0");
    cy.get("[id^=bit-range-]").last().should("have.text", "31:8");

    // Preserves decision on reload
    cy.reload();
    cy.get("#bit-range-0").should("have.text", "0");
    cy.get("[id^=bit-range-]").last().should("have.text", "31:8");
  });
});
