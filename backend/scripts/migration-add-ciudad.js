#!/usr/bin/env node
require("dotenv").config();
const { Client } = require("pg");

async function run() {
  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "banco_core",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
  });
  await client.connect();
  try {
    console.log("Aplicando migración: agregar columna ciudad si no existe...");
    await client.query(
      "ALTER TABLE public.cliente_persona ADD COLUMN IF NOT EXISTS ciudad character varying(100);",
    );
    await client.query(
      "ALTER TABLE public.cliente_empresa ADD COLUMN IF NOT EXISTS ciudad character varying(100);",
    );
    console.log("Migración aplicada correctamente");
  } catch (err) {
    console.error("Error aplicando migración:", err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
