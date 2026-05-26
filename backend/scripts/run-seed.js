#!/usr/bin/env node
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

async function run() {
  const filePath = path.resolve(__dirname, "..", "seed-test-data.sql");
  if (!fs.existsSync(filePath)) {
    console.error("No se encontró seed-test-data.sql en", filePath);
    process.exit(1);
  }

  const sql = fs.readFileSync(filePath, "utf8");

  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "banco_core",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
  });

  try {
    await client.connect();
    console.log("Conectado a la base de datos, ejecutando seed...");
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("Seed ejecutado correctamente");
    process.exit(0);
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (e) {}
    console.error("Error ejecutando seed:", err.message || err);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

run();
