
# API Documentation & React Integration Guide

Welcome to the QueueZen API\! This document provides all the necessary information to integrate your React application with the live API.

**Live API Base URL:** `https://my-queue-api.onrender.com`

-----

## 1\. The Authentication Flow (For Shopkeepers)

This API uses **JWT Bearer Tokens** to protect all shopkeeper-related routes. Your React application is responsible for managing this token.

**Here is the complete authentication flow:**

1.  **Register:** A new shopkeeper registers using the `POST /api/shopkeepers/register` endpoint.
2.  **Verify Email:** The API sends a verification link to their email. The shopkeeper must click this link to activate their account.
3.  **Login:** The shopkeeper logs in using `POST /api/shopkeepers/login` with their email and password.
4.  **Receive Token:** The API responds with an `access_token`.
5.  **Store Token:** Your React app must store this token in the browser's `localStorage`.
    ```javascript
    localStorage.setItem('accessToken', data.access_token);
    ```
6.  **Send Token:** For all protected requests (like getting shop info), your app must read this token from `localStorage` and add it to the request as an `Authorization` header.
7.  **Logout:** To log the user out, simply remove the token from `localStorage`.
    ```javascript
    localStorage.removeItem('accessToken');
    ```

-----

## 2\. Creating an API Service (`src/js/apiService.js`)

It is a best practice to keep all your API calls in one place. Create a new file in your React project at `src/js/apiService.js`. This module will manage all your `fetch` calls and automatically handle authentication.

