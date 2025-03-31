// Initialize Supabase Client
const supabase = window.supabase.createClient(
    'https://dtholcvwoxinthslvryl.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aG9sY3Z3b3hpbnRoc2x2cnlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NDg2MzAsImV4cCI6MjA1ODIyNDYzMH0.WDaT0GKsIizIxjR2fizvaoCaMGS9ZHmcUwX_aLOWKLQ'
);

// Utility Functions
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Fetch and Display Items
async function displayItems(type) {
    const table = type === 'lost' ? 'lost_items' : 'found_items';
    
    // Get filter values
    const categoryFilter = document.getElementById(`${type}-category`).value;
    const dateFilter = document.getElementById(`${type}-date`).value;
    const searchInput = document.getElementById(`${type}-search`).value.toLowerCase();

    // Build Supabase query
    let query = supabase.from(table).select('*');

    // Apply category filter
    if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
    }

    // Apply date filter
    if (dateFilter && dateFilter !== 'all') {
        const now = new Date();
        let dateThreshold;
        switch (dateFilter) {
            case '24h':
                dateThreshold = new Date(now - 24 * 60 * 60 * 1000);
                break;
            case 'week':
                dateThreshold = new Date(now - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                dateThreshold = new Date(now - 30 * 24 * 60 * 60 * 1000);
                break;
        }
        const dateField = type === 'lost' ? 'date_lost' : 'date_found';
        query = query.gte(dateField, dateThreshold.toISOString().split('T')[0]);
    }

    // Fetch data
    const { data, error } = await query;
    if (error) {
        console.error(`Error fetching ${table}:`, error);
        return;
    }

    // Apply search filter client-side
    let items = data;
    if (searchInput) {
        items = items.filter(item =>
            (item.item_name || '').toLowerCase().includes(searchInput) ||
            (item.description || '').toLowerCase().includes(searchInput)
        );
    }

    // Display items
    const grid = document.querySelector(`#${type}-section .items-grid`);
    grid.innerHTML = '';
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <h3>${item.item_name || 'Unnamed'}</h3>
            <p>Category: ${item.category || 'N/A'}</p>
            <p>Date ${type === 'lost' ? 'Lost' : 'Found'}: ${type === 'lost' ? item.date_lost || 'N/A' : item.date_found || 'N/A'}</p>
            <p>Location: ${item.location || 'N/A'}</p>
            <p>Description: ${item.description || 'No description'}</p>
            <p>Contact: ${item.contact_email || 'N/A'}</p>
            ${item.image_url ? `<img src="${item.image_url}" alt="${item.item_name || 'Image'}" style="max-width:100%;">` : ''}
        `;
        grid.appendChild(card);
    });
}

// Update Display When Filters Change
function updateDisplay(type) {
    if (document.getElementById(`${type}-section`).style.display === 'block') {
        displayItems(type);
    }
}

// Navigation Event Listeners
document.querySelectorAll('[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('data-section');
        showSection(`${section}-section`);
        if (section === 'lost' || section === 'found') {
            displayItems(section);
        }
    });
});

// Filter Event Listeners
['lost', 'found'].forEach(type => {
    document.getElementById(`${type}-category`).addEventListener('change', () => updateDisplay(type));
    document.getElementById(`${type}-date`).addEventListener('change', () => updateDisplay(type));
    document.getElementById(`${type}-search`).addEventListener('input', () => updateDisplay(type));
});

// Modal Event Listeners
document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        showModal(btn.getAttribute('data-modal') + '-modal');
    });
});

document.querySelectorAll('.close-btn, .cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        hideModal(modal.id);
    });
});

// Form Submissions
document.getElementById('lost-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const item = {
        item_name: formData.get('name'),
        category: formData.get('category'),
        date_lost: formData.get('date'),
        location: formData.get('location'),
        description: formData.get('description'),
        contact_email: formData.get('email'),
        image_url: formData.get('image') || null,
        status: 'Lost'
    };
    const { error } = await supabase.from('lost_items').insert([item]);
    if (error) {
        console.error('Error reporting lost item:', error);
        alert('Failed to report item.');
    } else {
        alert('Lost item reported successfully!');
        hideModal('report-lost-modal');
        if (document.getElementById('lost-section').style.display === 'block') displayItems('lost');
    }
});

document.getElementById('found-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const item = {
        item_name: formData.get('name'),
        category: formData.get('category'),
        date_found: formData.get('date'),
        location: formData.get('location'),
        description: formData.get('description'),
        contact_email: formData.get('email'),
        image_url: formData.get('image') || null,
        status: 'Found'
    };
    const { error } = await supabase.from('found_items').insert([item]);
    if (error) {
        console.error('Error reporting found item:', error);
        alert('Failed to report item.');
    } else {
        alert('Found item reported successfully!');
        hideModal('report-found-modal');
        if (document.getElementById('found-section').style.display === 'block') displayItems('found');
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    showSection('home-section');
});