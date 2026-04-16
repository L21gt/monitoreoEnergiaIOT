// src/controllers/nodoController.js
const nodoService = require("../services/nodoService");

/**
 * Controlador para manejar las peticiones HTTP relacionadas con los nodos
 */
const registrarNodo = async (req, res) => {
  try {
    // Extraemos los datos del cuerpo de la peticion
    const nuevoNodo = await nodoService.crearNodo(req.body);

    // Retornamos el objeto creado con su respectivo UUID generado por la DB
    res.status(201).json(nuevoNodo);
  } catch (error) {
    console.error("Error en registrarNodo:", error);
    res
      .status(500)
      .json({ mensaje: "Error al registrar el nodo en el sistema" });
  }
};

const listarNodos = async (req, res) => {
  try {
    const nodos = await nodoService.obtenerTodos();
    res.json(nodos);
  } catch (error) {
    console.error("Error en listarNodos:", error);
    res.status(500).json({ mensaje: "Error al obtener la lista de nodos" });
  }
};

module.exports = {
  registrarNodo,
  listarNodos,
};