```javascript
// The base URL of your live API
const API_BASE_URL = 'https://my-queue-api.onrender.com';

/**
 * A central helper function for all API calls.
 * It automatically adds the JWT token from localStorage.
 * It also handles standard errors and token expiration.
 */
const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('accessToken');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add the token to the header if it exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: headers,
    });

    // Handle token expiration or invalid token
    if (response.status === 401 && !endpoint.includes('/login')) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login'; // Redirect to login
        throw new Error('Session expired. Please log in again.');
    }

    const data = await response.json();

    if (!response.ok) {
        // Throw an error with the message from the API
        throw new Error(data.error || JSON.stringify(data));
    }

    return data;
};

// ===================================
// --- AUTH & REGISTRATION API ---
// ===================================

/**
 * Registers a new shopkeeper.
 */
export const registerShopkeeper = (fullName, email, password) => {
    return apiFetch('/api/shopkeepers/register', {
        method: 'POST',
        body: JSON.stringify({ full_name: fullName, email, password }),
    });
};

/**
 * Logs in a shopkeeper and returns an access token.
 */
export const loginShopkeeper = (email, password) => {
    return apiFetch('/api/shopkeepers/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
};

/**
 * Requests a password reset link for a shopkeeper.
 */
export const forgotPassword = (email) => {
    return apiFetch('/api/shopkeepers/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
};

// ===================================
// --- PROTECTED SHOPKEEPER API ---
// ===================================

/**
 * Gets a list of all shops owned by the logged-in shopkeeper.
 */
export const getMyShops = () => {
    return apiFetch('/api/my-shops');
};

/**
 * Creates a new shop for the logged-in shopkeeper.
 * @param {object} shopData - e.g., { shop_name, address, slot_capacity }
 */
export const createShop = (shopData) => {
    return apiFetch('/api/my-shops', {
        method: 'POST',
        body: JSON.stringify(shopData),
    });
};

/**
 * Updates a shop's details.
 * @param {number} shopId - The ID of the shop to update.
 * @param {object} shopData - The fields to update, e.g., { slot_capacity: 10 }
 */
export const updateShop = (shopId, shopData) => {
    return apiFetch(`/api/my-shops/${shopId}`, {
        method: 'PUT',
        body: JSON.stringify(shopData),
    });
};

/**
 * Gets all appointments for a specific shop, with pagination.
 * @param {number} shopId - The ID of the shop.
 */
export const getShopAppointments = (shopId) => {
    // You can add query params here, e.g., /api/my-shops/${shopId}/appointments?date=...
    return apiFetch(`/api/my-shops/${shopId}/appointments`);
};

/**
 * Gets daily analytics for a specific shop.
 * @param {number} shopId - The ID of the shop.
 */
export const getShopAnalytics = (shopId) => {
    return apiFetch(`/api/my-shops/${shopId}/analytics`);
};

/**
 * Deletes a customer's appointment.
 * @param {number} appointmentId - The ID of the appointment.
 */
export const deleteAppointment = (appointmentId) => {
    return apiFetch(`/api/my-shops/appointments/${appointmentId}`, {
        method: 'DELETE',
    });
};

// ===================================
// --- PUBLIC CUSTOMER API ---
// ===================================

/**
 * Gets a public list of all shops available on the platform.
 */
export const getAllShops = () => {
    return apiFetch('/api/shops');
};

/**
 * Gets all available time slots for a specific shop on a specific date.
 * @param {number} shopId - The ID of the shop.
 * @param {string} date - The date in 'YYYY-MM-DD' format.
 */
export const getShopAvailability = (shopId, date) => {
    return apiFetch(`/api/shops/${shopId}/availability?date=${date}`);
};

/**
 * Books a new appointment for a customer.
 * @param {number} shopId - The ID of the shop.
 * @param {object} appointmentData - e.g., { customer_name, customer_email, customer_phone, appointment_time }
 */
export const bookAppointment = (shopId, appointmentData) => {
    return apiFetch(`/api/shops/${shopId}/appointments`, {
        method: 'POST',
        body: JSON.stringify(appointmentData),
    });
};

/**
 * Gets the travel time from the user's location to the shop.
 * @param {number} shopId - The ID of the shop.
 * @param {number} lat - User's latitude.
 * @param {number} lng - User's longitude.
 */
export const getShopDistance = (shopId, lat, lng) => {
    return apiFetch(`/api/shops/${shopId}/distance?lat=${lat}&lng=${lng}`);
};

/**
 * Gets the status of a specific appointment.
 * @param {string} token - The appointment token (e.g., "A-1234").
 */
export const getAppointmentStatus = (token) => {
    return apiFetch(`/api/appointments/${token}`);
};

/**
 * Reschedules a customer's appointment.
 * @param {string} token - The appointment token.
 * @param {string} newTime - The new time in ISO format (e.g., "2025-10-08T11:30:00").
 */
export const rescheduleAppointment = (token, newTime) => {
    return apiFetch(`/api/appointments/${token}`, {
        method: 'PUT',
        body: JSON.stringify({ appointment_time: newTime }),
    });
};

/**
 * Cancels a customer's appointment.
 * @param {string} token - The appointment token.
 */
export const cancelAppointment = (token) => {
    return apiFetch(`/api/appointments/${token}`, {
        method: 'DELETE',
    });
};
```

-----

### 3\. How to Use in Your React Components

Now, in your React components, you can just import and use these functions.

#### Example: `src/pages/LoginPage.jsx`

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginShopkeeper } from '../js/apiService'; // 1. Import

function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            // 2. Call the API function
            const data = await loginShopkeeper(email, password);
            
            // 3. Store the token on success
            localStorage.setItem('accessToken', data.access_token);
            
            // 4. Redirect to the protected dashboard
            navigate('/dashboard');

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Login</button>
            {error && <p style={{color: 'red'}}>{error}</p>}
        </form>
    );
}
export default LoginPage;
```

#### Example: `src/pages/DashboardPage.jsx` (A Protected Page)

This component fetches data from a protected endpoint. Our `apiService.js` file handles adding the token automatically.

```jsx
import React, { useState, useEffect } from 'react';
import { getMyShops } from '../js/apiService'; // 1. Import

function DashboardPage() {
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                // 2. Call the protected API function
                const shopsData = await getMyShops();
                setShops(shopsData);
            } catch (err) {
                setError(err.message); // Will show "Session expired..." if token is bad
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div style={{color: 'red'}}>Error: {error}</div>;

    return (
        <div>
            <h2>My Shops</h2>
            <ul>
                {shops.map(shop => (
                    <li key={shop.id}>{shop.shop_name}</li>
                ))}
            </ul>
        </div>
    );
}
export default DashboardPage;
```
