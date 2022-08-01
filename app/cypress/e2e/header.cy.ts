/// <reference types="cypress" />

import data from "../../public/example.json";

describe("header-component", () => {
  beforeEach(() => {
    cy.visit("/#/?data=example.json");
  });

  it("shows header component", () => {
    cy.get("#header-bar").children().should("have.length", 3);
    cy.get("#header-bar")
      .should("have.class", "flex")
      .and("have.class", "flex-row")
      .and("have.class", "justify-between");

    cy.get("#header-title").should(
      "have.text",
      `${data.root.desc} (${data.root.version})`
    );

    cy.get("#header-links")
      .children()
      .filter("a")
      .should("have.length", Object.keys(data.root.links).length);

    cy.get("#search-input").should("exist");
  });
});
