/// <reference types="cypress" />

import data from "../../public/data1.json";

describe("search-component", () => {
  beforeEach(() => {
    cy.visit("localhost:3000");
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
    cy.get("#search-recents-div").should("be.visible");
    cy.get("#search-suggestions-div").should("not.exist");

    cy.get("[id^=suggestion-]").should("have.length", 0);
    cy.get("section > div > p")
      .first()
      .should("have.text", "No recent searches");
  });

  it("blurs search", () => {
    // Blurs on background click from recents
    cy.get("#search-input").click();
    cy.get("#search-recents-div").should("be.visible");
    cy.get("#search-recents-div").click().should("not.exist");

    // Blurs on esc from recents
    cy.get("#search-input").click();
    cy.get("#search-recents-div").should("be.visible");
    cy.get("#search-input").type("{esc}");
    cy.get("#search-recents-div").should("not.exist");

    // Blurs on background click from suggestions
    cy.get("#search-input").click().type("a");
    cy.get("#search-suggestions-div").should("be.visible");
    cy.get("#search-suggestions-div").click().should("not.exist");

    // Blurs on esc from suggestions
    cy.get("#search-input").click().type("a");
    cy.get("#search-suggestions-div").should("be.visible");
    cy.get("#search-input").type("{esc}");
    cy.get("#search-recents-div").should("not.exist");
  });

  it("shows suggestions on typing", () => {
    cy.get("#search-input")
      .click()
      .type("fpgaid")
      .should("have.value", "fpgaid");

    cy.get("[id^=suggestion-]")
      .should("have.length", 1)
      .and("have.class", "bg-gray-200")
      .and("have.class", "text-green-700")
      .children()
      .should("have.length", 1)
      .should("have.attr", "href");

    cy.get("#suggestion-0").click();
    cy.url().should("contain", "/reg/eio.system.board.fpgaid");
  });

  it("Allows keyboard input", () => {
    cy.get("#search-input").click().type("fpgaid").type("{enter}");
    cy.url().should("contain", "/reg/").and("contain", "fpgaid");

    // Allows down arrow
    cy.get("#search-input").click().type("a").type("{downArrow}");
    cy.get("#suggestion-1")
      .should("have.class", "bg-gray-200")
      .and("have.class", "text-green-700");
    cy.get("#search-input").type("{enter}");
    cy.url().should("contain", "ipcia");

    // Allows up arrow key
    cy.get("#search-input").click().type("b{downArrow}{upArrow}");
    cy.get("#suggestion-0")
      .should("have.class", "bg-gray-200")
      .and("have.class", "text-green-700");
    cy.get("#search-input").type("{enter}");
    cy.url().should("contain", "bdid");

    // Allows left and right arrow keys
    cy.get("#search-input").click().type("a{rightArrow}");
    cy.get("#suggestion-0")
      .should("not.be.visible")
      .and("not.have.class", "bg-gray-200")
      .and("not.have.class", "text-green-700");

    cy.get("[id^=suggestion-]")
      .last()
      .should("be.visible")
      .and("have.class", "bg-gray-200")
      .and("have.class", "text-green-700");

    cy.get("#search-input").type("{leftArrow}");

    cy.get("[id^=suggestion-]")
      .last()
      .should("not.be.visible")
      .and("not.have.class", "bg-gray-200")
      .and("not.have.class", "text-green-700");

    cy.get("#suggestion-0")
      .should("be.visible")
      .and("have.class", "bg-gray-200")
      .and("have.class", "text-green-700");
  });

  it("stores recent searches", () => {
    const MAX_RECENT_SEARCHES_LENGTH = 5;
    const registers = data.elements["eio.system.board"].children;

    let i = 0;
    registers.forEach((register) => {
      const name = register.split(".").pop();
      cy.get("#search-input").click().type(name).type("{enter}");
      i += 1;
      i = Math.min(i, MAX_RECENT_SEARCHES_LENGTH);

      cy.get("#search-input").click();
      cy.get("#suggestion-0 > div > a > div").should("have.text", register);
      cy.get("[id^=suggestion-]").should("have.length", i);
    });

    cy.get("#suggestion-0 > div > button").click();
    cy.get("#suggestion-0").should("not.have.text", registers.pop());
    cy.get("[id^=suggestion-]").should(
      "have.length",
      MAX_RECENT_SEARCHES_LENGTH - 1
    );
  });
});
