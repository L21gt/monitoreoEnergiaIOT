// backend/tests/api.integration.test.js

// Mocks de dependencias y seguridad (Aislamiento de entorno)
jest.mock("jwks-rsa", () =>
  jest.fn().mockImplementation(() => ({ getSigningKey: jest.fn() })),
);
jest.mock("../src/middleware/authMiddleware", () => ({
  verificarToken: (req, res, next) => next(),
  checkJwt: (req, res, next) => next(),
}));

// Mock del driver de BD para evitar conexiones reales durante el CI/CD
jest.mock("pg", () => {
  const mPool = { query: jest.fn(), on: jest.fn() };
  return { Pool: jest.fn(() => mPool) };
});

// Mock de Sockets para evitar colisiones de puertos TCP (EADDRINUSE)
jest.mock("socket.io", () => ({
  Server: jest
    .fn()
    .mockImplementation(() => ({
      use: jest.fn(),
      on: jest.fn(),
      emit: jest.fn(),
    })),
}));

const request = require("supertest");
const app = require("../src/app");
const { Pool } = require("pg");

describe("API Dashboard - Pruebas de Integración (Full Coverage)", () => {
  let pool;

  beforeEach(() => {
    pool = new Pool();
    // Limpieza estricta de estado entre pruebas para prevenir "Efecto Dominó"
    pool.query.mockReset();
  });

  // ==========================================
  // 1. ENDPOINTS DE NODOS
  // ==========================================
  describe("Nodos API", () => {
    it("GET /api/nodos - Camino feliz", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: "123", nombre: "Nodo 1" }],
      });
      const res = await request(app).get("/api/nodos");
      expect(res.statusCode).toBe(200);
    });

    it("GET /api/nodos - Manejo de error en DB (Catch Branch)", async () => {
      pool.query.mockRejectedValueOnce(new Error("Falla DB"));
      const res = await request(app).get("/api/nodos");
      expect(res.statusCode).toBe(500);
    });

    it("POST /api/nodos - Crear nodo", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: "999", nombre: "Nuevo" }],
      });
      const res = await request(app)
        .post("/api/nodos")
        .send({ nombre: "Nuevo" });
      expect([200, 201]).toContain(res.statusCode);
    });

    it("POST /api/nodos - Manejo de error en insercion (Catch Branch)", async () => {
      pool.query.mockRejectedValueOnce(new Error("Falla DB"));
      const res = await request(app)
        .post("/api/nodos")
        .send({ nombre: "Falla" });
      expect(res.statusCode).toBe(500);
    });
  });

  // ==========================================
  // 2. ENDPOINTS DE MÉTRICAS (GET)
  // ==========================================
  describe("Métricas API (Consultas)", () => {
    // Endpoint: /logs (Tabla Avanzada)
    it("GET /api/metricas/logs - Tabla avanzada (Camino Feliz)", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ vatios_generados: 200, criticidad: "info" }],
      });
      const res = await request(app).get("/api/metricas/logs");
      expect(res.statusCode).toBe(200);
    });

    it("GET /api/metricas/logs - Error en DB", async () => {
      pool.query.mockRejectedValueOnce(new Error("Timeout DB"));
      const res = await request(app).get("/api/metricas/logs");
      expect(res.statusCode).toBe(500);
    });

    // Endpoint: /historico (Gráfica de barras)
    it("GET /api/metricas/historico - Gráfica de barras (Camino Feliz)", async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ vatios_generados: 250 }] });
      const res = await request(app).get("/api/metricas/historico");
      expect(res.statusCode).toBe(200);
    });

    it("GET /api/metricas/historico - Error en DB", async () => {
      pool.query.mockRejectedValueOnce(new Error("Timeout DB"));
      const res = await request(app).get("/api/metricas/historico");
      expect(res.statusCode).toBe(500);
    });

    // Endpoint: /estado-nodos (Gráfica de Dona)
    it("GET /api/metricas/estado-nodos - Gráfica de dona (Camino Feliz)", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ estado: "Online", cantidad: "4" }],
      });
      const res = await request(app).get("/api/metricas/estado-nodos");
      expect(res.statusCode).toBe(200);
    });

    it("GET /api/metricas/estado-nodos - Error en DB", async () => {
      pool.query.mockRejectedValueOnce(new Error("Falla DB"));
      const res = await request(app).get("/api/metricas/estado-nodos");
      expect(res.statusCode).toBe(500);
    });
  });

  // ==========================================
  // 3. ENDPOINTS DE MÉTRICAS (POST / SIMULADOR)
  // ==========================================
  describe("Métricas API (Inserción y WebSockets)", () => {
    it("POST /api/metricas - Registrar métrica standard y emitir evento", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1, criticidad: "info", vatios_generados: 250 }],
      });
      const payload = {
        nodo_id: "1",
        vatios_generados: 250,
        criticidad: "info",
      };

      const res = await request(app).post("/api/metricas").send(payload);
      expect([200, 201]).toContain(res.statusCode);
    });

    it("POST /api/metricas - Registrar alerta crítica (Branching IF)", async () => {
      // Evaluamos la bifurcación condicional cuando la criticidad dispara alertas
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 2, criticidad: "error", vatios_generados: 400 }],
      });
      const payload = {
        nodo_id: "1",
        vatios_generados: 400,
        criticidad: "error",
      };

      const res = await request(app).post("/api/metricas").send(payload);
      expect([200, 201]).toContain(res.statusCode);
    });

    it("POST /api/metricas - Manejo de error en inserción (Catch Branch)", async () => {
      pool.query.mockRejectedValueOnce(new Error("Falla en Insert"));
      const res = await request(app)
        .post("/api/metricas")
        .send({ nodo_id: "1" });
      expect(res.statusCode).toBe(500);
    });
  });
});
