const createSchemaData = (tableName, fields) => {
    const className = tableName;
    data = {};
    fields.forEach(i => {
        data[i.name] = { type: i.type };
    });

    const schemaData = {
        className,
        fields: {
            objectId: { type: "String" },
            createdAt: {
                type: "Date"
            },
            updatedAt: {
                type: "Date"
            },
            ACL: { type: "ACL" },
            ...data
        },
        indexes: {
            objectId: { objectId: 1 }
        },
        classLevelPermissions: {
            find: { "role:Admin": true },
            count: { "role:Admin": true },
            get: { "role:Admin": true },
            update: { "role:Admin": true },
            create: { "role:Admin": true },
            delete: { "role:Admin": true },
            addField: {},
            protectedFields: {
                "role:Admin": []
            }
        }
    };
    return schemaData;
};

const getTableData = async () => {
    const query = new Parse.Query("Field");
    query.include("table");
    const fields = await query.find({ useMasterKey: true });
    const tables = {};
    for (let f of fields) {
        const { table, ...others } = f.toJSON();
        if (tables[table.name]) {
            tables[table.name].fields.push(others);
        } else {
            tables[table.name] = {
                meta: {},
                fields: [others]
            };
        }
    }
    return tables;
};

module.exports = { getTableData, createSchemaData };
