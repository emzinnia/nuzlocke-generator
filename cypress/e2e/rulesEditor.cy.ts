describe("Rules Editor", () => {
    beforeEach(() => {
        cy.visit("http://localhost:8080");
    });

    it("supports basic editing, preset application, and prevents empty suggestions", () => {
        cy.contains("Modify Rules").click();
        cy.contains("Rules Editor").should("be.visible");

        cy.get(".rules-list-item").its("length").as("initialCount");

        cy.contains("Add Rule").click();
        cy.get("@initialCount").then((initial: any) => {
            cy.get(".rules-list-item").should("have.length.greaterThan", initial);

            cy.get(".rules-list-item textarea").first().clear().type("No faint revives allowed");

            cy.get(".rules-list-item").last().find(".rule-delete").click();
            cy.get(".rules-list-item").should("have.length", initial);

            cy.get(".preset-select select").select("Hardcore Nuzlocke");
            cy.contains("Apply Ruleset").click();
            cy.get(".rules-list-item").should("have.length.greaterThan", initial);
        });

        cy.contains("Suggest as Community Ruleset").click();
        cy.contains("Submit Suggestion").parent("button").should("be.disabled");
        cy.contains("Cancel").click();
    });
});

