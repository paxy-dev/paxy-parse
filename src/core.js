const fs = require("fs");
const path = require("path");
const prettier = require("prettier");
const { plural } = require("pluralize");

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

class PageCodeGenerator {
    constructor(table, fields, dir) {
        this.dir = dir;
        this.table = table;
        this.fields = fields;
        this.plur = plural(table.toLowerCase());
    }

    createFieldItem(field) {
        const { objectId, createdAt, updatedAt, ...others } = field;
        return others;
    }

    createFields() {
        let items = this.fields.map(i => this.createFieldItem(i));
        items = JSON.stringify(items);
        let text = `import React from 'react';

        export const requestFields = ${items}

        export const updateRequestFields = [
            { name: 'id', required: true, type: 'string', disabled: true },
            ...requestFields,
        ];
          
        export const tableFields = [
            ...updateRequestFields,
            { name: 'createdAt', required: true, type: 'date', disabled: true },
            { name: 'updatedAt', required: true, type: 'date', disabled: true },
        ];
        `;
        return text;
    }

    createIndex() {
        let text = `import { createTable } from 'paxy-ui';
        import { Services } from '../../core/service';
        
        import { requestFields, updateRequestFields, tableFields } from './fields';
        
        const services = new Services('${this.table}', tableFields, {});
        
        const TableList = createTable(
          '${this.table}',
          null,
          requestFields,
          updateRequestFields,
          tableFields,
          services,
        );
        
        export default TableList;`;

        return text;
    }

    createMock() {
        let text = `import { MockBackend, ItemList } from 'paxy-ui';
        import { tableFields } from './fields';
        
        const items = new ItemList();
        items.init(tableFields, 3);
        
        const mock = new MockBackend(items, '${this.plur}');
        const apis = mock.api();
        
        export default apis;`;
        return text;
    }

    create() {
        const mockText = this.createMock();
        const fieldsText = this.createFields();
        const indexText = this.createIndex();

        const map = {
            "_mock.ts": mockText,
            "fieds.tsx": fieldsText,
            "index.tsx": indexText
        };

        const pagesPath = path.join(this.dir, this.table);
        if (!fs.existsSync(pagesPath)) {
            fs.mkdirSync(pagesPath);
        }

        for (const [key, value] of Object.entries(map)) {
            const text = prettier.format(value);
            fs.writeFileSync(path.join(pagesPath, key), text);
        }
    }
}

class MenuCodeGenerator {
    constructor(tables, dir) {
        this.dir = dir;
        this.tables = tables;
    }

    create() {
        const items = this.tables.map(i => {
            const plur = plural(i.toLowerCase());
            return {
                name: i,
                path: `/${plur}`,
                component: `/${plur}`
            };
        });
        let text = JSON.stringify(items);
        text = `export default ${text}`

        const pagesPath = path.join(this.dir, 'config');
        if (!fs.existsSync(pagesPath)) {
            fs.mkdirSync(pagesPath);
        }

        text = prettier.format(text);
        fs.writeFileSync(path.join(pagesPath, 'appRoutes.ts'), text);
    }
}

module.exports = {
    getTableData,
    createSchemaData,
    PageCodeGenerator,
    MenuCodeGenerator
};
