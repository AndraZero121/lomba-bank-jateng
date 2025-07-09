import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles, children }) {
  const location = useLocation();
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {
    user = null;
  }
  const role = user?.roles;

  if (!allowedRoles.includes(role)) {
    // Jika role tidak diizinkan, redirect ke /datakaryawan
    return <Navigate to="/datakaryawan" state={{ from: location }} replace />;
  }
  return children;
}
