
const loginForm = document.getElementById("login-form");
const loginSection = document.getElementById("login-section");
const dashboard = document.getElementById("dashboard");
const message = document.getElementById("login-message");

const API = "/api";

// Check existing admin session
async function checkAdmin() {
    try {
        const response = await fetch(API + "/admin/check", {
            credentials: "include"
        });

        const result = await response.json();

        if (result.isAdmin) {
            showDashboard();
        }
    } catch (error) {
        console.log("Backend connection failed");
    }
}

// Admin Login
loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(API + "/admin/login", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Login failed");
        }

        message.textContent = "";
        showDashboard();

    } catch (error) {
        message.textContent = error.message;
    }
});

// Show Dashboard
function showDashboard() {
    loginSection.hidden = true;
    dashboard.hidden = false;
    loadOrders();
}

// Load Orders From Backend
async function loadOrders() {
    try {
        const response = await fetch(API + "/admin/orders", {
            credentials: "include"
        });

        if (response.status === 401) {
            dashboard.hidden = true;
            loginSection.hidden = false;
            return;
        }

        if (!response.ok) {
            throw new Error("Could not load orders");
        }

        const orders = await response.json();

        displayOrders(orders);

    } catch (error) {
        document.getElementById("orders-list").innerHTML =
            `<tr><td colspan="7">${error.message}</td></tr>`;
    }
}

// Display Orders
function displayOrders(orders) {
    const list = document.getElementById("orders-list");

    let pending = 0;
    let revenue = 0;

    document.getElementById("total-orders").textContent = orders.length;

    if (orders.length === 0) {
        list.innerHTML = `<tr><td colspan="7">No orders yet</td></tr>`;
    } else {
        list.innerHTML = orders.map(order => {
            if (order.status === "Pending") pending++;
            if (order.status === "Delivered") revenue += Number(order.total);

            const products = (order.items || [])
                .map(item => `${item.name} x ${item.quantity}`)
                .join(", ");

            return `
                <tr>
                    <td>${escapeHTML(String(order.id))}</td>
                    <td>${escapeHTML(order.customer_name)}</td>
                    <td>${escapeHTML(order.phone)}</td>
                    <td>${escapeHTML(products)}</td>
                    <td>Rs. ${Number(order.total).toLocaleString("en-PK")}</td>
                    <td>${escapeHTML(order.address)}</td>
                    <td>
                        <select onchange="updateStatus(${Number(order.id)}, this.value)">
                            ${["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"]
                    .map(status => `
                                    <option value="${status}" ${order.status === status ? "selected" : ""}>
                                        ${status}
                                    </option>
                                `).join("")}
                        </select>
                    </td>
                </tr>
            `;
        }).join("");
    }

    document.getElementById("pending-orders").textContent = pending;
    document.getElementById("total-revenue").textContent =
        "Rs. " + revenue.toLocaleString("en-PK");
}

// Safe text display
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Update Order Status
async function updateStatus(id, status) {
    try {
        const response = await fetch(API + "/admin/orders/" + id + "/status", {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            throw new Error("Status update failed");
        }

        alert("Order status updated!");
        loadOrders();

    } catch (error) {
        alert(error.message);
        loadOrders();
    }
}

// Admin Logout
document.getElementById("logout").addEventListener("click", async () => {
    await fetch(API + "/admin/logout", {
        method: "POST",
        credentials: "include"
    });

    dashboard.hidden = true;
    loginSection.hidden = false;
});

// Start
checkAdmin();
