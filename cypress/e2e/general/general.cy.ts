const pages: string[] = ["collections.html", "prioqueues.html", "sorting.html"];

describe("Index.html", () => {
    it("Navigates to correct page when clicking link", () => {
        cy.visit("/");
        cy.get("a").contains("Collections").click();
        cy.url().should("include", "collections.html");

        cy.visit("/");
        cy.get("a").contains("Priority queues").click();
        cy.url().should("include", "prioqueues.html");

        cy.visit("/");
        cy.get("a").contains("Sorting").click();
        cy.url().should("include", "sorting.html");
    });
});

describe("General controls and information", () => {
    it("Node size and animation speed does not have empty values", () => {
        cy.checkForAllPages(() => {
            cy.checkForAllAlgorithms(() => {
                cy.get(".objectSize").should("not.have.value", "");
                cy.get(".animationSpeed").should("not.have.value", "");
            });
        });
    });

    it("Selecting different node sizes should work", () => {
        cy.checkForAllPages(() => {
            cy.checkForAllAlgorithms(() => {
                const nodeSizes = ["Tiny", "Small", "Medium", "Large", "Huge"]
                for (let size of nodeSizes) {
                    cy.get(".objectSize").select(size)
                    cy.get(".objectSize").find(":selected").should("contain.text", size)
                }
                    
            })
        })
    });
});
