import { Client } from "pg";
import { Item } from "./models";

const client = new Client();

export async function connect() {
    try {
        await client.connect();
        console.log("Connected to PostgreSQL database");
    } catch (err) {
        console.log("Error connecting to PostgreSQL:", err);
    }
}

export async function makeTable() {
    const text =
        "CREATE TABLE IF NOT EXISTS prices (\
                    store VARCHAR(255) NOT NULL,\
                    id VARCHAR(255) NOT NULL,\
                    name VARCHAR(510) NOT NULL,\
                    category VARCHAR(255),\
                    unavailable VARCHAR(255),\
                    price MONEY NOT NULL,\
                    priceHistory JSONB,\
                    isWeighted BOOLEAN,\
                    unit VARCHAR(8),\
                    quantity DECIMAL,\
                    isOrganic BOOLEAN,\
                    url VARCHAR(255),\
                    search VARCHAR(255),\
                    sorted BOOLEAN,\
                    chart BOOLEAN,\
                    PRIMARY KEY (store, id));";
    try {
        await client.query(text);
        console.log("Table successfully created");
    } catch (error) {
        console.error("Error creating table", error);
    }
}

export async function insertData(items: Item[]) {
    const text =
        "INSERT INTO prices\
                    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)\
                    ON CONFLICT (store, id) DO UPDATE\
                      SET store = excluded.store, id = excluded.id;";
    let counter = 0;
    try {
        await client.query("BEGIN");
        for (const item of items) {
            const result = await client.query(text, [
                item.store,
                item.id,
                item.name,
                item.category,
                item.unavailable,
                item.price,
                JSON.stringify(item.priceHistory),
                item.isWeighted,
                item.unit,
                item.quantity,
                item.isOrganic,
                item.url,
                item.search,
                item.sorted,
                item.chart,
            ]);
            counter = counter + result.rowCount!;
        }
        await client.query("COMMIT");
        console.log("Data inserted successfully:", counter);
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error inserting data:", error);
    }
}

async function query() {
    const count = "SELECT COUNT(*) FROM foo;";
    try {
        const countResult = await client.query(count);
        console.log("COUNT:", countResult);
    } catch (error) {
        console.log("Failed:", error);
    }
}
