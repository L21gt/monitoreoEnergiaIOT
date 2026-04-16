// src/App.jsx
import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { conectarSocket } from './services/socket';
import GraficaTiempoReal from './components/GraficaTiempoReal';
import './styles/dashboard.css';

/**
 * Componente raiz que gestiona el estado global de la conexion
 * y protege la vista principal mediante Auth0.
 */
function App() {
    const { isAuthenticated, loginWithRedirect, logout, getAccessTokenSilently, user, isLoading } = useAuth0();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const inicializarPanel = async () => {
            if (isAuthenticated) {
                try {
                    // Obtenemos el JWT de forma silenciosa para el handshake del socket
                    const token = await getAccessTokenSilently();
                    const nuevaConexion = conectarSocket(token);
                    setSocket(nuevaConexion);
                } catch (error) {
                    console.error("Error al obtener el token o conectar socket:", error);
                }
            }
        };

        inicializarPanel();

        // Limpieza de la conexion al desmontar el componente
        return () => {
            if (socket) socket.disconnect();
        };
    }, [isAuthenticated, getAccessTokenSilently, socket]);

    if (isLoading) return <div className="cargando">Cargando sistema...</div>;

    return (
        <div className="contenedor-dashboard">
            <header className="cabecera-principal">
                <h1>Monitoreo Energía IoT</h1>
                <div className="usuario-info">
                    {isAuthenticated ? (
                        <>
                            <span>Bienvenido, <strong>{user.name}</strong></span>
                            <button className="boton-logout" onClick={() => logout()}>Cerrar Sesión</button>
                        </>
                    ) : (
                        <button className="boton-login" onClick={() => loginWithRedirect()}>Iniciar Sesión</button>
                    )}
                </div>
            </header>

            {isAuthenticated ? (
                <main className="seccion-graficas">
                    {/* Componente de la grafica de linea solicitado en los requerimientos */}
                    <GraficaTiempoReal socket={socket} />
                    
                    {/* Aqui agregaremos las siguientes graficas en el proximo paso */}
                    <div className="tarjeta-grafica">
                        <h3 className="titulo-tarjeta">Estado de Nodos</h3>
                        <p>Próximamente: Gráfica de Dona</p>
                    </div>
                </main>
            ) : (
                <div className="mensaje-bienvenida">
                    <h2>Acceso Restringido</h2>
                    <p>Por favor, inicia sesión para visualizar el Dashboard de energía en tiempo real.</p>
                </div>
            )}
        </div>
    );
}

export default App;