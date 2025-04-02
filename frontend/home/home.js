function canteen()
{
    window.location.href = "/frontend/canteen/index.html";
}

function lostandfound()
{
    window.location.href = "/frontend/lost_and_found/index.html";
}

function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = 'http://localhost:3001/';
}
