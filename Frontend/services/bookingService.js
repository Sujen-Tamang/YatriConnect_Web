import api from './api';

export const getUserBookings = async () => {
  try {
    // API already has token in interceptor, no need to add it here
    const response = await api.get(`/bookings`);
    console.log('Booking API response:', response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch bookings',
    };
  }
};


export const cancelBooking = async (bookingId) => {
  try {
    const url = `/bookings/${bookingId}/cancel`;
    console.log('Cancelling booking with URL:', url, 'and ID:', bookingId);
    const response = await api.put(url);
    console.log('Cancel booking response:', response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('Error cancelling booking:', error.response || error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to cancel booking',
    };
  }
};



export const getUserBookingById = async (bookingId) => {
  try {
    const response = await api.get(`/bookings/${bookingId}`);
    return {
      success: true,
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error('Error fetching booking:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch booking',
    };
  }
};


export const confirmBooking = async (confirmData) => {
  try {
    const response = await api.post('/bookings/confirm', confirmData);
    console.log('Confirm booking response:', response.data);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error('Error confirming booking:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to confirm booking',
    };
  }
};