// services/userService.js
import api from './api';

/**
 * Fetch all bookings for the currently logged-in user
 * GET /api/v1/bookings
 */
export const getMyBookings = async () => {
  try {
    const response = await api.get('bookings');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error fetching bookings:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Error fetching bookings',
    };
  }
};
