// src/services/nodoService.js
const pool = require("../config/db");

/**
 * Servicio para gestionar la persistencia de los nodos sensores
 */
const nodoService = {
  // Inserta un nuevo nodo en la base de datos
  // Se espera que el objeto 'datosNodo' cumpla con el esquema definido en la tabla
  crearNodo: async (datosNodo) => {
    const { nombre, ubicacion, version_fw } = datosNodo;
    const query = `
            INSERT INTO nodos (nombre, ubicacion, version_fw)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
    const values = [nombre, ubicacion, version_fw];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Recupera todos los nodos registrados para el listado del dashboard
  obtenerTodos: async () => {
    const query = "SELECT * FROM nodos ORDER BY nombre ASC;";
    const result = await pool.query(query);
    return result.rows;
  },
};

module.exports = nodoService;
