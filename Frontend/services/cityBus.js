import api from './api';

export const getActiveCityBuses = async () => {
    try {
        const response = await api.get('city-buses/active');
        return response.data;
    } catch (error) {
        console.error('Error fetching active city buses:', error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || 'Error fetching active city buses' };
    }
};

export const checkInCityBus = async (busId) => {
    try {
        const response = await api.post('city-buses/checkin', { busId });
        return response.data;
    } catch (error) {
        console.error('Error checking in:', error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || 'Error checking in' };
    }
};

export const checkOutCityBus = async () => {
    try {
        const response = await api.post('city-buses/checkout', {});
        return response.data;
    } catch (error) {
        console.error('Error checking out:', error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || 'Error checking out' };
    }
};

export const getCurrentRide = async () => {
    try {
        const response = await api.get('city-buses/current-ride');
        return response.data;
    } catch (error) {
        console.error('Error fetching current ride:', error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || 'Error fetching current ride' };
    }
};
