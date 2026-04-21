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

const obtenerHistoricoGeneracion = async (dias = 7) => {
  // Agrupamos por fecha (YYYY-MM-DD) y sumamos la generación total.
  // Usamos $1 para parametrizar el intervalo y prevenir inyección SQL.
  const query = `
        SELECT 
            TO_CHAR(timestamp, 'YYYY-MM-DD') AS fecha,
            SUM(vatios_generados) AS total_generado
        FROM metricas_log
        WHERE timestamp >= NOW() - $1::interval
        GROUP BY TO_CHAR(timestamp, 'YYYY-MM-DD')
        ORDER BY fecha ASC;
    `;

  // Pasamos el parámetro de días interpolado como un string de intervalo ('7 days')
  const { rows } = await pool.query(query, [`${dias} days`]);
  return rows;
};

const obtenerLogsFiltrados = async ({ fecha, criticidad, busqueda }) => {
  // Usamos LEFT JOIN para poder buscar por la ubicación del nodo
  let query = `
        SELECT 
            m.timestamp, 
            m.nodo_id, 
            n.ubicacion, 
            m.vatios_generados as vatios, 
            m.criticidad, 
            m.mensaje
        FROM metricas_log m
        LEFT JOIN nodos n ON m.nodo_id = n.id
        WHERE 1=1
    `;

  const values = [];
  let paramCount = 1;

  // 1. Filtro Rango de Fechas
  if (fecha === "hoy") {
    query += ` AND DATE(m.timestamp) = CURRENT_DATE`;
  } else if (fecha === "ayer") {
    query += ` AND DATE(m.timestamp) = CURRENT_DATE - INTERVAL '1 day'`;
  } else if (fecha === "mes") {
    query += ` AND m.timestamp >= CURRENT_DATE - INTERVAL '1 month'`;
  }

  // 2. Filtro Criticidad
  if (criticidad && criticidad !== "todas") {
    query += ` AND m.criticidad = $${paramCount}`;
    values.push(criticidad);
    paramCount++;
  }

  // 3. Filtro Buscador (ID o Ubicación) usando ILIKE para ignorar mayúsculas/minúsculas
  if (busqueda && busqueda.trim() !== "") {
    query += ` AND (m.nodo_id::text ILIKE $${paramCount} OR n.ubicacion ILIKE $${paramCount})`;
    values.push(`%${busqueda.trim()}%`);
    paramCount++;
  }

  // Ordenamos por los más recientes y limitamos a 100 para no reventar la memoria del DOM
  query += ` ORDER BY m.timestamp DESC LIMIT 100;`;

  const { rows } = await pool.query(query, values);
  return rows;
};

const obtenerEstadoActualNodos = async () => {
  // Usamos DISTINCT ON para capturar solo la última métrica de cada nodo
  const query = `
        WITH UltimoLog AS (
            SELECT DISTINCT ON (n.id) 
                n.id as nodo_id, 
                m.criticidad, 
                m.timestamp
            FROM nodos n
            LEFT JOIN metricas_log m ON n.id = m.nodo_id
            ORDER BY n.id, m.timestamp DESC
        )
        SELECT 
            CASE 
                WHEN timestamp IS NULL OR timestamp < NOW() - INTERVAL '5 minutes' THEN 'Offline'
                WHEN criticidad IN ('warning', 'error') THEN 'Alerta'
                ELSE 'Online'
            END as estado,
            COUNT(*) as cantidad
        FROM UltimoLog
        GROUP BY 
            CASE 
                WHEN timestamp IS NULL OR timestamp < NOW() - INTERVAL '5 minutes' THEN 'Offline'
                WHEN criticidad IN ('warning', 'error') THEN 'Alerta'
                ELSE 'Online'
            END;
    `;

  const { rows } = await pool.query(query);
  return rows;
};

module.exports = {
  ...metricaService,
  obtenerHistoricoGeneracion,
  obtenerLogsFiltrados,
  obtenerEstadoActualNodos,
};
