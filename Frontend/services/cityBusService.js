import api from './api';

export const getActiveCityBuses = async () => {
  try {
    const response = await api.get('/city-buses/active');
    return response.data; // should return { success: true, data: [...] }
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return { success: false, message: error.message };
  }
};
