// src/components/GraficaDonaNodos.jsx
import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useAuth0 } from '@auth0/auth0-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const GraficaDonaNodos = () => {
    const { getAccessTokenSilently } = useAuth0();
    const [chartData, setChartData] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const fetchEstadoNodos = async () => {
            try {
                const token = await getAccessTokenSilently();
                const response = await fetch('http://localhost:3000/api/metricas/estado-nodos', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                const result = await response.json();

                if (result.exito) {
                    // Inicializamos los contadores en 0
                    let online = 0;
                    let offline = 0;
                    let alerta = 0;

                    // Mapeamos los resultados de SQL a nuestras variables
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
                                    'rgba(46, 204, 113, 0.85)', // Success Green
                                    'rgba(149, 165, 166, 0.85)', // Offline Gray
                                    'rgba(231, 76, 60, 0.85)',   // Danger/Alert Red
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
                setCargando(false);
            }
        };

        // En un dashboard real, esto podría estar en un setInterval o actualizarse vía Socket
        fetchEstadoNodos();
    }, [getAccessTokenSilently]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    font: { family: "'Inter', sans-serif", size: 13 }
                }
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