import api from './api';

export const getCityBuses = async () => {
    try {
        const response = await api.get('admin/city-buses');
        return response.data;
    } catch (error) {
        console.error('Error fetching city buses:', error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || 'Error fetching city buses' };
    }
};

export const createCityBus = async (data) => {
    try {
        const response = await api.post('admin/city-buses', data);
        return response.data;
    } catch (error) {
        console.error('Error creating city bus:', error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || 'Error creating city bus' };
    }
};

export const updateCityBus = async (id, data) => {
    try {
        const response = await api.put(`admin/city-buses/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating city bus:', error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || 'Error updating city bus' };
    }
};

export const deleteCityBus = async (id) => {
    try {
        const response = await api.delete(`admin/city-buses/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting city bus:', error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || 'Error deleting city bus' };
    }
};
