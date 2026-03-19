"use client"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const ProtectedRoute = () => {
  const { currentUser, isAuthenticated, loading, authChecked } = useAuth()
  const location = useLocation()

  if (loading && !authChecked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Checking authentication status...</p>
      </div>
    )
  }

  if (!isAuthenticated || !currentUser) {
    // Redirect to login with the current location so we can redirect back after login
    return <Navigate to="/auth/signin" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}

export default ProtectedRoute