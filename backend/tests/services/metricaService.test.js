// backend/tests/services/metricaService.test.js

const { Pool } = require("pg");
const metricaService = require("../../src/services/metricaService");

// Mock del módulo 'pg' para aislar la base de datos
jest.mock("pg", () => {
  const mPool = {
    query: jest.fn(),
    on: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

describe("Metrica Service - Pruebas Unitarias de Branching (Manejo de Errores)", () => {
  let pool;

  beforeEach(() => {
    pool = new Pool();
    // Destruimos cualquier residuo de mocks previos
    pool.query.mockReset();
    pool.on.mockReset();
  });

  // ==========================================
  // 1. guardarMetrica()
  // ==========================================
  describe("guardarMetrica()", () => {
    it("debe propagar el error si el INSERT en base de datos falla", async () => {
      // ARRANGE
      pool.query.mockRejectedValueOnce(
        new Error("Falla en constraint de base de datos"),
      );
      const payloadMock = { nodo_id: "123", vatios_generados: 100 };

      // ACT & ASSERT
      await expect(metricaService.guardarMetrica(payloadMock)).rejects.toThrow(
        "Falla en constraint de base de datos",
      );
    });
  });

  // ==========================================
  // 2. obtenerRecientes()
  // ==========================================
  describe("obtenerRecientes()", () => {
    it("debe propagar el error si el SELECT falla", async () => {
      // ARRANGE
      pool.query.mockRejectedValueOnce(
        new Error("Timeout al obtener recientes"),
      );

      // ACT & ASSERT
      await expect(metricaService.obtenerRecientes("nodo_1")).rejects.toThrow(
        "Timeout al obtener recientes",
      );
    });
  });

  // ==========================================
  // 3. obtenerHistoricoGeneracion()
  // ==========================================
  describe("obtenerHistoricoGeneracion()", () => {
    it("debe propagar el error al consultar el histórico", async () => {
      // ARRANGE
      pool.query.mockRejectedValueOnce(new Error("Error en tabla historica"));

      // ACT & ASSERT
      await expect(metricaService.obtenerHistoricoGeneracion()).rejects.toThrow(
        "Error en tabla historica",
      );
    });
  });

  // ==========================================
  // 4. obtenerLogsFiltrados()
  // ==========================================
  describe("obtenerLogsFiltrados()", () => {
    it("debe propagar el error al aplicar filtros en los logs", async () => {
      // ARRANGE
      pool.query.mockRejectedValueOnce(
        new Error("Error sintáctico en consulta de logs"),
      );

      // ACT & ASSERT
      // Pasamos un objeto vacío {} para evitar el error de desestructuración
      await expect(metricaService.obtenerLogsFiltrados({})).rejects.toThrow(
        "Error sintáctico en consulta de logs",
      );
    });
  });

  // ==========================================
  // 5. obtenerEstadoActualNodos()
  // ==========================================
  describe("obtenerEstadoActualNodos()", () => {
    it("debe retornar la distribución de nodos (Camino Feliz)", async () => {
      // ARRANGE: Probamos un camino feliz solo para asegurar el coverage de las líneas internas del map
      const mockRows = [
        { estado: "Online", cantidad: "2" },
        { estado: "Alerta", cantidad: "1" },
      ];
      pool.query.mockResolvedValueOnce({ rows: mockRows });

      // ACT
      const resultado = await metricaService.obtenerEstadoActualNodos();

      // ASSERT
      expect(resultado).toBeInstanceOf(Array);
      expect(resultado[0].estado).toBe("Online");
    });

    it("debe propagar errores si la agrupación por estados falla", async () => {
      // ARRANGE
      pool.query.mockRejectedValueOnce(
        new Error("Conexión rechazada por el pool"),
      );

      // ACT & ASSERT
      await expect(metricaService.obtenerEstadoActualNodos()).rejects.toThrow(
        "Conexión rechazada por el pool",
      );
    });
  });
});
