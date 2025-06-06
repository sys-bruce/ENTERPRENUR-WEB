// Main JavaScript for ElectroHub Kenya

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Load featured products
    loadFeaturedProducts();

    // Initialize cart count
    updateCartCount();

    // Hero slider functionality
    initHeroSlider();
});

// Load Featured Products
async function loadFeaturedProducts() {
    try {
        const response = await fetch('products.json');
        const data = await response.json();
        const featuredContainer = document.getElementById('featured-products');

        // Get 8 random featured products
        const allProducts = [];
        Object.values(data.products).forEach(category => {
            Object.values(category).forEach(products => {
                allProducts.push(...products);
            });
        });

        const shuffled = allProducts.sort(() => 0.5 - Math.random());
        const featured = shuffled.slice(0, 8);

        // Display products
        featured.forEach(product => {
            const productEl = document.createElement('div');
            productEl.className = 'product-card';
            productEl.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">
                        <span class="current-price">KSh ${product.price.toLocaleString()}</span>
                        ${product.oldPrice ? `<span class="old-price">KSh ${product.oldPrice.toLocaleString()}</span>` : ''}
                    </div>
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            `;
            featuredContainer.appendChild(productEl);
        });

        // Add event listeners to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', addToCart);
        });

    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Add to Cart Function
function addToCart(e) {
    const productId = e.target.getAttribute('data-id');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if product already in cart
    const existingItem = cart.find(item => item.id == productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Get product details from the card
        const productCard = e.target.closest('.product-card');
        const productName = productCard.querySelector('.product-title').textContent;
        const productPrice = parseFloat(productCard.querySelector('.current-price').textContent.replace('KSh ', '').replace(/,/g, ''));
        const productImage = productCard.querySelector('img').src;

        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showCartNotification('Item added to cart!');
}

// Update Cart Count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    // Update cart count in header
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
    });
}

// Show Cart Notification
function showCartNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize Hero Slider
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length > 1) {
        let currentSlide = 0;
        slides[0].classList.add('active');

        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            slides[index].classList.add('active');
            currentSlide = index;
        }

        function nextSlide() {
            const nextIndex = (currentSlide + 1) % slides.length;
            showSlide(nextIndex);
        }

        // Change slide every 5 seconds
        setInterval(nextSlide, 5000);
    }
}

// Add styles for cart notification
const style = document.createElement('style');
style.textContent = `
.cart-notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: var(--accent);
    color: white;
    padding: 15px 20px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    box-shadow: var(--box-shadow);
    transform: translateX(150%);
    transition: transform 0.3s ease;
    z-index: 1000;
}

.cart-notification.show {
    transform: translateX(0);
}

.cart-notification i {
    margin-right: 10px;
    font-size: 1.2rem;
}
`;
document.head.appendChild(style);