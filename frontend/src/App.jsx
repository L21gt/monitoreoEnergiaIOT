// src/App.jsx
import { useEffect, useState, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { conectarSocket } from './services/socket';
import GraficaTiempoReal from './components/GraficaTiempoReal';
import GraficaDonaNodos from './components/GraficaDonaNodos';
import GraficaBarrasHistorica from './components/GraficaBarrasHistorica';
import TablaLogsAvanzada from './components/TablaLogsAvanzada';
import './styles/dashboard.css';

function App() {
    const { isAuthenticated, loginWithRedirect, logout, getAccessTokenSilently, user, isLoading } = useAuth0();
    
    // Estado para propagar la instancia activa del socket a los componentes hijos
    const [socket, setSocket] = useState(null);
    
    // Persistencia de la referencia del socket a través de re-renders para prevenir memory leaks y múltiples handshakes
    const socketRef = useRef(null);

    useEffect(() => {
        // Early return para prevenir ejecución sin sesión o si la conexión WS ya está establecida
        if (!isAuthenticated || socketRef.current) return;

        const inicializarPanel = async () => {
            try {
                // Fetch silencioso del JWT para la autorización en el middleware del WebSocket
                const token = await getAccessTokenSilently();
                const nuevaConexion = conectarSocket(token);
                
                socketRef.current = nuevaConexion;
                setSocket(nuevaConexion);
            } catch (error) {
                console.error("Fallo al inicializar WebSocket u obtener JWT:", error);
            }
        };

        inicializarPanel();

        // Cleanup: Desconexión explícita y liberación de la referencia al desmontar el componente
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [isAuthenticated, getAccessTokenSilently]);

    // UI: Fallback durante la resolución del estado de autenticación
    if (isLoading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando sistema...</div>;
    }

    // View: Unauthenticated
    if (!isAuthenticated) {
        return (
            <div className="login-wrapper">
                <div className="login-tarjeta">
                    <h1 className="login-titulo">Monitoreo IoT</h1>
                    <p className="login-subtitulo">
                        Plataforma centralizada para el análisis y gestión de métricas de energía en tiempo real.
                    </p>
                    <button
                        className="boton-login"
                        onClick={() => loginWithRedirect()}
                    >
                        Acceder al Sistema
                    </button>
                </div>
            </div>
        );
    }

    // View: Authenticated Dashboard
    return (
        <div className="contenedor-dashboard">
            <header className="cabecera-principal">
                <h1>Monitoreo Energía IoT</h1>
                <div>
                    <span style={{ marginRight: '20px', color: '#4a5568', fontSize: '0.95rem' }}>
                        Usuario: <strong>{user?.email}</strong>
                    </span>
                    <button className="boton-logout" onClick={() => logout({ returnTo: window.location.origin })}>
                        Cerrar Sesión
                    </button>
                </div>
            </header>
            
            <main className="seccion-graficas">
                {/* Columna Principal (75%) */}
                <div className="columna-principal">
                    <section className="tarjeta-grafica">
                        <h2 className="titulo-tarjeta">Potencia en Tiempo Real (W)</h2>
                        <div className="contenedor-canvas-linea">
                            {socket ? <GraficaTiempoReal socket={socket} /> : <p className="texto-estado">Conectando sensores...</p>}
                        </div>
                    </section>

                    <section className="tarjeta-grafica">
                        <h2 className="titulo-tarjeta">Histórico de Generación (Últimos 7 días)</h2>
                        <div className="contenedor-canvas-linea">
                            <GraficaBarrasHistorica />
                        </div>
                    </section>
                </div>
                
                {/* Columna Lateral (25%) */}
                <div>
                    <section className="tarjeta-grafica">
                        <h2 className="titulo-tarjeta">Distribución por Nodo</h2>
                        <GraficaDonaNodos />
                    </section>
                </div>
            </main>

            {/* Nueva sección: Tabla de logs a ancho completo */}
            <TablaLogsAvanzada />
        </div>
    );
}

export default App;