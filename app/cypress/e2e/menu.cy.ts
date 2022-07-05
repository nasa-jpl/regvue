/// <reference types="cypress" />

import format from "../../src/format";
import data from "../../public/example.json";

describe("menu-component", () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit("/#/?data=example.json");
  });

  it("shows the unselected root nodes", () => {
    const rootElements = data.root.children;
    const subBlks = data.elements[rootElements[0]].children;
    const regs = data.elements[subBlks[0]].children;

    cy.get("[id^=menu-node-]").should(
      "have.length",
      rootElements.length + subBlks.length + regs.length
    );
    data.root.children.forEach((child) => {
      const id = "#menu-node-" + child.split(".").join("-");

      // Shows the name of the menu node
      cy.get(id).children().should("have.length", 2);
      cy.get(id).children().first().should("have.text", child);

      // Shows the address of the menu node in hex
      cy.get(id).should("not.have.class", "bg-blue-200");
      cy.get(id)
        .children()
        .last()
        .should("have.text", format.hex(data.elements[child].offset));
    });
  });

  it("highlights only one menu item", () => {
    const id0 = "#menu-node-" + data.root.children[0].split(".").join("-");
    cy.get(id0).click().should("have.class", "bg-blue-200");

    data.root.children.slice(1).forEach((child) => {
      const id = "#menu-node-" + child.split(".").join("-");
      cy.get(id).should("not.have.class", "bg-blue-200");
    });

    const id1 = "#menu-node-" + data.root.children[1].split(".").join("-");
    cy.get(id1).click().should("have.class", "bg-blue-200");
    cy.get(id0).should("not.have.class", "bg-blue-200");
  });

  it("toggles children visiblity on click", () => {
    const rootElements = data.root.children;
    const subBlks = data.elements[rootElements[0]].children;
    const regs = data.elements[subBlks[0]].children;

    cy.get("[id^=menu-node-]").should(
      "have.length",
      rootElements.length + subBlks.length + regs.length
    );

    data.elements[subBlks[0]].children.forEach((child: string) => {
      const id = "#menu-node-" + child.split(".").join("-");

      cy.get(id).children().first().and("have.text", child.split(".").pop());

      cy.get(id)
        .children()
        .last()
        .should("have.text", format.hex(data.elements[child].offset));
    });

    cy.get(".close-menu-node-btn").first().click();
    cy.get("[id^=menu-node-]").should("have.length", rootElements.length);

    cy.get(".open-menu-node-btn").first().click();
    cy.get("[id^=menu-node-]").should(
      "have.length",
      rootElements.length + subBlks.length
    );
  });

  it("changes route on menu node click", () => {
    const name = data.root.children[0];
    const id = "#menu-node-" + name.split(".").join("-");

    cy.get(id).click();
    cy.url().should("include", `${name}`);

    cy.get(id).should("have.class", "bg-blue-200");
  });

  it("reopens children nodes on refresh", () => {
    const firstParent = data.root.children[0];
    const firstChild = data.elements[firstParent].children[0];
    const firstGrandChild = data.elements[firstChild].children[0];

    cy.visit(`localhost:3000/#/${firstGrandChild}`);
    cy.get("[id^=menu-node-]").should(
      "have.length",
      data.root.children.length +
        data.elements[firstParent].children.length +
        data.elements[firstChild].children.length
    );
  });

  it("can be closed and reopened", () => {
    cy.get("#navigation-menu").should("be.visible");
    cy.get("#toggle-menu-button").click();
    cy.get("#navigation-menu").should("not.be.visible");
  });
});
