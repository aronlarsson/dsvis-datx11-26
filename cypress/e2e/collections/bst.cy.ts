describe("BST", () => {
    beforeEach(() => {
        cy.visit("collections.html?algorithm=BST");
    });

    it("Canvas doesn't contain any objects on load", () => {
        cy.get("svg").first().children().not("text").should("have.length", 0);
    });

    it("Inserting first character 'C' adds object with value C as root", () => {
        cy.get("input.insertField").type("C").press(Cypress.Keyboard.Keys.ENTER)
        cy.get("svg").first().find("g").should("have.length", 1).and("have.text", "C")
    });

    it("Animation doesn't run if toggled off", () => {
        cy.get(".toggleRunner").click()
        cy.get("input.insertField").type("C").press(Cypress.Keyboard.Keys.ENTER)
        cy.get("svg").first().find(".status-report").should("have.text", "Paused")
    })
    
    it("Changing animation speed from fastest to slowest increases completion time", () => {
        let fastestDiff: number;
        let slowestDiff: number;
        cy.get(".animationSpeed").select("Fastest").then((element) => {
            const startFastest = Date.now()
            cy.get("input.insertField").type("C").press(Cypress.Keyboard.Keys.ENTER)
            cy.get("svg", { timeout: 10000 }).first().find(".title").should("have.text", "Select an action from the menu above").then(() => {
                fastestDiff = Date.now() - startFastest
            })
        })
        cy.visit("collections.html?algorithm=BST")
        cy.get(".animationSpeed").select("Slow").then((element) => {
            const startSlowest = Date.now()
            cy.get("input.insertField").type("C").press(Cypress.Keyboard.Keys.ENTER)
            cy.get("svg", { timeout: 10000 }).first().find(".title").should("have.text", "Select an action from the menu above").then(() => {
                slowestDiff = Date.now() - startSlowest
            })
        }).then(() => {
            expect(fastestDiff).to.be.lessThan(slowestDiff)
        })
    })

    it("Inserting multiple characters adds all of them", () => {
        const charsToAdd = ["A", "B", "C", "D"]
        cy.get("input.insertField").type(charsToAdd.join(" ")).press(Cypress.Keyboard.Keys.ENTER)
        cy.get(".fastForward").click()
        cy.get("svg").first().find("g").should("have.length", charsToAdd.length).each((element) => {
            const nodeText = element.find("text").text()
            expect(charsToAdd).to.contain(nodeText)
            charsToAdd.splice(charsToAdd.indexOf(nodeText), 1)
        }).then(() => {
            expect(charsToAdd.length).to.equal(0)
        })
    })

    it.only("Added characters have correct relative x position", () => {
        const charsToAdd = ["B", "H", "D", "C", "A", "F", "G"];
        const charPositionMap: { [key: string]: number } = {};
        cy.get("input.insertField")
            .type(charsToAdd.join(" "))
            .press(Cypress.Keyboard.Keys.ENTER);
        cy.get(".fastForward")
            .click()
            .then(() => {
                for (let char of charsToAdd) {
                    cy.get("svg")
                        .first()
                        .contains(char, { matchCase: true })
                        .then((element) => {
                            charPositionMap[char] = element.position().left;
                        });
                }
            })
            .then(() => {
                for (let char1 of Object.keys(charPositionMap)) {
                    for (let char2 of Object.keys(charPositionMap)) {
                        if (char1 < char2) {
                            expect(charPositionMap[char1]).to.be.lessThan(
                                charPositionMap[char2]
                            );
                        }
                    }
                }
            });
    });
});
