/// <reference types="cypress" />

import packageInfo from "../../package.json";

describe("app-version-component", () => {
  beforeEach(() => {
    cy.visit("localhost:3000");
  });

  it("shows app version component", () => {
    cy.get("#app-version")
      .should(
        "contain.text",
        `Powered by ${packageInfo.name} v${packageInfo.version}`
      )
      .and("have.class", "float-right");

    cy.get("#app-source-url")
      .should("have.class", "text-blue-500")
      .and("have.class", "underline")
      .and("have.attr", "href")
      .and("contain", packageInfo.homepage);
  });
});
