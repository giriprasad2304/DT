function canteen()
{
    window.location.href = "/frontend/canteen/canteen.html";
}

function lostandfound()
{
    window.location.href = "/frontend/lost_and_found/lostnfound.html";
}

function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = 'http://localhost:3001/';
}