// src/config/db.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Consulta de prueba inmediata para validar conexion
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err.stack);
  } else {
    console.log(
      "¡Conexion exitosa a PostgreSQL! Fecha del servidor:",
      res.rows[0].now,
    );
  }
});

// Evento para logs de depuracion de futuras conexiones
pool.on("error", (err) => {
  console.error("Error inesperado en el pool de Postgres:", err);
  process.exit(-1);
});

module.exports = pool;
