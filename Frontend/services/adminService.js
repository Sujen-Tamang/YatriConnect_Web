// src/services/adminService.js
import api from './api';

// Admin Bus Management
export const getAllBuses = async () => {
  try {
    const response = await api.get('admin/buses');
    return response.data;
  } catch (error) {
    console.error('Error fetching buses:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Error fetching buses',
    };
  }
};

export const createBus = async (busData) => {
  try {
    const response = await api.post('admin/buses', busData);
    return response.data;
  } catch (error) {
    console.error('Error creating bus:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Error creating bus',
    };
  }
};

export const updateBus = async (busId, busData) => {
  try {
    const response = await api.put(`admin/buses/${busId}`, busData);
    return response.data;
  } catch (error) {
    console.error('Error updating bus:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Error updating bus',
    };
  }
};

export const deleteBus = async (busId) => {
  try {
    const response = await api.delete(`admin/buses/${busId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting bus:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Error deleting bus',
    };
  }
};

// Admin User Management
export const getAllUsers = async () => {
  try {
    const response = await api.get('admin/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Error fetching users',
    };
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Error fetching user',
    };
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Error updating user',
    };
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Error deleting user',
    };
  }
};

export const createUser = async (userData) => {
    try {
        const response = await api.post('admin/users', userData);
        return response.data;
    } catch (error) {
        console.error('Error creating user:', error.response?.data || error.message);
        return {
            success: false,
            message: error.response?.data?.message || 'Error creating user',
        };
    }
};

// Admin Route Management
export const getAllRoutes = async () => {
    try {
        const response = await api.get('admin/routes');
        return response.data;
    } catch (error) {
        console.error('Error fetching routes:', error.response?.data || error.message);
        return { success: false, message: 'Error fetching routes' };
    }
};

export const createRoute = async (routeData) => {
    try {
        const response = await api.post('admin/routes', routeData);
        return response.data;
    } catch (error) {
        console.error('Error creating route:', error.response?.data || error.message);
        return { success: false, message: 'Error creating route' };
    }
};

export const assignDriver = async (routeId, driverId) => {
    try {
        const response = await api.put('admin/routes/assign-driver', { routeId, driverId });
        return response.data;
    } catch (error) {
        console.error('Error assigning driver:', error.response?.data || error.message);
        return { success: false, message: 'Error assigning driver' };
    }
};

export const deleteRoute = async (routeId) => {
    try {
        const response = await api.delete(`admin/routes/${routeId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting route:', error.response?.data || error.message);
        return { success: false, message: 'Error deleting route' };
    }
};

// Admin City Bus Management
export const getAllCityBuses = async () => {
    try {
        const response = await api.get('admin/city-buses');
        return response.data;
    } catch (error) {
        console.error('Error fetching city buses:', error.response?.data || error.message);
        return { success: false, message: 'Error fetching city buses' };
    }
};

export const assignCityBusDriver = async (busId, driverId) => {
    try {
        const response = await api.put(`admin/city-buses/${busId}`, { driver: driverId });
        return response.data;
    } catch (error) {
        console.error('Error assigning city bus driver:', error.response?.data || error.message);
        return { success: false, message: 'Error assigning city bus driver' };
    }
};

// Admin Dashboard Management
export const getDashboardStats = async () => {
  try {
    const response = await api.get('admin/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Error fetching dashboard stats',
    };
  }
};

export const getRecentBookings = async () => {
  try {
    const response = await api.get('admin/dashboard/bookings/recent');
    return response.data;
  } catch (error) {
    console.error('Error fetching recent bookings:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Error fetching recent bookings',
    };
  }
};

export const getPopularRoutes = async () => {
  try {
    const response = await api.get('/admin/dashboard/routes/popular');
    return response.data;
  } catch (error) {
    console.error('Error fetching popular routes:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Error fetching popular routes',
    };
  }
};

export const getAllBookings = async () => {
  try {
    const response = await api.get('admin/bookings');
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Error fetching bookings',
    };
  }
};

// Admin Payment Management
export const getAllPayments = async () => {
  try {
    const response = await api.get('admin/payments');
    return response.data;
  } catch (error) {
    console.error('Error fetching payments:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Error fetching payments',
    };
  }
};

export const getPaymentStats = async () => {
  try {
    const response = await api.get('admin/payments/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching payment stats:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Error fetching payment stats',
    };
  }
};

// Admin Legal Doc Management
export const getAllLegalDocs = async () => {
  try {
    const response = await api.get('admin/legal/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching legal docs:', error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || 'Error fetching legal docs' };
  }
};

export const getLegalDocBySlug = async (slug) => {
  try {
    const response = await api.get(`admin/legal/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching legal doc:', error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || 'Error fetching legal doc' };
  }
};

export const upsertLegalDoc = async (docData) => {
  try {
    const response = await api.post('admin/legal/upsert', docData);
    return response.data;
  } catch (error) {
    console.error('Error upserting legal doc:', error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || 'Error upserting legal doc' };
  }
};

export const deleteLegalDoc = async (slug) => {
  try {
    const response = await api.delete(`admin/legal/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting legal doc:', error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || 'Error deleting legal doc' };
  }
};

// Notification Services
export const sendPromo = async (promoData) => {
    try {
        const response = await api.post('notifications/promo', promoData);
        return response.data;
    } catch (error) {
        console.error('Error sending promo:', error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || 'Error sending promo' };
    }
};

export const getAdminNotifications = async () => {
    try {
        const response = await api.get('notifications/admin');
        return response.data;
    } catch (error) {
        console.error('Error fetching admin notifications:', error.response?.data || error.message);
        return { success: false, message: 'Error fetching notifications' };
    }
};