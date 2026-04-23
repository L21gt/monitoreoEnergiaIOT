// backend/tests/sockets.test.js

// Mock de la dependencia jwks-rsa para evitar problemas ESM/CommonJS
jest.mock("jwks-rsa", () =>
  jest.fn().mockImplementation(() => ({ getSigningKey: jest.fn() })),
);

// Hacemos un "espía" del módulo db.js para evitar que la aplicación intente
// conectarse a PostgreSQL al importar app.js
jest.mock("../src/config/db", () => ({
  query: jest.fn(),
  on: jest.fn(),
}));

const app = require("../src/app"); // Importar la app ejecutará el código de WebSockets

describe("WebSockets (app.js) - Pruebas Unitarias", () => {
  let mockSocket;
  let mockIo;

  beforeEach(() => {
    // ARRANGE: Simulamos un objeto Socket.io completo
    mockSocket = {
      id: "socket_123",
      handshake: {
        auth: { token: "mocked_jwt_token" },
        address: "127.0.0.1",
      },
      on: jest.fn(), // Espía para cuando el cliente envía eventos
      emit: jest.fn(), // Espía para cuando el servidor envía al cliente
      disconnect: jest.fn(),
    };

    mockIo = {
      use: jest.fn(),
      on: jest.fn((event, callback) => {
        // Si la app.js registra el evento 'connection', lo disparamos inmediatamente
        if (event === "connection") {
          callback(mockSocket);
        }
      }),
    };

    // NOTA: Para alcanzar ese 100% en app.js, necesitaríamos extraer la lógica
    // del socket a un archivo separado (ej. socketHandler.js). Como está acoplado
    // en app.js, Jest ya lo evaluó al iniciar y marcó el 57%.
    // ¡Esta prueba es preparatoria para futuras refactorizaciones!
  });

  it("El servidor debe estar definido y exportar la instancia de Express", () => {
    expect(app).toBeDefined();
  });
});
