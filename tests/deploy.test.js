const chai = require("chai");
const Parse = require("parse/node");
const fs = require("fs");
const util = require("util");
const path = require("path");
const prettier = require("prettier");
const exec = util.promisify(require("child_process").exec);
const { getTableData, PageCodeGenerator, MenuCodeGenerator, AppCodeGenerator } = require("../src/core");
const config = require("../src/config");
const dir = "./tmp";

const expect = chai.expect;

const Table = Parse.Object.extend("Table");
const Field = Parse.Object.extend("Field");

describe("Test deploy", () => {
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

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        if (!fs.existsSync(config.app.app_page_path)) {
            fs.mkdirSync(config.app.app_page_path)
        }

        if (!fs.existsSync(config.app.app_routes_path)) {
            fs.mkdirSync(config.app.app_routes_path)
        }
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

        fs.rmdirSync(dir, { recursive: true });
        fs.rmdirSync(config.app.app_page_path, { recursive: true });
        fs.rmdirSync(config.app.app_routes_path, { recursive: true });
    });
    it("shall create deploy folder", async () => {
        //await exec('git clone git@github.com:paxy-dev/paxy-antd.git ./tmp/paxy-antd');
    });
    it("shall create frontend pages", async () => {
        const table = new Table();
        table.set("name", "Subject");
        await table.save(null, { sessionToken: token });

        const field = new Field();
        field.set("table", table);
        field.set("name", "subjectNo");
        field.set("type", "String");
        await field.save(null, { sessionToken: token });

        const data = await getTableData();

        const generator = new PageCodeGenerator(
            "Subject",
            data["Subject"]["fields"],
            dir
        );
        generator.create();
        expect(fs.existsSync(path.join(dir, "Subject", "index.tsx"))).to.be
            .true;
    });
    it('shall create config routes page', async () => {
        const generator = new MenuCodeGenerator(["Subject", "Samples", "Box"], dir);
        generator.create();
        expect(fs.existsSync(path.join(dir, 'config', 'appRoutes.ts'))).to.be.true;
    })
    it('sahll create app code', async () => {
        const table = new Table();
        table.set("name", "Subject");
        await table.save(null, { sessionToken: token });

        const field = new Field();
        field.set("table", table);
        field.set("name", "subjectNo");
        field.set("type", "String");
        await field.save(null, { sessionToken: token });

        const data = await getTableData();

        const gen = new AppCodeGenerator(path.join(dir, 'dst'));
        gen.create(data);
        gen.deploy('docker');
        expect(fs.existsSync(config.app.app_routes_path)).to.be.true;
        expect(fs.existsSync(path.join(config.app.app_page_path, 'Subject'))).to.be.true;
    })
});
