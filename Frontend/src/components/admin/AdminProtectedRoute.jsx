import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../contexts/AdminAuthContext";

const AdminProtectedRoute = () => {
  const { currentAdmin, loading } = useAdminAuth();
  const location = useLocation();

  console.log("This is admin: ", currentAdmin);
  console.log(currentAdmin);

  if (loading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Checking admin authentication...</p>
        </div>
    );
  }

  if (!currentAdmin) {
    // Redirect to admin login with the current location for redirect after login
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;