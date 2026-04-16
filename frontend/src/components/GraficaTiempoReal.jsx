// src/components/GraficaTiempoReal.jsx
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Registro de componentes de Chart.js necesarios para graficas de linea
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const GraficaTiempoReal = ({ socket }) => {
    const [datosVatios, setDatosVatios] = useState([]);
    const [etiquetasTiempo, setEtiquetasTiempo] = useState([]);

    useEffect(() => {
        if (!socket) return;

        // Escuchamos el evento definido en el controlador del backend
        socket.on('Nueva Metrica', (nuevaLectura) => {
            const hora = new Date(nuevaLectura.timestamp).toLocaleTimeString();
            
            // Actualizamos los estados manteniendo solo los ultimos datos para no saturar la memoria
            setDatosVatios(prev => [...prev.slice(-20), nuevaLectura.vatios_generados]);
            setEtiquetasTiempo(prev => [...prev.slice(-20), hora]);
        });

        return () => socket.off('Nueva Metrica');
    }, [socket]);

    const data = {
        labels: etiquetasTiempo,
        datasets: [
            {
                label: 'Potencia (Vatios)',
                data: datosVatios,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                fill: true,
                tension: 0.4 // Hace que la linea sea curva y no quebrada
            }
        ]
    };

    const opciones = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: false }
        },
        scales: {
            y: { beginAtZero: true }
        }
    };

    return (
        <div className="tarjeta-grafica">
            <h3 className="titulo-tarjeta">Potencia en Tiempo Real (W)</h3>
            <Line data={data} options={opciones} />
        </div>
    );
};

export default GraficaTiempoReal;