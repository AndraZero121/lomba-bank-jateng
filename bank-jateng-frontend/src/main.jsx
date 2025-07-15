import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Karyawan from './pages/Karyawan.jsx';
import Departemen from './pages/Departemen.jsx';
import Laporan from './pages/Laporan.jsx';
import Jabatan from './pages/Jabatan.jsx';
import TambahKaryawan from './pages/TambahKaryawan';
import TambahLaporan from './pages/TambahLaporan.jsx'
import EditKaryawan from './pages/EditKaryawan.jsx';
import Payroll from './pages/Payroll.jsx';
import TambahPayroll from './pages/TambahPayroll.jsx';
import PayrollDetail from './pages/PayrollDetail.jsx';
import Datakaryawan from './pages/Datakaryawan.jsx';  
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Tampilan from './pages/Tampilan.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Tampilan />,
  },
  {
    path: '/login',
    element: (
        <Login />
    ),
  },
  // {
  //   path: '/register',
  //   element: (
  //       <Register />
  //   ),
  // },
  {
    path: '/datakaryawan',
    element: <Datakaryawan />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['Admin', 'HR']}>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/karyawan',
    element: (
      <ProtectedRoute allowedRoles={['Admin', 'HR']}>
        <Karyawan />
      </ProtectedRoute>
    ),
  },
  {
    path: '/tambah-karyawan',
    element: (
      <ProtectedRoute allowedRoles={['Admin', 'HR']}>
        <TambahKaryawan />
      </ProtectedRoute>
    ),
  },
  {
    path: '/edit-karyawan/:id',
    element: (
      <ProtectedRoute allowedRoles={['Admin', 'HR']}>
        <EditKaryawan />
      </ProtectedRoute>
    ),
  },
  {
    path: '/laporan/tambah-laporan',
    element: (
      <ProtectedRoute allowedRoles={['Admin', 'HR']}>
        <TambahLaporan />
      </ProtectedRoute>
    ),
  },
  {
    path: '/departemen',
    element: (
      <ProtectedRoute allowedRoles={['Admin', 'HR']}>
        <Departemen />
      </ProtectedRoute>
    ),
  },
  {
    path: '/laporan',
    element: (
      <ProtectedRoute allowedRoles={['Admin', 'HR']}>
        <Laporan />
      </ProtectedRoute>
    ),
  },
  {
    path: '/jabatan',
    element: (
      <ProtectedRoute allowedRoles={['Admin', 'HR']}>
        <Jabatan />
      </ProtectedRoute>
    ),
  },
  {
    path: '/payroll',
    element: (
      <ProtectedRoute allowedRoles={['Admin', 'HR']}>
        <Payroll />
      </ProtectedRoute>
    ),
  },
  {
    path: '/tambah-payroll',
    element: (
      <ProtectedRoute allowedRoles={['Admin', 'HR']}>
        <TambahPayroll />
      </ProtectedRoute>
    ),
  },
  {
    path: '/payroll/:id',
    element: (
      <ProtectedRoute allowedRoles={['Admin', 'HR']}>
        <PayrollDetail />
      </ProtectedRoute>
    ),
  }
])

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
