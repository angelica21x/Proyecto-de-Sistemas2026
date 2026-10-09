import {api} from '../utils/api.js';

export const getUsersList = async () => {
    const container = document.getElementById('userTableList');
    container.innerHTML = '<tr><td>Cargando...</td></tr>'; // Limpiar el contenido existente
    try {
        const users = await api.get('usuarios');
        container.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.rol}</td>
            </tr>
        `).join('');
    } catch (error) {
        container.innerHTML = '<tr><td>Error al cargar los usuarios</td></tr>';
    };
};
