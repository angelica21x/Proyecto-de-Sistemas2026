import {getUsersList} from './components/UserList.js';

const app = document.getElementById('app');
const views = {
    home: async () => {
        const res = await fetch('./src/views/home.html');
        app.innerHTML = await res.text();
        await getUsersList();
    },
}
// function to handle navigation
document.querySelectorAll('data-view').forEach(link => {
    link.addEventListener('click', async (event) => {
        event.preventDefault();
        const view = link.dataset.view;
        if (views[view]) {
            await views[view]();
        }
    });
});
views.home(); // Load the home view by default
