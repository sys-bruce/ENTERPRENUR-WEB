// Search JavaScript for ElectroHub Kenya

document.addEventListener('DOMContentLoaded', function() {
    // Get search query from URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');

    if (searchQuery) {
        document.getElementById('search-query').textContent = searchQuery;
        document.getElementById('search-input').value = searchQuery;
        performSearch(searchQuery);
    } else {
        window.location.href = 'index.html';
    }

    // Set up filter event listeners
    document.getElementById('category-filter').addEventListener('change', function() {
        performSearch(document.getElementById('search-input').value);
    });

    document.getElementById('price-filter').addEventListener('change', function() {
        performSearch(document.getElementById('search-input').value);
    });

    document.getElementById('sort-by').addEventListener('change', function() {
        performSearch(document.getElementById('search-input').value);
    });
});

async function performSearch(query) {
    try {
        const response = await fetch('products.json');
        const data = await response.json();

        // Get filters
        const categoryFilter = document.getElementById('category-filter').value;
        const priceFilter = document.getElementById('price-filter').value;
        const sortBy = document.getElementById('sort-by').value;

        // Flatten all products
        let allProducts = [];
        Object.entries(data.products).forEach(([category, subcategories]) => {
            Object.entries(subcategories).forEach(([subcategory, products]) => {
                products.forEach(product => {
                    product.category = category;
                    product.subcategory = subcategory;
                    allProducts.push(product);
                });
            });
        });

        // Filter by search query
        let results = allProducts.filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
        );

        // Apply category filter
        if (categoryFilter !== 'all') {
            results = results.filter(product => product.category === categoryFilter);
        }

        // Apply price filter
        if (priceFilter !== 'all') {
            const [min, max] = priceFilter.split('-').map(Number);
            if (max) {
                results = results.filter(product => product.price >= min && product.price <= max);
            } else {
                results = results.filter(product => product.price >= min);
            }
        }

        // Apply sorting
        switch (sortBy) {
            case 'price-low':
                results.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                results.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                // Assuming products have a dateAdded property
                results.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                break;
            default:
                // Default is relevance (already sorted by search relevance)
                break;
        }

        displaySearchResults(results);

    } catch (error) {
        console.error('Error performing search:', error);
        document.getElementById('search-results').innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error loading search results</h3>
                <p>Please try again later</p>
            </div>
        `;
    }
}

function displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results');
    const resultsCount = document.getElementById('results-count');

    resultsCount.textContent = `${results.length} ${results.length === 1 ? 'result' : 'results'} found`;

    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No products found</h3>
                <p>Try different keywords or browse our categories</p>
                <a href="index.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        return;
    }

    resultsContainer.innerHTML = '';

    results.forEach(product => {
        const productEl = document.createElement('div');
        productEl.className = 'product-card';
        productEl.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-category">${product.category.replace('_', ' ')} • ${product.subcategory}</p>
                <div class="product-price">
                    <span class="current-price">KSh ${product.price.toLocaleString()}</span>
                    ${product.oldPrice ? `<span class="old-price">KSh ${product.oldPrice.toLocaleString()}</span>` : ''}
                </div>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
        resultsContainer.appendChild(productEl);
    });

    // Add event listeners to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            const productId = e.target.getAttribute('data-id');
            const productCard = e.target.closest('.product-card');
            const productName = productCard.querySelector('.product-title').textContent;
            const productPrice = parseFloat(productCard.querySelector('.current-price').textContent.replace('KSh ', '').replace(/,/g, ''));
            const productImage = productCard.querySelector('img').src;

            let cart = JSON.parse(localStorage.getItem('cart')) || [];

            const existingItem = cart.find(item => item.id == productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: 1
                });
            }

            localStorage.setItem('cart', JSON.stringify(cart));

            // Update cart count
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            document.querySelectorAll('.cart-count').forEach(el => {
                el.textContent = totalItems;
            });

            // Show notification
            const notification = document.createElement('div');
            notification.className = 'cart-notification';
            notification.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>${productName} added to cart!</span>
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
        });
    });
}