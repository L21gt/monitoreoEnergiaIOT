// src/routes/metricaRoutes.js
const express = require("express");
const router = express.Router();
const metricaController = require("../controllers/metricaController");
const { verificarToken } = require("../middleware/authMiddleware");

/**
 * Ruta para recibir datos del simulador o nodos reales
 * Protegida por Auth0 segun los requerimientos del proyecto
 */
router.post("/", verificarToken, metricaController.procesarMetrica);

// Nuevo endpoint para la gráfica de barras histórica
router.get("/historico", verificarToken, metricaController.getHistorico);

// Nuevo endpoint para la tabla avanzada
router.get("/logs", verificarToken, metricaController.getLogsAvanzados);

// Endpoint para la gráfica de dona
router.get("/estado-nodos", verificarToken, metricaController.getEstadoNodos);

module.exports = router;
