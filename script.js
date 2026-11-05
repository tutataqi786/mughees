
// MUGHEES PRODUCTS

const products = [
    {
        id: 1,
        name: "Luxury Smart Watch",
        category: "Watches",
        price: 2500,
        image: "images/images.jpg"


    },
    {
        id: 2,
        name: "Premium Black Glasses",
        category: "Glasses",
        price: 1500,
        image: "images/glasss blk.jpg"
    },
    {
        id: 3,
        name: "Golden Fashion Ring",
        category: "Rings",
        price: 500,
        image: "images/images (4).jpg"
    },
    {
        id: 4,
        name: "Luxury Bracelet",
        category: "Bracelets",
        price: 3200,
        image: "images/images (6).jpg"
    },
    {
        id: 5,
        name: "Classic Silver Watch",
        category: "Watches",
        price: 6500,
        image: "images/images (1).jpg"
    },
    {
        id: 6,
        name: "Modern Sunglasses",
        category: "Glasses",
        price: 3800,
        image: "images/sun.jpg"
    },
    {
        id: 7,
        name: "Silver Ring",
        category: "Rings",
        price: 1800,
        image: "images/images (5).jpg"
    },
    {
        id: 8,
        name: "Stylish Bracelet",
        category: "Bracelets",
        price: 2900,
        image: "images/images (7).jpg"
    }
];

let cart = JSON.parse(localStorage.getItem("mugheesCart")) || [];
let currentCategory = "All";

// SHOW PRODUCTS

function displayProducts(list) {
    const productList = document.getElementById("product-list");

    productList.innerHTML = "";

    if (list.length === 0) {
        productList.innerHTML = "<p>No products found.</p>";
        return;
    }

    list.forEach(product => {
        productList.innerHTML += `
            <div class="product-card">
                <img src="${product.image}"
                     alt="${product.name}"
                     onerror="this.src='https://placehold.co/500x400/f0ece4/333?text=MUGHEES'">

                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>Rs. ${product.price.toLocaleString("en-PK")}</p>
                    <button onclick="addToCart(${product.id})">
                        ADD TO CART
                    </button>
                </div>
            </div>
        `;
    });
}

// FILTER PRODUCTS

function filterProducts(category) {
    currentCategory = category;

    const filtered = category === "All"
        ? products
        : products.filter(p => p.category === category);

    displayProducts(filtered);
}

// SEARCH PRODUCTS

document.getElementById("search").addEventListener("input", function () {
    const searchText = this.value.toLowerCase();

    const filtered = products.filter(product => {
        const matchesCategory =
            currentCategory === "All" ||
            product.category === currentCategory;

        const matchesSearch =
            product.name.toLowerCase().includes(searchText) ||
            product.category.toLowerCase().includes(searchText);

        return matchesCategory && matchesSearch;
    });

    displayProducts(filtered);
});

// ADD TO CART

function addToCart(id) {
    const product = products.find(p => p.id === id);

    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();

    alert(product.name + " added to your cart!");
}

// SAVE CART

function saveCart() {
    localStorage.setItem("mugheesCart", JSON.stringify(cart));

    document.getElementById("cart-count").textContent =
        cart.reduce((total, item) => total + item.quantity, 0);
}

// CART TOTAL

function getTotal() {
    return cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );
}

// OPEN CART

function openCart() {
    showCartItems();
    document.getElementById("cart-overlay").style.display = "flex";
}

// CLOSE CART

function closeCart() {
    document.getElementById("cart-overlay").style.display = "none";
}

// SHOW CART ITEMS

function showCartItems() {
    const cartItems = document.getElementById("cart-items");

    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
    }

    cart.forEach(item => {
        cartItems.innerHTML += `
            <div class="cart-row">
                <div>
                    <strong>${item.name}</strong>
                    <p>Rs. ${item.price.toLocaleString("en-PK")}</p>
                </div>

                <div>
                    <button onclick="changeQuantity(${item.id}, -1)">−</button>
                    ${item.quantity}
                    <button onclick="changeQuantity(${item.id}, 1)">+</button>
                    <button onclick="removeItem(${item.id})">Remove</button>
                </div>
            </div>
        `;
    });

    document.getElementById("cart-total").textContent =
        getTotal().toLocaleString("en-PK");
}

// CHANGE QUANTITY

function changeQuantity(id, amount) {
    const item = cart.find(p => p.id === id);

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        cart = cart.filter(p => p.id !== id);
    }

    saveCart();
    showCartItems();
}

// REMOVE ITEM

function removeItem(id) {
    cart = cart.filter(p => p.id !== id);

    saveCart();
    showCartItems();
}

// CHECKOUT

function goCheckout() {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    closeCart();

    document.getElementById("checkout-summary").textContent =
        "Your Total: Rs. " + getTotal().toLocaleString("en-PK");

    document.getElementById("checkout-overlay").style.display = "flex";
}

function closeCheckout() {
    document.getElementById("checkout-overlay").style.display = "none";
}

// PLACE ORDER - FRONTEND DEMO ONLY

document.getElementById("checkout-form").addEventListener("submit", function (e) {
    e.preventDefault();

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const formData = new FormData(this);

    const order = {
        orderNumber: "MUG" + Date.now(),
        customer: {
            name: formData.get("name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            city: formData.get("city"),
            address: formData.get("address")
        },
        payment: formData.get("payment"),
        products: cart,
        total: getTotal(),
        date: new Date().toLocaleString()
    };

    // Browser demo storage, not a real server order
    const orders = JSON.parse(localStorage.getItem("mugheesOrders")) || [];

    orders.push(order);

    localStorage.setItem("mugheesOrders", JSON.stringify(orders));

    alert(
        "Demo order saved!\nOrder Number: " +
        order.orderNumber +
        "\nTotal: Rs. " +
        order.total.toLocaleString("en-PK")
    );

    cart = [];
    saveCart();
    this.reset();
    closeCheckout();
});

// CUSTOMER LOGIN DEMO

function showLogin() {
    document.getElementById("login-overlay").style.display = "flex";
}

function closeLogin() {
    document.getElementById("login-overlay").style.display = "none";
}

function showSignup() {
    closeLogin();
    document.getElementById("signup-overlay").style.display = "flex";
}

function closeSignup() {
    document.getElementById("signup-overlay").style.display = "none";
}

// Demo login only - not secure authentication

document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault();

    alert("Customer login requires the backend authentication system.");

    closeLogin();
});

document.getElementById("signup-form").addEventListener("submit", function (e) {
    e.preventDefault();

    alert("Customer signup requires the backend authentication system.");

    closeSignup();
});

// INITIAL PAGE LOAD

displayProducts(products);
saveCart();
