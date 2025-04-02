function canteen()
{
    window.location.href = "/canteen/index.html";
}

function lostandfound()
{
    window.location.href = "/lost_and_found/index.html";
}

function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = 'http://localhost:3001/';
}
