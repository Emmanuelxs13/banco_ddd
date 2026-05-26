#!/usr/bin/env node
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { Client } = require("pg");

async function run() {
  const email = process.argv[2] || "admin@banco.com";
  const plain = process.argv[3] || "password123";
  const hash = await bcrypt.hash(plain, 10);

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
      "UPDATE public.usuario_sistema SET contrasena_hash = $1 WHERE correo_electronico = $2 RETURNING id_usuario",
      [hash, email],
    );
    if (res.rowCount === 0) {
      console.log("No se actualizó ningún usuario. Verifica el correo.");
    } else {
      console.log(`Contraseña actualizada para ${email}`);
    }
  } catch (err) {
    console.error("Error actualizando contraseña:", err.message || err);
  } finally {
    await client.end();
  }
}

run();
