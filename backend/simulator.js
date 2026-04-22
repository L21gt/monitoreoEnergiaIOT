// backend/simulator.js
const axios = require("axios");

// 1. Configuramos las credenciales correctas extraídas de tu nueva captura
const authOptions = {
  method: "POST",
  url: "https://dev-i17tf67hmrgirm7f.us.auth0.com/oauth/token",
  headers: { "content-type": "application/json" },
  data: {
    client_id: "v0BKCFDMSRQfhUmYh0IcW1OAFeovFDag",
    client_secret:
      "4sgexIcp1p-lsxPvMFHbxuseKY1CVOhucA3Qv22MsdWZsRgySRJ8gmlTYRlxZAZM",
    audience: "https://energia-api.com",
    grant_type: "client_credentials",
  },
};

async function ejecutarSimulador() {
  try {
    console.log("🔌 Solicitando token de acceso a Auth0...");
    const authResponse = await axios(authOptions);
    const token = authResponse.data.access_token;
    console.log(`Token recibido: ${token}`);
    console.log("✅ Token obtenido. Iniciando transmisión de métricas...");

    // 2. Iniciamos el envío de datos cada 5 segundos
    setInterval(async () => {
      try {
        // Array con toda tu infraestructura de nodos
        const nodosActivos = [
          "11111111-1111-1111-1111-111111111111",
          "22222222-2222-2222-2222-222222222222",
          "33333333-3333-3333-3333-333333333333",
          "44444444-4444-4444-4444-444444444444",
        ];

        // Selección aleatoria
        const nodoSeleccionado =
          nodosActivos[Math.floor(Math.random() * nodosActivos.length)];

        // Generación de valores aleatorios
        const vatios = Math.floor(Math.random() * (500 - 100 + 1)) + 100;
        const voltaje = Math.floor(Math.random() * (125 - 110 + 1)) + 110;

        const nivelesCriticidad = ["info", "warning", "error"];
        const criticidadActual =
          nivelesCriticidad[
            Math.floor(Math.random() * nivelesCriticidad.length)
          ];
        const statusCode =
          criticidadActual === "error"
            ? 500
            : criticidadActual === "warning"
              ? 400
              : 200;

        const metrica = {
          nodo_id: nodoSeleccionado,
          vatios_generados: vatios,
          voltaje: voltaje,
          status_code: statusCode,
          criticidad: criticidadActual,
          mensaje: `Transmisión en tiempo real - Estado: ${criticidadActual}`,
          timestamp: new Date().toISOString(),
        };

        // Petición POST a tu API
        const response = await axios.post(
          "http://localhost:3000/api/metricas",
          metrica,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        console.log(
          `📡 [${metrica.criticidad.toUpperCase()}] Dato enviado a nodo ${nodoSeleccionado.split("-")[0]}...`,
        );
      } catch (error) {
        console.error(
          "❌ Error enviando métrica al servidor:",
          error.response ? error.response.data : error.message,
        );
      }
    }, 5000); // 5000 ms = 5 segundos
  } catch (error) {
    console.error(
      "🚨 Error crítico al obtener token de Auth0:",
      error.response ? error.response.data : error.message,
    );
  }
}

ejecutarSimulador();
