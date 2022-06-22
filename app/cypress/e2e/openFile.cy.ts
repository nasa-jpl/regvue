/// <reference types="cypress" />

describe("open-data-file", () => {
  it("shows OpenView at /open", () => {
    // Visit open page
    cy.visit("/");
    cy.get("h1").should("have.text", "Welcome to regvue");
    cy.get("#data-file-input").should("exist");
    cy.get("#data-file-drop-zone").should("be.visible");
    cy.get("#data-url-input").should("be.visible");

    // Type in the url input box
    cy.get("#data-url-input").type("example.json").type("{enter}");
    cy.url().should("include", "?data=example.json");
  });

  it("can open and close a modal window in RegView page", () => {
    cy.visit("/#/?data=example.json");

    // Clicking on background closes modal
    cy.get("#show-open-modal-button").click();
    cy.get("#open-modal-background-div").should("be.visible");
    cy.get("#open-modal-div").should("be.visible");
    cy.get("#open-modal-background-div").click("left");
    cy.get("#open-modal-background-div").should("not.exist");
    cy.get("#open-modal-div").should("not.exist");

    // Clicking esc closes modal
    cy.get("#show-open-modal-button").click();
    cy.get("#open-modal-div").should("be.visible");
    cy.get("body").type("{esc}");
    cy.get("#open-modal-div").should("not.exist");

    // Clicking on close button closes modal
    cy.get("#show-open-modal-button").click();
    cy.get("#open-modal-div").should("be.visible");
    cy.get("#close-open-modal-button").click();
    cy.get("#open-modal-div").should("not.exist");
  });
});
