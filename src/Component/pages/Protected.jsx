import { Outlet, Navigate } from "react-router-dom"

const Protected = () => {
  // Get login token from localStorage
  let login = localStorage.getItem("user_token")
  
  // Optional: Add token validation if needed
  const isTokenValid = () => {
    if (!login) return false;
    
    try {
    
      return true; // Modify this based on your token structure
    }
     catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  }

  // Return protected routes only if logged in
  return login && isTokenValid() ? <Outlet /> : <Navigate to="/login" replace />
}

export default Protected;

// Optional: For handling authentication-specific routes
export const ProtectedAuthRoute = () => {
  let login = localStorage.getItem("user_token")
  
  // Redirect to dashboard if already logged in
  return login ? <Navigate to="/dashboard" replace /> : <Outlet />
}