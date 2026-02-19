/**
 * ZenPlay Admin Logic
 * Manages orders stored in localStorage
 */

// Simple Auth
const ADMIN_PASS = 'zenplay2024'; // In a real app, this would be handled server-side

function checkAdminPass() {
    const pass = $('#admin-pass').val();
    if (pass === ADMIN_PASS) {
        $('#login-gate').hide();
        $('#dashboard-layout').show();
        sessionStorage.setItem('zenplay_admin_logged', 'true');
        initAdmin();
    } else {
        $('#error-msg').show();
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('zenplay_admin_logged');
    location.reload();
}

// Auto-login check
$(document).ready(function () {
    if (sessionStorage.getItem('zenplay_admin_logged') === 'true') {
        $('#login-gate').hide();
        $('#dashboard-layout').show();
        initAdmin();
    }
});

function initAdmin() {
    const orders = getOrders();
    updateStats(orders);
    renderOrderTables(orders);
}

function getOrders() {
    const orders = localStorage.getItem('zenplay_orders');
    return orders ? JSON.parse(orders) : [];
}

function saveOrders(orders) {
    localStorage.setItem('zenplay_orders', JSON.stringify(orders));
    initAdmin();
}

function updateStats(orders) {
    const totalOrders = orders.length;
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    const pending = orders.filter(o => o.status === 'Pending').length;

    $('#stat-total-orders').text(totalOrders);
    $('#stat-total-revenue').text('$' + revenue.toFixed(2));
    $('#stat-pending-orders').text(pending);
}

function renderOrderTables(orders) {
    const recentTable = $('#recent-orders-table');
    const allTable = $('#all-orders-table');

    recentTable.empty();
    allTable.empty();

    // Sort by date (desc)
    const sortedOrders = [...orders].reverse();

    sortedOrders.forEach((order, index) => {
        const row = `
            <tr>
                <td><strong>${order.id}</strong></td>
                <td>${order.customer.firstName} ${order.customer.lastName}</td>
                <td>${order.date}</td>
                <td>$${order.total.toFixed(2)}</td>
                <td><span class="badge order-status-${order.status.toLowerCase()}">${order.status}</span></td>
                <td class="text-end">
                    <button class="btn btn-sm btn-dark" onclick="viewOrder('${order.id}')">View</button>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">Status</button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#" onclick="updateStatus('${order.id}', 'Pending')">Pending</a></li>
                            <li><a class="dropdown-item" href="#" onclick="updateStatus('${order.id}', 'Processed')">Processed</a></li>
                            <li><a class="dropdown-item" href="#" onclick="updateStatus('${order.id}', 'Completed')">Completed</a></li>
                        </ul>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteOrder('${order.id}')">Delete</button>
                </td>
            </tr>
        `;

        if (index < 5) recentTable.append(row);
        allTable.append(row);
    });
}

function updateStatus(orderId, newStatus) {
    let orders = getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index > -1) {
        orders[index].status = newStatus;
        saveOrders(orders);
    }
}

function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order?')) {
        let orders = getOrders();
        orders = orders.filter(o => o.id !== orderId);
        saveOrders(orders);
    }
}

function viewOrder(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    let itemsHtml = '<ul class="list-group mb-3">';
    order.items.forEach(item => {
        itemsHtml += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${item.name} x ${item.quantity}
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </li>
        `;
    });
    itemsHtml += '</ul>';

    const content = `
        <div class="row">
            <div class="col-md-6">
                <h6>Customer Details</h6>
                <p class="mb-1"><strong>Name:</strong> ${order.customer.firstName} ${order.customer.lastName}</p>
                <p class="mb-1"><strong>Email:</strong> ${order.customer.email}</p>
                <p class="mb-1"><strong>Phone:</strong> ${order.customer.phone}</p>
                <p class="mb-1"><strong>Address:</strong> ${order.customer.address}, ${order.customer.city}</p>
            </div>
            <div class="col-md-6">
                <h6>Order Info</h6>
                <p class="mb-1"><strong>ID:</strong> ${order.id}</p>
                <p class="mb-1"><strong>Date:</strong> ${order.date}</p>
                <p class="mb-1"><strong>Status:</strong> ${order.status}</p>
                <p class="mb-1"><strong>Notes:</strong> ${order.customer.notes || 'N/A'}</p>
            </div>
        </div>
        <hr>
        <h6>Order Items</h6>
        ${itemsHtml}
        <div class="text-end">
            <h5>Total: $${order.total.toFixed(2)}</h5>
        </div>
    `;

    $('#order-detail-content').html(content);
    const modal = new bootstrap.Modal(document.getElementById('orderModal'));
    modal.show();
}

function showSection(section) {
    $('.admin-sidebar .nav-link').removeClass('active');
    $(`.admin-sidebar .nav-link:contains("${section === 'dashboard' ? 'Dashboard' : 'Orders'}")`).addClass('active');

    if (section === 'dashboard') {
        $('#section-dashboard').show();
        $('#section-orders').hide();
    } else {
        $('#section-dashboard').hide();
        $('#section-orders').show();
    }
}
