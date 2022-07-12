/// <reference types="cypress" />

describe("register-layout", () => {
  beforeEach(() => {
    cy.visit("/#/?data=example.json");
  });

  it("updates register value based on field values", () => {
    // Register should start off as 0x0
    cy.get("#input-box-register").should("have.value", "0x00000000");

    // Type 1 into the lsb
    cy.get("#input-box-flag0").type("1");
    cy.get("#input-box-register").should("have.value", "0x00000001");

    // Input a hex value into the msb field
    cy.get("#input-box-rsvd").type("0xABCDEF");
    cy.get("#input-box-register").should("have.value", "0xABCDEF01");

    // Type 1 into the second bit
    cy.get("#input-box-flag1").type("1");
    cy.get("#input-box-register").should("have.value", "0xABCDEF03");
  });

  it("updates field values based on register value", () => {
    const value = "0xABCDEF12";

    // Check that the field values are decoded correctly
    const assertValues = () => {
      cy.get("#input-box-rsvd").should("have.value", "0xABCDEF");
      cy.get("#input-box-long_command").should("have.value", "0x1");
      cy.get("#input-box-flag3").should("have.value", "0");
      cy.get("#input-box-flag2").should("have.value", "0");
      cy.get("#input-box-flag1").should("have.value", "1");
      cy.get("#input-box-flag0").should("have.value", "0");
    };

    // Type a value into the register box and check that the fields update right
    // Hex
    cy.get("#input-box-register").type(value).type("{enter}");
    assertValues();

    // Binary
    cy.get("#input-box-register")
      .type("0b" + parseInt(value, 16).toString(2))
      .type("{enter}");
    assertValues();

    // Decimal
    cy.get("#input-box-register")
      .type(parseInt(value).toString())
      .type("{enter}");
    assertValues();
  });

  it("reset values", () => {
    // Register should start off with 0x0
    cy.get("#input-box-register").should("have.value", "0x00000000");

    // Type values and check that the register and field update
    cy.get("#input-box-register").type("0xABCDEF12");
    cy.get("#input-box-register").should("have.value", "0xABCDEF12");
    cy.get("#input-box-rsvd").should("have.value", "0xABCDEF");

    // Click the reset button and check that the register and field go back to 0
    cy.get("#reset-values-button").click();
    cy.get("#input-box-register").should("have.value", "0x00000000");
    cy.get("#input-box-rsvd").should("have.value", "0x000000");
  });

  it("changes display types", () => {
    const hexValue = "0xABCDEF12";
    const binaryValue = "0b10101011110011011110111100010010";
    const decimalValue = "2882400018";

    // Type the hexadecimal value
    cy.get("#input-box-register").type(hexValue);

    // Change to binary and check that the values change correctly
    cy.get("#select-display-type-binary").click();
    cy.get("#input-box-register").should("have.value", binaryValue);
    cy.get("#input-box-rsvd").should(
      "have.value",
      "0b" + parseInt("0xABCDEF", 16).toString(2)
    );

    // Change to decimal and check that the values change correctly
    cy.get("#select-display-type-decimal").click();
    cy.get("#input-box-register").should("have.value", decimalValue);
    cy.get("#input-box-rsvd").should(
      "have.value",
      parseInt("0xABCDEF", 16).toString()
    );

    // Change back to hex and make sure original value is shown again
    cy.get("#select-display-type-hexadecimal").click();
    cy.get("#input-box-register").should("have.value", hexValue);
  });

  it("can byte swap", () => {
    // Type values into the fields
    cy.get("#input-box-rsvd").type("0xABCDEF");
    cy.get("#input-box-long_command").type("0x9");

    // Only the register should change when click the byte swap button
    cy.get("#input-box-register").should("have.value", "0xABCDEF90");
    cy.get("#toggle-byte-swap-button").click();
    cy.get("#input-box-register").should("have.value", "0x90EFCDAB");
    cy.get("#input-box-rsvd").type("0xABCDEF");
    cy.get("#input-box-long_command").should("have.value", "0x9");

    // Typing the in register with byte swap enabled should update fields differently
    cy.get("#input-box-register").type("0xABCDEF90");
    cy.get("#input-box-rsvd").should("have.value", "0x90EFCD");
    cy.get("#input-box-long_command").should("have.value", "STOP (0xA)");
    cy.get("#input-box-flag3").should("have.value", "1");
    cy.get("#input-box-flag2").should("have.value", "0");
    cy.get("#input-box-flag1").should("have.value", "1");
    cy.get("#input-box-flag0").should("have.value", "1");

    // Clicking byte swap button again should update register
    cy.get("#toggle-byte-swap-button").click();
    cy.get("#input-box-register").should("have.value", "0x90EFCDAB");
  });

  it("supports unknown values", () => {
    // Typing an unknown value in the register will update the fields
    cy.get("#input-box-register").type("0xABCDEF1?");
    cy.get("#input-box-rsvd").should("have.value", "0xABCDEF");
    cy.get("#input-box-long_command").should("have.value", "0x1");
    cy.get("[id^=input-box-flag]").should("have.value", "?");

    // Typing an unknown value in the fields will update the register
    cy.get("#input-box-rsvd").type("0b1111_0000_1111_0000_1111_111?{enter}");
    cy.get("#input-box-rsvd").should("have.value", "0xF0F0F?");
    cy.get("#input-box-register").should("have.value", "0xF0F0F?1?");

    // Changing the display type doesn't result in loss of information
    // Binary
    cy.get("#select-display-type-binary").click();
    cy.get("#input-box-register").should(
      "have.value",
      "0b11110000111100001111111?0001????"
    );

    // Decimal
    cy.get("#select-display-type-decimal").click();
    cy.get("#input-box-rsvd").should("have.value", "?");
    cy.get("#input-box-register").should("have.value", "?");

    // Hex
    cy.get("#select-display-type-hexadecimal").click();
    cy.get("#input-box-rsvd").should("have.value", "0xF0F0F?");
    cy.get("#input-box-register").should("have.value", "0xF0F0F?1?");
  });

  it("swaps between reset states", () => {
    // Navigate to regA2 which has mutliple resets
    cy.get("#search-input").type("regA2");
    cy.get("#suggestion-0").click();
    cy.get("#element-name").should("have.text", "regA2");

    // Ensure that the reset states button starts off with the defaults
    cy.get("#reset-values-button").should("include.text", "RS1 Reset");
    cy.get("#reset-states-dropdown-button").click();
    cy.get("#reset-states-div").should("be.visible");

    // Choose the next reset state
    cy.get("#select-reset-state-0").click();
    cy.get("#reset-values-button").should("include.text", "RS2 Reset").click();
    cy.get("#reset-states-div").should("not.exist");

    // Ensure that the register value resets to RS2
    cy.get("#input-box-register").should("have.value", "0x??????00");

    // Ensure it can swap back
    cy.get("#reset-states-dropdown-button").click();
    cy.get("#select-reset-state-0").click();
    cy.get("#input-box-register").should("have.value", "0x??020100");
  });

  it("shows enumerated field values", () => {
    cy.get("#input-box-long_command")
      .type("0x5{enter}")
      .should("have.value", "0x5 (START)");
    cy.get("#select-display-type-binary").click();
    cy.get("#input-box-long_command").should("have.value", "0b0101 (START)");

    cy.get("#input-box-long_command")
      .type("0b1010{enter}")
      .should("have.value", "STOP (0b1010)");
    cy.get("#select-display-type-hexadecimal").click();
    cy.get("#input-box-long_command").should("have.value", "STOP (0xA)");
  });
});
