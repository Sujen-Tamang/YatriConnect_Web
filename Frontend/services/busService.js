// services/busService.js
import api from "./api";

export const getAllBuses = async (filterParams = {}) => {
  try {
    console.log('Fetching all buses with filters:', filterParams);
    // Only add filter parameters if they are provided
    const response = await api.get("/buses", {
      params: filterParams
    });
    
    // The response should match the expected format:
    // {
    //   success: true,
    //   count: number,
    //   data: [bus objects]
    // }
    return {
      success: true,
      count: response.data.count,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error fetching buses:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.msg || "Error fetching buses",
    };
  }
};

export const getAvailableSeats = async (busId, date) => {
  try {
    console.log(`Fetching seats for bus ${busId} on ${date}...`);
    const response = await api.get(`/buses/${busId}/seats`, {
      params: { date },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching seats:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.msg || "Error fetching seats",
    };
  }
};

export const bookBusSeats = async (busId, seats, bookingData) => {
  try {
    console.log(`Booking seats for bus ${busId}:`, seats, bookingData);
    const response = await api.post(`/buses/${busId}/bookings`, bookingData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error booking seats:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.msg || "Error booking seats",
    };
  }
};