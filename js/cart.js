/**
 * ZenPlay Shopping Cart Logic
 * Uses localStorage to persist cart data without requiring login.
 */

document.addEventListener('DOMContentLoaded', () => {
    initCart();
});

function initCart() {
    updateCartUI();
    setupEventListeners();
}

function setupEventListeners() {
    // Add to Cart buttons
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart-btn');
        if (btn) {
            e.preventDefault();
            const product = {
                id: btn.dataset.id,
                name: btn.dataset.name,
                price: parseFloat(btn.dataset.price),
                image: btn.dataset.image,
                quantity: 1
            };
            addToCart(product);
        }

        // Remove from cart (delegation)
        if (e.target.closest('.remove-item')) {
            e.preventDefault();
            const id = e.target.closest('.remove-item').dataset.id;
            removeFromCart(id);
        }

        // Quantity changes in cart page
        if (e.target.classList.contains('qty-input')) {
            const id = e.target.dataset.id;
            const qty = parseInt(e.target.value);
            updateQuantity(id, qty);
        }
    });
}

function getCart() {
    const cart = localStorage.getItem('zenplay_cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('zenplay_cart', JSON.stringify(cart));
    updateCartUI();
}

function addToCart(product) {
    let cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push(product);
    }

    saveCart(cart);

    // Show feedback (optional: could trigger the offcanvas cart)
    const offcanvasEl = document.getElementById('offcanvasCart');
    if (offcanvasEl) {
        const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
        bsOffcanvas.show();
    }
}

function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
}

function updateQuantity(id, qty) {
    if (qty < 1) return;
    let cart = getCart();
    const index = cart.findIndex(item => item.id === id);
    if (index > -1) {
        cart[index].quantity = qty;
        saveCart(cart);
    }
}

function updateCartUI() {
    const cart = getCart();
    const count = cart.reduce((acc, item) => acc + item.quantity, 0);
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Update navbar badges/counts
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = `(${count})`;
    });

    // Update Offcanvas Cart content
    renderOffcanvasCart(cart, total);

    // Update Full Cart Page (if exists)
    renderCartTable(cart, total);

    // Update Checkout Page (if exists)
    renderCheckoutPage(cart, total);
}

function renderOffcanvasCart(cart, total) {
    const container = document.querySelector('#offcanvasCart .offcanvas-body .order-md-last');
    if (!container) return;

    let html = `
        <h4 class="d-flex justify-content-between align-items-center mb-3">
            <span class="text-primary">Your cart</span>
            <span class="badge bg-primary rounded-pill">${cart.length}</span>
        </h4>
        <ul class="list-group mb-3">
    `;

    if (cart.length === 0) {
        html += '<li class="list-group-item">Your cart is empty.</li>';
    } else {
        cart.forEach(item => {
            html += `
                <li class="list-group-item d-flex justify-content-between lh-sm">
                    <div>
                        <h6 class="my-0">${item.name}</h6>
                        <small class="text-body-secondary">Qty: ${item.quantity}</small>
                    </div>
                    <span class="text-body-secondary">KSH ${(item.price * item.quantity).toLocaleString()}</span>
                    <a href="#" class="remove-item ms-2" data-id="${item.id}">×</a>
                </li>
            `;
        });
    }

    html += `
            <li class="list-group-item d-flex justify-content-between">
                <span>Total (KSH)</span>
                <strong>KSH ${total.toLocaleString()}</strong>
            </li>
        </ul>
        <div class="d-grid gap-2">
            <a href="cart.html" class="btn btn-outline-dark btn-lg">View Full Cart</a>
            <a href="checkout.html" class="btn btn-dark btn-lg">Proceed to Checkout</a>
        </div>
    `;

    container.innerHTML = html;
}

function renderCartTable(cart, total) {
    const tableBody = document.querySelector('#cart-content tbody');
    if (!tableBody) return;

    if (cart.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-5">Your cart is empty. <a href="shop.html">Go Shopping</a></td></tr>';
        updateSummary(0);
        return;
    }

    let html = '';
    cart.forEach(item => {
        html += `
            <tr class="border-bottom">
                <td class="py-4">
                    <div class="d-flex align-items-center">
                        <div class="img-wrapper me-3">
                            <img src="${item.image}" alt="${item.name}" class="img-fluid" style="width: 80px;">
                        </div>
                        <div class="product-info">
                            <h6 class="text-uppercase mb-0">${item.name}</h6>
                        </div>
                    </div>
                </td>
                <td class="py-4">KSH ${item.price.toLocaleString()}</td>
                <td class="py-4">
                    <input type="number" class="form-control text-center qty-input" data-id="${item.id}" value="${item.quantity}" style="width: 70px;">
                </td>
                <td class="py-4">KSH ${(item.price * item.quantity).toLocaleString()}</td>
                <td class="py-4 text-end">
                    <a href="#" class="remove-item text-secondary" data-id="${item.id}">
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <use xlink:href="#trash"></use>
                        </svg>
                    </a>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
    updateSummary(total);
}

function updateSummary(total) {
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');

    if (subtotalEl) subtotalEl.textContent = `KSH ${total.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `KSH ${total.toLocaleString()}`;

    // Fallback for older selectors if IDs don't exist
    if (!subtotalEl) {
        const fallbackSubtotal = document.querySelector('.cart-totals .h6.mb-0');
        if (fallbackSubtotal) fallbackSubtotal.textContent = `KSH ${total.toLocaleString()}`;
    }
    if (!totalEl) {
        const fallbackTotal = document.querySelector('.cart-totals .h5.mb-0');
        if (fallbackTotal) fallbackTotal.textContent = `KSH ${total.toLocaleString()}`;
    }
}

function renderCheckoutPage(cart, total) {
    const subtotalEl = document.getElementById('checkout-subtotal');
    const totalEl = document.getElementById('checkout-total');
    const summaryContainer = document.getElementById('checkout-summary');

    if (!summaryContainer) return;

    if (subtotalEl) subtotalEl.textContent = `KSH ${total.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `KSH ${total.toLocaleString()}`;

    // Optional: Render small list of items in the summary if we want more detail
    // For now we just update the totals as requested for a functional page
}
