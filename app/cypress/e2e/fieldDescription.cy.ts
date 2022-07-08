/// <reference types="cypress" />

describe("register-fields-table", () => {
  beforeEach(() => {
    cy.visit("/#/?data=example.json");
  });

  it("toggles field display order", () => {
    // Starts with displaying MSB field first
    cy.get("#bit-range-0").should("include.text", "31:");
    cy.get("[id^=bit-range-]").last().should("include.text", ":0");

    // Can toggle to show LSB field first
    cy.get("#toggle-field-display-order-button").click();
    cy.get("#bit-range-0").should("include.text", ":0");
    cy.get("[id^=bit-range-]").last().should("include.text", "31:");

    // Preserves decision on reload
    cy.reload();
    cy.get("#bit-range-0").should("include.text", ":0");
    cy.get("[id^=bit-range-]").last().should("include.text", "31:");
  });
});
