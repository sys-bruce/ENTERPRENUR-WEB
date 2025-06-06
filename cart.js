// Cart JavaScript for ElectroHub Kenya

document.addEventListener('DOMContentLoaded', function() {
    loadCartItems();
    setupEventListeners();
});

function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const cartTotalElement = document.getElementById('cart-total');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added anything to your cart yet</p>
                <a href="index.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        document.querySelector('.cart-summary').style.display = 'none';
        return;
    }

    cartItemsContainer.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-product">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <h4>${item.name}</h4>
                </div>
            </div>
            <div class="price">KSh ${item.price.toLocaleString()}</div>
            <div class="quantity">
                <div class="quantity-selector">
                    <button class="decrease" data-id="${item.id}">-</button>
                    <input type="number" value="${item.quantity}" min="1" data-id="${item.id}">
                    <button class="increase" data-id="${item.id}">+</button>
                </div>
            </div>
            <div class="total">KSh ${itemTotal.toLocaleString()}</div>
            <div class="action">
                <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash"></i></button>
            </div>
        `;

        cartItemsContainer.appendChild(cartItem);
    });

    // Calculate totals
    const delivery = parseInt(document.getElementById('delivery-option').value);
    const total = subtotal + delivery;

    subtotalElement.textContent = `KSh ${subtotal.toLocaleString()}`;
    cartTotalElement.textContent = `KSh ${total.toLocaleString()}`;
}

function setupEventListeners() {
    // Quantity changes
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('increase')) {
            updateQuantity(e.target.dataset.id, 1);
        } else if (e.target.classList.contains('decrease')) {
            updateQuantity(e.target.dataset.id, -1);
        } else if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
            const button = e.target.classList.contains('remove-item') ? e.target : e.target.closest('.remove-item');
            removeItem(button.dataset.id);
        }
    });

    // Input changes
    document.addEventListener('change', function(e) {
        if (e.target.tagName === 'INPUT' && e.target.closest('.quantity-selector')) {
            const newQuantity = parseInt(e.target.value);
            if (!isNaN(newQuantity) && newQuantity > 0) {
                updateQuantity(e.target.dataset.id, newQuantity, true);
            } else {
                e.target.value = 1;
            }
        }
    });

    // Delivery option change
    document.getElementById('delivery-option').addEventListener('change', updateCartTotal);

    // Clear cart
    document.getElementById('clear-cart').addEventListener('click', function() {
        if (confirm('Are you sure you want to clear your cart?')) {
            localStorage.removeItem('cart');
            loadCartItems();
            updateCartCount();
        }
    });
}

function updateQuantity(productId, change, absolute = false) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id == productId);

    if (itemIndex !== -1) {
        if (absolute) {
            cart[itemIndex].quantity = change;
        } else {
            cart[itemIndex].quantity += change;
        }

        // Remove if quantity is 0 or less
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        loadCartItems();
        updateCartCount();
    }
}

function removeItem(productId) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const newCart = cart.filter(item => item.id != productId);

    localStorage.setItem('cart', JSON.stringify(newCart));
    loadCartItems();
    updateCartCount();
}

function updateCartTotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = parseInt(document.getElementById('delivery-option').value);
    const total = subtotal + delivery;

    document.getElementById('cart-total').textContent = `KSh ${total.toLocaleString()}`;
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    // Update cart count in header
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
    });
}