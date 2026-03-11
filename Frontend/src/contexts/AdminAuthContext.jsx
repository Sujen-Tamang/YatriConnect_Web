"use client"

import { createContext, useState, useContext, useEffect } from "react"
import {adminLogin} from "../../services/api";
import axios from "axios"

const AdminAuthContext = createContext(null)

export const useAdminAuth = () => useContext(AdminAuthContext)

export const AdminAuthProvider = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if admin is logged in on initial load
  useEffect(() => {
    const admin = localStorage.getItem("user")
    const token = localStorage.getItem("token")
    console.log("i am here!")
    console.log(token)
    console.log(admin)
    if (admin && token) {
      console.log("here!");
      setCurrentAdmin(JSON.parse(admin))
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  // Admin sign in function
    const adminSignIn = async (email, password) => {
    try {
      const result = await adminLogin({ email, password })
      console.log("result", result)

      // Ensure the endpoint returned success AND the user is actually an admin
      if (result.success) {
        if (result.user.role !== "admin") {
          return { success: false, error: "Access denied. Admin privileges required." };
        }

        const adminData = {
          id: result.user._id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
        }

        setCurrentAdmin(adminData)
        localStorage.setItem("user", JSON.stringify(adminData))
        localStorage.setItem("token", result.token)
        axios.defaults.headers.common["Authorization"] = `Bearer ${result.token}`
        return { success: true }
      } else {
        return { success: false, error: result.message || "Invalid email or password" }
      }
    } catch (error) {
      return { success: false, error: error.message || "Failed to sign in" }
    }
  }

  const adminSignOut = () => {
    setCurrentAdmin(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
  }

  // Check if admin has specific permission
  const hasPermission = (permission) => {
    if (!currentAdmin || !currentAdmin.permissions) return false
    return currentAdmin.permissions.includes(permission)
  }

  const value = {
    currentAdmin,
    adminSignIn,
    adminSignOut,
    hasPermission,
    loading,
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export default AdminAuthProvider