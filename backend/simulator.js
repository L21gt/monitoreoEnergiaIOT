// simulator.js
const axios = require("axios");

// Configuracion del simulador
const API_URL = "http://localhost:3000/api/metricas";
const NODO_ID = "f4c9ab3d-dbfc-4c0f-8c2d-d9f5682921f7"; // El ID de la base de datos
const TOKEN =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkZhVlJtVmxWXzM0Z0ZGcC1wanptYSJ9.eyJpc3MiOiJodHRwczovL2Rldi1pMTd0ZjY3aG1yZ2lybTdmLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJaN3JNNEhmeXhWbFZHNmttbjZaY2UzU2NGVFRsZ3JxRkBjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9lbmVyZ2lhLWFwaS5jb20iLCJpYXQiOjE3NzYyMzMzMDEsImV4cCI6MTc3NjMxOTcwMSwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIiwiYXpwIjoiWjdyTTRIZnl4VmxWRzZrbW42WmNlM1NjRlRUbGdycUYifQ.kbGVm8KWlVExEV8hUjPDZX2ZYYPSfubE5fLgXSRw4KUYbkjLGXslVVTdiJHuCTyFDPkXhzmpbqGirhibBZCiwL7QhyVFa5SEDXBXn70xI9JCVL0Y6ML2qX4QhYmNz9vnt8esKALVmk9F7G1RjFu3RXsDv_-IpE6glQmAIKIpJM8I7J1Hp3Cjws4O1LW4-I87MJoCg9CGIWAvOB_Xa3iIilhx1RzDw0VeWKjUACFFzoKIYoJxJ_bD_E7bWFVC_O_iDFun2xT9o6XCJwabbnO8wRkS-OhNE6q9jvmhcd5Z9TUY--A_P-byqRFeuP88a06actKvGQMPr5CjliUnLYS-EA";

/**
 * Funcion para generar valores aleatorios de energia
 * Simula el comportamiento de un inversor solar real
 */
const generarLectura = () => {
  const vatios = (Math.random() * (5000 - 100) + 100).toFixed(2);
  const voltaje = (Math.random() * (245 - 210) + 210).toFixed(2);

  // Determinamos la criticidad de forma aleatoria para probar las alertas
  const rand = Math.random();
  let criticidad = "info";
  let status_code = 200;
  let mensaje = "Operación normal";

  if (rand > 0.95) {
    criticidad = "error";
    status_code = 500;
    mensaje = "Fallo crítico en el inversor - Sobrecalentamiento";
  } else if (rand > 0.85) {
    criticidad = "warning";
    status_code = 400;
    mensaje = "Baja eficiencia detectada por nubosidad";
  }

  return {
    nodo_id: NODO_ID,
    vatios_generados: parseFloat(vatios),
    voltaje: parseFloat(voltaje),
    status_code: status_code,
    criticidad: criticidad,
    mensaje: mensaje,
  };
};

/**
 * Ciclo principal de ejecucion cada 5 segundos
 */
const iniciarSimulacion = () => {
  console.log("--- Iniciando Simulador de Nodos IoT ---");

  setInterval(async () => {
    try {
      const data = generarLectura();

      // NOTA: Para que esto funcione con el middleware de Auth0,
      // deberiamos enviar el header 'Authorization: Bearer TOKEN'
      const response = await axios.post(API_URL, data, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });

      console.log(
        `[${new Date().toLocaleTimeString()}] Metrica enviada: ${data.vatios_generados}W - Status: ${response.status}`,
      );
    } catch (error) {
      console.error("Error al enviar metrica:", error.message);
    }
  }, 5000); // Requisito: cada 5 segundos
};

iniciarSimulacion();
