const jwt = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");
const config = require("../../config");
const { createSchemaData, getTableData } = require("../../core");
const { buildSchemas } = require("../buildSchema");

const Table = Parse.Object.extend("Table");
const Field = Parse.Object.extend("Field");

Parse.Cloud.beforeSave("Table", async request => {
    const query = new Parse.Query(Table);
    query.equalTo("name", request.object.get("name"));
    query.exists("objectId");
    const data = await query.find({ useMasterKey: true });
    if (data.length > 0) {
        if (data[0].id !== request.object.id) {
            throw Error("Key exists");
        }
    }
});

Parse.Cloud.beforeSave("Field", async request => {
    const query = new Parse.Query(Field);
    query.equalTo("name", request.object.get("name"));
    query.exists("objectId");
    const data = await query.find({ useMasterKey: true });
    if (data.length > 0) {
        if (data[0].id !== request.object.id) {
            throw Error("Key exists");
        }
    }
});

Parse.Cloud.define(
    "buildSchema",
    async request => {
        const roles = await new Parse.Query(Parse.Role)
            .equalTo("users", request.user)
            .find({ useMasterKey: true });
        let validUser = false;
        for (let r of roles) {
            if (r.get("name") === "Admin") {
                validUser = true;
                break;
            }
        }

        const res = {};
        if (validUser) {
            const data = await getTableData();
            const schemaDatas = [];
            Object.keys(data).forEach(key => {
                const d = createSchemaData(key, data[key].fields);
                schemaDatas.push(d);
            });

            await buildSchemas(schemaDatas);
            res.error = false;
            res.message = "succeeded";
        } else {
            res.error = true;
            res.message = "Not sufficient permission";
        }
        return res;
    },
    {
        requireUser: true
    }
);

const loginApiAdminUser = () => {
    return Parse.User.logIn(
        config.auth.api_admin_user,
        config.auth.api_admin_password
    );
    // const roles = await new Parse.Query(Parse.Role)
    //     .equalTo("users", userLogined)
    //     .find();
    // for (let role of roles) {
    //     if (role.get("name") === "Admin") {
    //         success = true;
    //         break;
    //     }
    // }
    // if (!success) {
    //     Parse.User.logOut();
    //     return null;
    // }
};

Parse.Cloud.define("verifyToken", async request => {
    const userPoolNum = request.params.userPoolNum;
    const idToken = request.params.idToken;
    let res = {};

    try {
        const pem = jwkToPem(config.auth.jwks[userPoolNum]);
        const r = await jwt.verify(idToken, pem, {
            algorithms: ["RS256"]
        });

        const iss = `https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_${config.auth.user_pool_ids[userPoolNum]}`;
        if (r.iss !== iss) {
            throw Error("Invalid iss");
        }

        if (r.aud !== config.auth.client_app_ids[userPoolNum]) {
            throw Error("Invalid aud");
        }

        if (r.token_use !== "id") {
            throw Error("Invalid token use");
        }

        if (r.exp <= r.iat) {
            throw Error("Expired token");
        }
        res.error = false;
        res.message = "succeeded";
        const apiUser = await loginApiAdminUser();
        res.token = apiUser.toJSON().sessionToken;
    } catch (err) {
        res.error = true;
        res.message = err.message;
        res.token = null;
    }

    return res;
});
