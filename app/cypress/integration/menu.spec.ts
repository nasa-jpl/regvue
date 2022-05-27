/// <reference types="cypress" />

import format from "../../src/format";
import data from "../../public/data1.json";

describe("menu-componenet", () => {
  beforeEach(() => {
    cy.visit("localhost:3000");
  });

  it("shows the unselected root nodes", () => {
    cy.get("[id^=menu-node-]").should("have.length", data.root.children.length);
    data.root.children.forEach((child) => {
      const id = "#menu-node-" + child.replace(".", "-");

      // Shows the name of the menu node
      cy.get(id).children().should("have.length", 2);
      cy.get(id).children().first().should("have.text", child);

      // Shows the address of the menu node in hex
      cy.get(id).should("not.have.class", "bg-blue-200");
      cy.get(id)
        .children()
        .last()
        .should("have.text", format.hex(data.elements[child].addr));
    });
  });

  it("highlights only one menu item", () => {
    const id0 = "#menu-node-" + data.root.children[0].replace(".", "-");
    cy.get(id0).click().should("have.class", "bg-blue-200");

    data.root.children.slice(1).forEach((child) => {
      const id = "#menu-node-" + child.replace(".", "-");
      cy.get(id).should("not.have.class", "bg-blue-200");
    });

    const id1 = "#menu-node-" + data.root.children[1].replace(".", "-");
    cy.get(id1).click().should("have.class", "bg-blue-200");
    cy.get(id0).should("not.have.class", "bg-blue-200");
  });

  it("toggles children visiblity on click", () => {
    const parent = data.root.children[0];
    cy.get("[id^=menu-node-]").should("have.length", data.root.children.length);

    cy.get(".material-design-icon__svg").first().click();
    cy.get("[id^=menu-node-]").should(
      "have.length",
      data.root.children.length + data.elements[parent].children.length
    );

    data.elements[parent].children.forEach((child: string) => {
      const id = "#menu-node-" + child.replace(".", "-");

      cy.get(id)
        .should("not.have.class", "bg-blue-200")
        .children()
        .first()
        .and("have.text", child.split(".").pop());

      cy.get(id)
        .children()
        .last()
        .should("have.text", format.hex(data.elements[child].addr));
    });

    cy.get(".material-design-icon__svg").first().click();
    cy.get("[id^=menu-node-]").should("have.length", data.root.children.length);
  });

  it("changes route on menu node click", () => {
    const name = data.root.children[0];
    const id = "#menu-node-" + name.replace(".", "-");

    cy.get(id).click();
    cy.url().should("include", `/reg/${name}`);

    cy.get(id).should("have.class", "bg-blue-200");
  });

  it("reopens children nodes on refresh", () => {
    const firstParent = data.root.children[0];
    const firstChild = data.elements[firstParent].children[0];
    const firstGrandChild = data.elements[firstChild].children[0];

    cy.visit(`localhost:3000/reg/${firstGrandChild}`);
    cy.get("[id^=menu-node-]").should(
      "have.length",
      data.root.children.length +
        data.elements[firstParent].children.length +
        data.elements[firstChild].children.length
    );
  });
});
