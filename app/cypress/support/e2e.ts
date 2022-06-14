// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Ignore errors with the ResizeObserver
// (because of how Cypress handles opening the window the ResizeObserver
//  temporarily stops itself from working to prevent infinite loops from
//  resizing too much too quickly)
Cypress.on("uncaught:exception", (err) => {
  return !err.message.includes(
    "ResizeObserver loop completed with undelivered notifications."
  );
});
