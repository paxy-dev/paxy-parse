const User = {
    className: "_User",
    fields: {
        objectId: { type: "String" },
        createdAt: {
            type: "Date"
        },
        updatedAt: {
            type: "Date"
        },
        ACL: { type: "ACL" },
        email: { type: "String" },
        authData: { type: "Object" },
        password: { type: "String" },
        username: { type: "String" }
    },
    indexes: {
        objectId: { objectId: 1 }
    },
    classLevelPermissions: {
        find: { requiresAuthentication: true },
        count: { requiresAuthentication: true },
        get: { requiresAuthentication: true },
        update: { "role:Admin": true },
        create: { "role:Admin": true },
        delete: { "role:Admin": true },
        addField: {},
        protectedFields: {
            "role:Admin": []
        }
    }
};

const Table = {
    className: "Table",
    fields: {
        objectId: { type: "String" },
        createdAt: {
            type: "Date"
        },
        updatedAt: {
            type: "Date"
        },
        ACL: { type: "ACL" },
        name: { type: "String" }
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

const Field = {
    className: "Field",
    fields: {
        objectId: { type: "String" },
        createdAt: {
            type: "Date"
        },
        updatedAt: {
            type: "Date"
        },
        ACL: { type: "ACL" },
        table: { type: "Pointer", targetClass: "Table" },
        name: { type: "String" },
        type: { type: "String" },
        required: { type: "Boolean" },
        disabled: { type: "Boolean" },
        width: { type: "String" },
        valueEnum: { type: "Array" },
        label: { type: "String" },
        render: { type: "String" },
        sorter: { type: "String" },
        pointTo: { type: "String" }
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

module.exports = { User, Table, Field };
