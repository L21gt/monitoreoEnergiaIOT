// src/components/TablaLogsAvanzada.jsx
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const TablaLogsAvanzada = () => {
    const { getAccessTokenSilently } = useAuth0();
    const [logs, setLogs] = useState([]);
    const [cargando, setCargando] = useState(false);
    
    const [filtros, setFiltros] = useState({
        busqueda: '',
        fecha: 'mes', // Por defecto cargamos el mes para que veas la data del seeder
        criticidad: 'todas'
    });

    useEffect(() => {
        const fetchLogs = async () => {
            setCargando(true);
            try {
                const token = await getAccessTokenSilently();
                
                // Serializamos el objeto de filtros a query params (?fecha=mes&criticidad=todas...)
                const queryParams = new URLSearchParams(filtros).toString();
                
                const response = await fetch(`http://localhost:3000/api/metricas/logs?${queryParams}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                const result = await response.json();
                if (result.exito) {
                    setLogs(result.datos);
                }
            } catch (error) {
                console.error("Fallo al obtener los logs:", error);
            } finally {
                setCargando(false);
            }
        };

        // Debounce pattern: Retrasamos el fetch 300ms. 
        // Si el usuario teclea rápido, limpiamos el timeout y evitamos saturar la API.
        const timeoutId = setTimeout(() => {
            fetchLogs();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [filtros, getAccessTokenSilently]);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({ ...prev, [name]: value }));
    };

    const getBadgeClass = (criticidad) => {
        const clases = {
            info: 'badge badge-info',
            warning: 'badge badge-warning',
            error: 'badge badge-error'
        };
        return clases[criticidad] || 'badge';
    };

    // Helper para formatear fechas
    const formatearFecha = (fechaISO) => {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleString('es-ES', { 
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    return (
        <section className="tarjeta-grafica seccion-tabla">
            <h2 className="titulo-tarjeta">Historial de Eventos</h2>
            
            <div className="controles-tabla">
                <input 
                    type="text" 
                    name="busqueda"
                    placeholder="Buscar por ID de nodo o ubicación..." 
                    className="input-busqueda"
                    value={filtros.busqueda}
                    onChange={handleFiltroChange}
                />
                
                <select 
                    name="fecha" 
                    className="select-filtro"
                    value={filtros.fecha}
                    onChange={handleFiltroChange}
                >
                    <option value="hoy">Hoy</option>
                    <option value="ayer">Ayer</option>
                    <option value="mes">Último Mes</option>
                </select>

                <select 
                    name="criticidad" 
                    className="select-filtro"
                    value={filtros.criticidad}
                    onChange={handleFiltroChange}
                >
                    <option value="todas">Todas las Criticidades</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                </select>
            </div>

            <div className="contenedor-tabla">
                <table className="tabla-logs">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>ID Nodo</th>
                            <th>Ubicación</th>
                            <th>Vatios</th>
                            <th>Criticidad</th>
                            <th>Mensaje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cargando ? (
                            <tr>
                                <td colSpan="6" className="texto-estado">Buscando registros...</td>
                            </tr>
                        ) : logs.length > 0 ? (
                            logs.map((log, index) => (
                                // Usamos el index temporalmente como key si no tienes ID único en la consulta
                                <tr key={index}> 
                                    <td>{formatearFecha(log.timestamp)}</td>
                                    <td title={log.nodo_id}>{log.nodo_id.split('-')[0]}...</td>
                                    <td>{log.ubicacion || 'N/A'}</td>
                                    <td>{log.vatios} W</td>
                                    <td>
                                        <span className={getBadgeClass(log.criticidad)}>
                                            {log.criticidad}
                                        </span>
                                    </td>
                                    <td>{log.mensaje}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="texto-estado">No se encontraron registros que coincidan con los filtros.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default TablaLogsAvanzada;