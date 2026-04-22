// src/components/GraficaDonaNodos.jsx
import { useEffect, useState, useCallback } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useAuth0 } from '@auth0/auth0-react';

ChartJS.register(ArcElement, Tooltip, Legend);

// 1. Recibimos el socket por props
const GraficaDonaNodos = ({ socket }) => {
    const { getAccessTokenSilently } = useAuth0();
    const [chartData, setChartData] = useState(null);
    const [cargando, setCargando] = useState(true);

    // 2. Encapsulamos la petición con useCallback para mantener la referencia estable
    const fetchEstadoNodos = useCallback(async () => {
        console.log("🔄 Socket detectó cambio: Actualizando dona...");
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch('http://localhost:3000/api/metricas/estado-nodos', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            const result = await response.json();

            if (result.exito) {
                let online = 0;
                let offline = 0;
                let alerta = 0;

                result.datos.forEach(row => {
                    const cantidad = parseInt(row.cantidad, 10);
                    if (row.estado === 'Online') online = cantidad;
                    if (row.estado === 'Offline') offline = cantidad;
                    if (row.estado === 'Alerta') alerta = cantidad;
                });

                setChartData({
                    labels: ['Online', 'Offline', 'Alerta'],
                    datasets: [
                        {
                            label: 'Cantidad de Nodos',
                            data: [online, offline, alerta],
                            backgroundColor: [
                                'rgba(46, 204, 113, 0.85)', 
                                'rgba(149, 165, 166, 0.85)', 
                                'rgba(231, 76, 60, 0.85)',   
                            ],
                            borderColor: ['#ffffff', '#ffffff', '#ffffff'],
                            borderWidth: 3,
                            hoverOffset: 4,
                        },
                    ],
                });
            }
        } catch (error) {
            console.error("Fallo al obtener distribución de nodos:", error);
        } finally {
            // Solo quitamos el loader, pero no lo volvemos a poner en true 
            // para que la gráfica no parpadee en cada actualización
            setCargando(false); 
        }
    }, [getAccessTokenSilently]);

    // 3. Efecto 1: Carga inicial al montar el componente
    useEffect(() => {
        fetchEstadoNodos();
    }, [fetchEstadoNodos]);

    // 4. Efecto 2: Suscripción a los WebSockets para actualizaciones en tiempo real
    useEffect(() => {
        if (!socket) return;

        // Función que maneja cualquier evento entrante por el socket
        const actualizadorDinamico = (nombreEvento) => {
            // Usamos .includes() para ignorar espacios invisibles o errores de tipeo.
            // Si el evento tiene que ver con métricas o alertas, actualizamos la dona.
            if (nombreEvento.includes('Metrica') || nombreEvento.includes('Alerta')) {
                fetchEstadoNodos();
            }
        };

        // Escuchamos absolutamente todo y filtramos por dentro
        socket.onAny(actualizadorDinamico);

        return () => {
            // Limpieza del socket al desmontar
            socket.offAny(actualizadorDinamico);
        };
    }, [socket, fetchEstadoNodos]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        // Desactivamos la animación de renderizado inicial para que las 
        // actualizaciones por socket sean instantáneas y sin parpadeos visuales
        animation: { duration: 0 }, 
        plugins: {
            legend: {
                position: 'bottom',
                labels: { padding: 20, font: { family: "'Inter', sans-serif", size: 13 } }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: { size: 14 },
                bodyFont: { size: 13 },
            }
        },
    };

    if (cargando) return <p className="texto-estado">Evaluando red...</p>;
    if (!chartData) return <p className="texto-estado">Datos no disponibles</p>;

    return (
        <div className="contenedor-canvas-dona">
            <Doughnut data={chartData} options={options} />
        </div>
    );
};

export default GraficaDonaNodos;