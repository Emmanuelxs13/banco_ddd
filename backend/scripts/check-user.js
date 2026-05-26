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
    const res = await client.query(
      "SELECT id_usuario, correo_electronico, contrasena_hash FROM public.usuario_sistema WHERE correo_electronico = 'admin@banco.com' LIMIT 1",
    );
    if (res.rows.length === 0) {
      console.log("Usuario no encontrado");
    } else {
      console.log("Usuario encontrado:");
      console.log(res.rows[0]);
    }
  } catch (err) {
    console.error("Error consultando usuario:", err.message || err);
  } finally {
    await client.end();
  }
}

run();
