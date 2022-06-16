/// <reference types="cypress" />

import data from "../../public/data.json";

describe("search-component", () => {
  const delay = 300;

  beforeEach(() => {
    cy.visit("/");
  });

  it("starts unfocused", () => {
    cy.get("#search-input")
      .should("have.value", "")
      .invoke("attr", "placeholder")
      .should("equal", "Search");

    cy.get("#search-suggestions-div").should("not.exist");
    cy.get("#search-recents-div").should("not.exist");
  });

  it("opens recents div on focus", () => {
    cy.get("#search-input").click();
    cy.get("#no-recent-searches-div").should("be.visible");
    cy.get("#search-results-div").should("not.exist");
    cy.get("#no-search-results-div").should("not.exist");
    cy.get("#recent-searches-div").should("not.exist");

    cy.get("[id^=suggestion-]").should("have.length", 0);
    cy.get("section > div > p")
      .first()
      .should("have.text", "No recent searches");
  });

  it("blurs search", () => {
    // Blurs on background click from recents
    cy.get("#search-input").click();
    cy.get("#search-background-div").should("be.visible");
    cy.get("#no-recent-searches-div").should("be.visible");
    cy.get("#search-background-div").click().should("not.exist");

    // Blurs on esc from recents
    cy.get("#search-input").click();
    cy.get("#search-background-div").should("be.visible");
    cy.get("#no-recent-searches-div").should("be.visible");
    cy.get("#search-input").type("{esc}");
    cy.get("#search-background-div").should("not.exist");

    // Blurs on background click from suggestions
    cy.get("#search-input").click().type("r");
    cy.get("#search-background-div").should("be.visible");
    cy.get("#search-results-div").should("be.visible");
    cy.get("#search-background-div").click().should("not.exist");
    cy.get("#search-results-div").should("not.exist");

    // Blurs on esc from suggestions
    cy.get("#search-input").click().type("r");
    cy.get("#search-background-div").should("be.visible");
    cy.get("#search-results-div").should("be.visible");
    cy.get("#search-input").type("{esc}");
    cy.get("#search-background-div").should("not.exist");
    cy.get("#search-results-div").should("not.exist");
  });

  it("shows suggestions on typing", () => {
    const term = "blkA.sub_blkA.regA0";
    cy.get("#search-input").click().type(term).should("have.value", term);

    cy.get("[id^=suggestion-]").children().should("have.length.greaterThan", 0);

    // The first search result should be outlined in blue
    cy.get("[id^=suggestion-]")
      .first()
      .should("have.class", "outline-blue-500");

    cy.get("#suggestion-0").click();
    cy.url().should("contain", term.split(".").join("/"));
  });

  it("Allows keyboard input", () => {
    cy.get("#search-input").click().type("regA0").wait(delay).type("{enter}");
    cy.url().should("contain", "regA0");

    // Allows down arrow
    cy.get("#search-input").click().type("r").wait(delay).type("{downArrow}");
    cy.get("#suggestion-1").should("have.class", "outline-blue-500");
    cy.get("#search-input").type("{enter}");
    cy.url().should("contain", "regA1");

    // Allows up arrow key
    cy.get("#search-input")
      .click()
      .type("r")
      .wait(delay)
      .type("{downArrow}{upArrow}");
    cy.get("#suggestion-0").should("have.class", "outline-blue-500");
    cy.get("#search-input").type("{enter}");
    cy.url().should("contain", "regA0");

    cy.get("#search-input").click();
    cy.get("#recent-searches-div").should("be.visible");
    cy.get("#search-input").type("{esc}");
    cy.get("#recent-searches-div").should("not.exist");
  });

  it("stores recent searches", () => {
    const MAX_RECENT_SEARCHES_LENGTH = 5;

    const firstBlk = data.root.children[0];
    const firstSubBlk = data.elements[firstBlk].children[0];
    const registers = data.elements[firstSubBlk].children;

    let i = 0;
    registers.forEach((register) => {
      const name = register.split(".").pop();
      cy.get("#search-input").click().type(name).wait(delay).type("{enter}");
      i += 1;
      i = Math.min(i, MAX_RECENT_SEARCHES_LENGTH);

      cy.get("#search-input").click();
      cy.get("#suggestion-0 > div > a > div").should(
        "have.text",
        register.split(".").at(-1)
      );
      cy.get("[id^=suggestion-]").should("have.length", i);
    });

    cy.get("#remove-recent-search-btn-0").click();
    cy.get("#suggestion-0 > div > a > div").should(
      "have.text",
      registers.at(-2).split(".").at(-1)
    );

    cy.get("[id^=suggestion-]").should(
      "have.length",
      MAX_RECENT_SEARCHES_LENGTH - 1
    );
  });

  it("open with keyboard shortcut", () => {
    // Wait until the search has rendered
    cy.get("#search-input-div");

    // Input the keyboard shortcut to open search
    cy.get("body").trigger("keydown", { ctrlKey: true, key: "k" });
    cy.get("#search-background-div").should("be.visible");
    cy.get("#no-recent-searches-div").should("be.visible");
    cy.get("#search-input-div")
      .should("be.visible")
      .and("have.class", "outline-blue-500");

    // Input the keyboard shortcut again to close search
    cy.get("body").trigger("keydown", { ctrlKey: true, key: "k" });
    cy.get("#search-background-div").should("not.exist");
    cy.get("#no-recent-searches-div").should("not.exist");
    cy.get("#search-input-div")
      .should("be.visible")
      .and("not.have.class", "outline-blue-500");
  });
});
