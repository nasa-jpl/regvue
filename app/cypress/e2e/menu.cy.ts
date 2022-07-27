/// <reference types="cypress" />

import { hex } from "../../src/format";
import data from "../../public/example.json";

describe("menu-component", () => {
  beforeEach(() => {
    // Make viewport large
    cy.viewport(1280, 800);
    cy.visit("/#/root/blkA/sub_blkA/regA0?data=example.json");
  });

  it("shows the expanded root nodes", () => {
    cy.get("[id^=menu-node-]").should(
      "have.length",
      data.root.expanded
        .map((id) => data.elements[id].children.length)
        .reduce((a, b) => a + b, data.root.children.length)
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
        .should("have.text", hex(data.elements[child].offset));
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

    cy.get("[id^=menu-node-]").should(
      "have.length",
      data.root.expanded
        .map((id) => data.elements[id].children.length)
        .reduce((a, b) => a + b, data.root.children.length)
    );

    data.elements[subBlks[0]].children.forEach((child: string) => {
      const id = "#menu-node-" + child.split(".").join("-");

      cy.get(id).children().first().and("have.text", child.split(".").pop());

      cy.get(id)
        .children()
        .last()
        .should("have.text", hex(data.elements[child].offset));
    });

    cy.get(".close-menu-node-btn").first().click();
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
    const lastParent = data.root.children[data.root.children.length - 1];
    const child = data.elements[lastParent].children[0];

    // Wait for beforeEach to run and menu to be displayed
    cy.get("[id^=menu-node-]");

    // Navigate to a new link and ensure a non-default expanded block is still expanded
    cy.visit(`/#/${child}?data=example.json`);
    cy.reload();
    cy.get("[id^=menu-node-]").should(
      "have.length",
      data.root.expanded
        .map((id) => data.elements[id].children.length)
        .reduce((a, b) => a + b, data.root.children.length) + 1
    );
  });

  it("can be closed and reopened", () => {
    // Make viewport small
    cy.viewport(1000, 800);

    cy.get("#navigation-menu").should("not.be.visible");
    cy.get("#toggle-menu-button").click();
    cy.get("#navigation-menu").should("be.visible");
    cy.get("#toggle-menu-button").click();
    cy.get("#navigation-menu").should("not.be.visible");
  });

  it("close on background click", () => {
    //  Make viewport small
    cy.viewport(1000, 800);

    cy.get("#navigation-menu").then((element) => {
      if (element.hasClass("hidden")) {
        cy.get("#toggle-menu-button").click();
      }
    });

    cy.get("#navigation-menu").should("not.have.class", "hidden");
    cy.get("#menu-background-div").should("not.have.class", "hidden");

    cy.get("#menu-background-div").click();
    cy.get("#navigation-menu").should("have.class", "hidden");
  });
});
