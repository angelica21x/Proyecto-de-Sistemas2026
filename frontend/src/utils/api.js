const API_URL = 'http://www.sistemainventario.com';

export const api = {
    //Funcion para obtener datos de la API
    get: async (endpoint) => {
        try {
            const response = await fetch(`${API_URL}/${endpoint}`);
            if (!response.ok) {
                throw new Error(`error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error al obtener data:', error);
            throw error;
        }
    },

};
