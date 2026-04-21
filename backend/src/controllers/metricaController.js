// src/controllers/metricaController.js
const metricaService = require("../services/metricaService");

/**
 * Controlador para gestionar el flujo de datos de sensores en tiempo real
 */
const procesarMetrica = async (req, res) => {
  try {
    const metricaGuardada = await metricaService.guardarMetrica(req.body);

    // Emitir evento por Socket.io a todos los clientes conectados al Dashboard
    // Se utiliza req.io inyectado en app.js para evitar variables globales
    req.io.emit("Nueva Metrica", metricaGuardada);

    // Si la criticidad es 'error', emitimos una alerta adicional para el Dashboard
    if (metricaGuardada.criticidad === "error") {
      req.io.emit("Alerta Critica", {
        nodo: metricaGuardada.nodo_id,
        mensaje: metricaGuardada.mensaje,
        timestamp: metricaGuardada.timestamp,
      });
    }

    res.status(201).json(metricaGuardada);
  } catch (error) {
    console.error("Error al procesar metrica:", error);
    res.status(500).json({ mensaje: "Error interno al registrar metrica" });
  }
};

const getHistorico = async (req, res) => {
  try {
    // Permitimos que el frontend pase el número de días por query param (?dias=15). Por defecto será 7.
    const dias = req.query.dias ? parseInt(req.query.dias) : 7;

    const datosHistoricos =
      await metricaService.obtenerHistoricoGeneracion(dias);

    res.status(200).json({
      exito: true,
      datos: datosHistoricos,
    });
  } catch (error) {
    console.error("Error al obtener histórico de generación:", error);
    res.status(500).json({
      exito: false,
      mensaje: "Error interno al consultar el histórico",
    });
  }
};

const getLogsAvanzados = async (req, res) => {
  try {
    const { fecha, criticidad, busqueda } = req.query;

    const logs = await metricaService.obtenerLogsFiltrados({
      fecha: fecha || "hoy",
      criticidad: criticidad || "todas",
      busqueda: busqueda || "",
    });

    res.status(200).json({
      exito: true,
      datos: logs,
    });
  } catch (error) {
    console.error("Error al obtener logs filtrados:", error);
    res.status(500).json({
      exito: false,
      mensaje: "Error interno al consultar los logs",
    });
  }
};

const getEstadoNodos = async (req, res) => {
  try {
    const distribucion = await metricaService.obtenerEstadoActualNodos();
    res.status(200).json({
      exito: true,
      datos: distribucion,
    });
  } catch (error) {
    console.error("Error al obtener estado de los nodos:", error);
    res.status(500).json({
      exito: false,
      mensaje: "Error interno al consultar el estado de la red",
    });
  }
};

module.exports = {
  procesarMetrica,
  getHistorico,
  getLogsAvanzados,
  getEstadoNodos,
};
