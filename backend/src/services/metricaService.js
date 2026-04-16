// src/services/metricaService.js
const pool = require("../config/db");

/**
 * Servicio encargado de la persistencia de lecturas de energia
 */
const metricaService = {
  // Registra una nueva lectura proveniente de un nodo sensor
  guardarMetrica: async (datos) => {
    const {
      nodo_id,
      vatios_generados,
      voltaje,
      status_code,
      criticidad,
      mensaje,
    } = datos;

    const query = `
            INSERT INTO metricas_log (nodo_id, vatios_generados, voltaje, status_code, criticidad, mensaje)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
    const values = [
      nodo_id,
      vatios_generados,
      voltaje,
      status_code,
      criticidad,
      mensaje,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Obtiene las ultimas métricas para la grafica de linea (ultimos 5 minutos)
  obtenerRecientes: async (nodoId) => {
    const query = `
            SELECT * FROM metricas_log 
            WHERE nodo_id = $1 
            AND timestamp >= NOW() - INTERVAL '5 minutes'
            ORDER BY timestamp DESC;
        `;
    const result = await pool.query(query, [nodoId]);
    return result.rows;
  },
};

module.exports = metricaService;
