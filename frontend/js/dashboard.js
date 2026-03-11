document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});
 
const payload = JSON.parse(atob(token.split('.')[1]));

if (payload.role !== 'agriculteur') {
    window.location.href = 'catalog.html';
}
