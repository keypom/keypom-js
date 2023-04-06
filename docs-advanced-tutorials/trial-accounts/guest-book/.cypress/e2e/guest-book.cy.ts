// Load string from environment variable
const SEED = Cypress.env('seed')

context("Main Page", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("should display the guest book", () => {
        cy.get("h1").contains("NEAR Guest Book");
    });

    it("should log in and sign message with MyNEARWallet", () => {
        // generate a random short string
        const messageString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        // Log in with NEAR Wallet by clicking on the "Log in" button
        cy.get("button").contains("Log in").click();
        // Select element from left modal list titled: "MyNearWallet" and click on it
        cy.get("div").contains("MyNearWallet").click();
        // Wait for new page to load
        cy.wait(5000);
        // Click on the "Import Existing Account" button
        cy.get("button").contains("Import Existing Account").click();
        // Click on the "Recover Account" button
        cy.get("button").contains("Recover Account").click();
        // Fill in SEED from the environment variable into the input field
        cy.get("input").type(SEED);
        // Click on the "Find My Account" button
        cy.get("button").contains("Find My Account").click();
        // Wait for new page to load
        cy.wait(10000);
        // Click on the "Next" button
        cy.get("button").contains("Next").click();
        // Click on the "Connect" button
        cy.get("button").contains("Connect").click();
        // Wait for new page to load
        cy.wait(10000);
        // Check if the "Log out" and "Sign" buttons are visible
        cy.get("button").contains("Log out").should("be.visible");
        // Check if there is an input field with the label "Message:" and id="message"
        cy.get("label").contains("Message:").should("be.visible");
        // Check if there is a button with the label "Sign"
        cy.get("button").contains("Sign").should("be.visible");
        // Check if there is a number input field for donations with a 0 minimum and 0.01 step 
        cy.get("input[type=number]").should("have.attr", "min", "0").and("have.attr", "step", "0.01");
        // Fill in the "Message:" labelled input field with id="donation" with the text from the messageString variable
        cy.get("input[id=message]").type(messageString);
        // Set the donation amount to 0.01
        cy.get("input[id=donation]").type("0.01");
        // Click on the "Sign" button
        cy.get("button").contains("Sign").click();
        // Wait for new page to load
        cy.wait(10000);
        // Click on the "Approve" button
        cy.get("button").contains("Approve").click();
        // Wait for new page to load
        cy.wait(10000);
        // Check if the messageString variable is visible in the "Messages" section
        cy.get("div").contains(messageString).should("be.visible");
    });
});