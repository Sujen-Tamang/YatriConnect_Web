import api from "./api";
import axios from "axios";

export const login = async (logindata) => {
  try {
    const response = await api.post("auth/Login", logindata, {
      withCredentials: true,
    });

    const { token, user } = response.data;
    console.log("Backend response:", response.data); // Debug log

    // Create complete user object with ALL fields from backend
    const userData = {
      id: user._id || user.id, // Handle both _id and id
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified, // CRUCIAL - Add verification status
      token: token,
      // Include any other fields you need
    };

    // Store data
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    console.log("Frontend user data:", userData); // Debug log

    return {
      success: true,
      token,
      user: userData
    };
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
};

export const register = async (registrationData) => {
  try {
    console.log("i am here!")
    const response = await api.post("auth/register", registrationData);
    console.log("i am here!")
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Registration failed",
    };
  }
};

export const logout = async() => {
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const response = await api.post('auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
    }
  } catch (error) {
    console.error('Logout error:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Request email verification code
export const requestVerification = async (email) => {
  try {
    const response = await api.post("auth/send-verification", { email });
    return {
      success: true,
      message: response.data.message || "Verification code sent successfully"
    };
  } catch (error) {
    console.error("Verification request failed:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to send verification code"
    };
  }
};

// Verify email with code
export const verifyEmail = async (email, verificationCode) => {
  try {
    const response = await api.post(
        "auth/verify-otp",
        { email, otp: Number(verificationCode) },
        { withCredentials: true }
    );

    if (response.data.success) {
      const { token, user } = response.data;

      // Create complete verified user object
      const verifiedUser = {
        ...user,
        token,
        isVerified: true
      };

      // Update storage and headers
      localStorage.setItem("user", JSON.stringify(verifiedUser));
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return {
        success: true,
        token,
        user: verifiedUser,
        message: response.data.message
      };
    }

    return {
      success: false,
      message: response.data.message || "Verification failed"
    };

  } catch (error) {
    console.error("Verification error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Verification failed. Please try again."
    };
  }
};

// Request password reset link
export const forgotPassword = async (email) => {
  try {
    const response = await api.post("auth/forgot-password", { email });
    return {
      success: true,
      message: response.data.message || "Reset link sent successfully"
    };
  } catch (error) {
    console.error("Forgot password request failed:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to send reset link"
    };
  }
};

// Reset password with token
export const resetPassword = async (token, passwords) => {
  try {
    const response = await api.put(`auth/reset-password/${token}`, passwords);
    return {
      success: true,
      message: response.data.message || "Password reset successful"
    };
  } catch (error) {
    console.error("Password reset failed:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to reset password"
    };
  }
};

// Update user profile
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put("auth/update-profile", profileData);
    return {
      success: true,
      message: response.data.message || "Profile updated successfully",
      user: response.data.user,
      otpRequired: response.data.otpRequired
    };
  } catch (error) {
    console.error("Profile update failed:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update profile"
    };
  }
};

// Update user password (authenticated)
export const updatePassword = async (passwordData) => {
  try {
    const response = await api.put("auth/update-password", passwordData);
    return {
      success: true,
      message: response.data.message || "Password updated successfully"
    };
  } catch (error) {
    console.error("Password change failed:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to change password"
    };
  }
};

// Verify email update with OTP
export const verifyEmailUpdate = async (otp) => {
  try {
    const response = await api.post("auth/verify-email-update", { otp: Number(otp) });
    return {
      success: true,
      message: response.data.message || "Email updated successfully",
      user: response.data.user
    };
  } catch (error) {
    console.error("Email verification failed:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Verification failed"
    };
  }
};
