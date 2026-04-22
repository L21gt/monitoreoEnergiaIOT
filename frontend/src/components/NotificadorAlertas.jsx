// src/components/NotificadorAlertas.jsx
import { useState, useEffect } from 'react';

const NotificadorAlertas = ({ socket }) => {
    const [alertas, setAlertas] = useState([]);

    useEffect(() => {
        if (!socket) return;

        const handleAlertaCritica = (nuevaAlerta) => {
            // Generamos un ID único basado en el timestamp exacto de recepción
            const id = crypto.randomUUID();
            
            setAlertas(prevAlertas => [...prevAlertas, { ...nuevaAlerta, id }]);

            // Cleanup routine: Auto-remover la alerta después de 5 segundos
            setTimeout(() => {
                setAlertas(prevAlertas => prevAlertas.filter(alerta => alerta.id !== id));
            }, 5000);
        };

        socket.on('Alerta Critica', handleAlertaCritica);

        return () => {
            socket.off('Alerta Critica', handleAlertaCritica);
        };
    }, [socket]);

    // Render nulo si no hay alertas activas en el stack
    if (alertas.length === 0) return null;

    return (
        <div className="toast-container">
            {alertas.map(alerta => (
                <div key={alerta.id} className={`toast-alerta ${alerta.criticidad === 'warning' ? 'warning' : ''}`}>
                    <span className="toast-titulo">
                        {alerta.criticidad === 'warning' ? '⚠️ Advertencia Detectada' : '🚨 Error Crítico'}
                    </span>
                    <span className="toast-mensaje">
                        {/* Agregamos validación de seguridad por si nodo_id viene undefined del backend */}
                        <strong>Nodo:</strong> {alerta.nodo_id ? alerta.nodo_id.split('-')[0] : 'Desconocido'}... <br/>
                        <strong>Mensaje:</strong> {alerta.mensaje} <br/>
                        <strong>Potencia:</strong> {alerta.vatios_generados} W
                    </span>
                </div>
            ))}
        </div>
    );
};

export default NotificadorAlertas;