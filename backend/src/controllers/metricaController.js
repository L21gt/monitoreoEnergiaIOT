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

module.exports = {
  procesarMetrica,
};
