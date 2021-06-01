const Parse = require("parse/node");
const chai = require("chai");
const { getTableData, createSchemaData } = require("../src/core");
const { buildSchemas } = require("../src/server/buildSchema");

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
    it("shall not create table with duplicated name", async () => {
        const table = new Table();
        table.set("name", "Subject");
        await table.save(null, { sessionToken: token });

        const tableCopy = new Table();
        tableCopy.set("name", "Subject");
        await expect(tableCopy.save(null, { sessionToken: token })).to.be.rejectedWith("Key exists");
        
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
    it("shall not create field with duplicated name", async () => {
        const table = new Table();
        table.set("name", "Subject");
        await table.save(null, { sessionToken: token });

        const field = new Field();
        field.set("table", table);
        field.set("name", "subjectNo");
        await field.save(null, { sessionToken: token });

        const field2 = new Field();
        field2.set("table", table);
        field2.set("name", "subjectNo");
        await expect(field2.save(null, { sessionToken: token })).to.be.rejectedWith("Key exists");
    });
    it('shall not create field with unsupported type', async () => {
        //
    });
    it("shall get table data", async () => {
        const table = new Table();
        table.set("name", "Subject");
        await table.save(null, { sessionToken: token });

        const field = new Field();
        field.set("table", table);
        field.set("name", "subjectNo");
        await field.save(null, { sessionToken: token });

        const field2 = new Field();
        field2.set("table", table);
        field2.set("name", "sample");
        await field2.save(null, { sessionToken: token });

        const sampleTable = new Table();
        sampleTable.set("name", "Sample");
        await sampleTable.save(null, { sessionToken: token });

        const field3 = new Field();
        field3.set("table", sampleTable);
        field3.set("name", "sampleTime");
        await field3.save(null, { sessionToken: token });

        const data = await getTableData();
        expect(data.Subject.fields.length).to.equal(2);
        expect(data.Sample.fields.length).to.equal(1);
    });
    it("shall create schemas from table data", async () => {
        const table = new Table();
        table.set("name", "Subject");
        await table.save(null, { sessionToken: token });

        const field = new Field();
        field.set("table", table);
        field.set("name", "subjectNo");
        field.set("type", "String");
        await field.save(null, { sessionToken: token });

        const data = await getTableData();
        const schemaData = createSchemaData("Subject", data.Subject.fields);
        await buildSchemas([schemaData]);

        const subjectSchema = new Parse.Schema("Subject");
        const obj = await subjectSchema.get();
        expect(obj.className).to.equal("Subject");
    });
    it("shall create schemas from table data", async () => {
        const table = new Table();
        table.set("name", "Subject");
        await table.save(null, { sessionToken: token });

        const field = new Field();
        field.set("table", table);
        field.set("name", "subjectNo");
        field.set("type", "String");
        await field.save(null, { sessionToken: token });

        const res = await Parse.Cloud.run("buildSchema", undefined, {
            sessionToken: token
        });

        expect(res.error).to.be.false;
        expect(res.message).to.equal("succeeded");
        const subjectSchema = new Parse.Schema("Subject");
        const obj = await subjectSchema.get();
        expect(obj.className).to.equal("Subject");
    });
    it("shall not allow non-admin user to create schema", async () => {
        const user = new Parse.User();
        user.set("username", "user2");
        user.set("password", "user2");
        await user.signUp(null, { useMasterKey: true });

        const logined = await Parse.User.logIn("user2", "user2");
        const { sessionToken } = logined.toJSON();
        const userToken = sessionToken;

        const res = await Parse.Cloud.run("buildSchema", undefined, {
            sessionToken: userToken
        });

        expect(res.error).to.be.true;
        expect(res.message).to.equal("Not sufficient permission");
    });
});
