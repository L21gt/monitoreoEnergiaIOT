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

module.exports = router;
