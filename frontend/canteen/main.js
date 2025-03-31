async function fetchMenuData() {
    try {
        const response = await fetch('http://localhost:3000/menu');
        const menuData = await response.json();
        return menuData;
    } catch (error) {
        console.error('Error fetching menu data:', error);
        return [];
    }
}

function createMenuItem(item) {
    const availabilityClass = item.quantity > 0 ? 'available' : 'unavailable';
    const availabilityText = item.quantity > 0 ? `Quantity: ${item.quantity}` : 'Out of Stock';
    
    return `
        <div class="menu-item ${availabilityClass}">
            <img src="${item.image}" alt="${item.name}">
            <div class="menu-item-content">
                <h3>${item.name}</h3>
                <p class="price">${item.price}</p>
                <span class="availability-badge">${availabilityText}</span>
            </div>
        </div>
    `;
}

function populateMenuSection(sectionId, items) {
    const grid = document.getElementById(`${sectionId}-grid`);
    grid.innerHTML = items.map(item => createMenuItem(item)).join('');
}

async function populateMenu() {
    const menuData = await fetchMenuData();
    console.log(menuData);
    menuData.forEach(section => {
        populateMenuSection(section.category, section.items);
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Populate all menu sections
populateMenu();

async function ordercake() {
    const consumer = document.getElementById('name_oncake').value;
    const flavour = document.getElementById('flavour').value;
    const quantity = document.getElementById('quantity').value;

    try {
        const response = await fetch('http://localhost:3000/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ consumer, flavour, quantity })
        });

        if (response.ok) {
            alert('Order placed successfully');
        } else {
            const data = await response.json();
            alert('Error placing order: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while placing the order');
    }
}

// Ensure the function is available in the global scope
window.ordercake = ordercake;

async function updateDropdowns() {
    const menuData = await fetchMenuData();
    for (const section of menuData) {
        const dropdown = document.getElementById(`${section.category}-dropdown`);
        if (dropdown) {
            dropdown.innerHTML = ''; // Clear existing items
            section.items.forEach(item => {
                const li = document.createElement("li");
                li.textContent = item.name; // Use item name from fetched data
                dropdown.appendChild(li);
            });
        }
    }
}

// Call the function to update dropdowns after fetching data
updateDropdowns();

function searchItems() {
    const query = document.getElementById("search-input").value.toLowerCase().trim();
    if (!query) {
        alert("Please enter a search term.");
        return;
    }

    const sections = document.querySelectorAll(".menu-section");
    let found = false;

    // Search in section titles
    sections.forEach(section => {
        const sectionTitle = section.querySelector("h2").textContent.toLowerCase();
        if (sectionTitle.includes(query)) {
            section.scrollIntoView({ behavior: "smooth" });
            found = true;
        }
    });

    // Search in product names
    const menuItems = document.querySelectorAll(".menu-item-content h3");
    menuItems.forEach(item => {
        const itemName = item.textContent.toLowerCase();
        if (itemName.includes(query)) {
            item.closest(".menu-item").scrollIntoView({ behavior: "smooth" });
            found = true;
        }
    });

    if (!found) {
        alert("No matching section or item found.");
    }
}

// Ensure menu sections are populated before enabling search
populateMenu().then(() => {
    console.log("Menu populated. Search is ready.");
    document.getElementById("search-button").addEventListener("click", () => {
        searchItems();
    });
});