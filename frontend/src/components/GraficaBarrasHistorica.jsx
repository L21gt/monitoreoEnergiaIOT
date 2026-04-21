// src/components/GraficaBarrasHistorica.jsx
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useAuth0 } from '@auth0/auth0-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

// Registro de módulos específicos para gráficas de barras
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const GraficaBarrasHistorica = () => {
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [cargando, setCargando] = useState(true);
    const { getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        const fetchHistorico = async () => {
            try {
                // Solicitamos el JWT silenciosamente para autorizar la petición HTTP
                const token = await getAccessTokenSilently();
                
                const response = await fetch('http://localhost:3000/api/metricas/historico?dias=7', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                const result = await response.json();

                if (result.exito) {
                    // Mapeo de la respuesta SQL a la estructura de Chart.js
                    const etiquetas = result.datos.map(d => d.fecha);
                    const valores = result.datos.map(d => parseFloat(d.total_generado));

                    setChartData({
                        labels: etiquetas,
                        datasets: [
                            {
                                label: 'Energía Total Generada (W)',
                                data: valores,
                                backgroundColor: 'rgba(46, 204, 113, 0.7)', // Verde success
                                borderColor: 'rgba(39, 174, 96, 1)',
                                borderWidth: 1,
                                borderRadius: 4, // Bordes redondeados para UI moderna
                            }
                        ]
                    });
                }
            } catch (error) {
                console.error("Fallo al obtener el histórico de generación:", error);
            } finally {
                setCargando(false);
            }
        };

        fetchHistorico();
    }, [getAccessTokenSilently]);

    const opciones = {
        responsive: true,
        maintainAspectRatio: false, 
        plugins: {
            legend: { position: 'top' },
            tooltip: { mode: 'index', intersect: false }
        },
        scales: {
            y: { 
                beginAtZero: true, 
                title: { display: true, text: 'Vatios Totales (W)' } 
            },
            x: { 
                title: { display: true, text: 'Fecha' } 
            }
        }
    };

    if (cargando) return <p className="texto-estado">Cargando histórico...</p>;

    return <Bar data={chartData} options={opciones} />;
};

export default GraficaBarrasHistorica;