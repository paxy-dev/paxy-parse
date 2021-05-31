const Parse = require("parse/node");
const chai = require("chai");

const expect = chai.expect;
chai.use(require("chai-as-promised"));

const Table = Parse.Object.extend("Table");
const Field = Parse.Object.extend("Field");
const User = Parse.Object.extend("User");

describe("Test Subject", () => {
    let token;
    before(async () => {
        const user = new Parse.User();
        user.set("username", "admin");
        user.set("password", "admin");
        await user.signUp(null, { useMasterKey: true });

        var admin = new Parse.ACL();
        admin.setPublicReadAccess(false);
        admin.setPublicWriteAccess(false);
        admin.setRoleReadAccess("Admin", true);
        admin.setRoleWriteAccess("Admin", true);
        const role = new Parse.Role("Admin", admin);
        role.getUsers().add(user);
        await role.save(null, { useMasterKey: true });

        const userLogined = await Parse.User.logIn("admin", "admin");
        const { sessionToken } = userLogined.toJSON();
        token = sessionToken;
    });
    afterEach(async () => {
        const tableSchema = new Parse.Schema("Table");
        await tableSchema.purge({ useMasterKey: true });
        const fieldSchema = new Parse.Schema("Field");
        await fieldSchema.purge({ useMasterKey: true });
    });
    after(async () => {
        const query = new Parse.Query(Parse.User);
        const users = await query.find({ useMasterKey: true });
        for (let i of users) {
            await i.destroy({ useMasterKey: true });
        }

        const roleQuery = new Parse.Query(Parse.Role);
        const roles = await roleQuery.find({ useMasterKey: true });
        for (let i of roles) {
            await i.destroy({ useMasterKey: true });
        }
    });
    it("shall create table", async () => {
        const table = new Table();
        table.set("name", "Subject");
        await table.save(null, { sessionToken: token });
        expect(table.id).to.not.be.null;
    });
    it("shall create field", async () => {
        const table = new Table();
        table.set("name", "Subject");
        await table.save(null, { sessionToken: token });

        const field = new Field();
        field.set("table", table);
        field.set("name", "subjectNo");
        field.set("type", "string");
        field.set("required", true);
        field.set("disabled", false);
        // width: { type: "String" },
        // valueEnum: { type: "Array" },
        // label: { type: "String" },
        // render: { type: "String" },
        // sorter: { type: "String" },
        // pointTo: { type: "String" }
        await field.save(null, { sessionToken: token });
        expect(field.id).to.not.be.null;
    });
});
