const Parse = require("parse/node");
const chai = require("chai");

const expect = chai.expect;

describe("Test Schema", () => {
    it("shall have default schema", async () => {
        const subjectSchema = new Parse.Schema("Table");
        const obj = await subjectSchema.get();
        // expect(obj.className).to.equal("Field");
        console.log(obj)
    });
});
