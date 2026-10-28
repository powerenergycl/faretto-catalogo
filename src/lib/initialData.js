import { createContext, useContext } from 'react';

// Datos que el servidor ya cargo para renderizar la pagina (ver server.js):
// se inyectan en window.__FARETTO_DATA__ y el primer render del navegador
// los usa en vez de volver a pedirlos (sin parpadeo de "Cargando…").
// Solo valen para la pagina con la que se entro al sitio; al navegar, cada
// pagina vuelve a pedir lo suyo como siempre.
export const InitialDataContext = createContext({});

export function useInitialData(key) {
  return useContext(InitialDataContext)[key];
}
