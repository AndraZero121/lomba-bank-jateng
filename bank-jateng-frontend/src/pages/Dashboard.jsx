import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, ProgressBar, Table } from 'react-bootstrap';
import {
  FiDollarSign, FiUsers, FiCalendar, FiCheckCircle, FiBell, FiLogOut,
  FiCheck, FiAlertCircle, FiInfo, FiClock, FiUser, FiSettings, FiChevronDown
} from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend,
} from 'chart.js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import setBaseUrl from '../utils/service';
import Header from '../components/Header';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
dayjs.extend(relativeTime);

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Penggajian diproses',
      message: 'Proses penggajian bulan Juli untuk semua karyawan telah selesai',
      time: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
    },
    {
      id: 2,
      type: 'info',
      title: 'Laporan keuangan',
      message: 'Laporan keuangan bulan Juni telah dibuat dan tersedia',
      time: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
    },
    {
      id: 3,
      type: 'warning',
      title: 'Karyawan baru',
      message: 'Amelia Santoso telah ditambahkan sebagai karyawan baru',
      time: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <FiCheck className="text-success" />;
      case 'warning': return <FiAlertCircle className="text-warning" />;
      default: return <FiInfo className="text-primary" />;
    }
  };

  return (
    <Dropdown className="ms-3" align="end">
      <Dropdown.Toggle 
        variant="light" 
        className="notification-toggle position-relative p-0 bg-transparent border-0 d-flex align-items-center justify-content-center"
      >
        <div className="notification-wrapper">
          <FiBell size={20} className="text-dark" />
          {unreadCount > 0 && (
            <span className="notification-badge position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              {unreadCount}
            </span>
          )}
        </div>
      </Dropdown.Toggle>
      <Dropdown.Menu className="notification-dropdown shadow-lg border-0">
        <div className="notification-header d-flex justify-content-between align-items-center px-3 py-3 border-bottom bg-light">
          <h6 className="mb-0 fw-bold text-dark">Notifikasi</h6>
          {unreadCount > 0 && (
            <button className="btn btn-link p-0 text-primary small fw-semibold" onClick={markAllAsRead}>
              Tandai semua
            </button>
          )}
        </div>
        <div className="notification-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {notifications.length > 0 ? notifications.map(notification => (
            <Dropdown.Item
              key={notification.id}
              className={`notification-item border-0 ${!notification.read ? 'unread' : ''}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="d-flex align-items-start">
                <div className="notification-icon me-3 mt-1">{getNotificationIcon(notification.type)}</div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <strong className="notification-title">{notification.title}</strong>
                    <small className="text-muted ms-2 d-flex align-items-center">
                      <FiClock className="me-1" size={12} />
                      {dayjs(notification.time).fromNow()}
                    </small>
                  </div>
                  <div className="notification-message mt-1">{notification.message}</div>
                </div>
              </div>
            </Dropdown.Item>
          )) : (
            <div className="text-center py-4 text-muted">
              <FiBell size={48} className="mb-2 opacity-25" />
              <p className="mb-0">Tidak ada notifikasi</p>
            </div>
          )}
        </div>
        <div className="notification-footer text-center border-top bg-light">
          <Dropdown.Item as={Link} to="/notifikasi" className="text-primary small fw-semibold py-3">
            Lihat semua notifikasi
          </Dropdown.Item>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    total_gaji: 0,
    jumlah_karyawan: 0,
    payroll_runs: 0,
    karyawan_baru_bulan_ini: 0,
    payrollDistribution: [],
    payrollTrendData: { labels: [], datasets: [] },
    recentActivities: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gajiDistribusi, setGajiDistribusi] = useState({ under5jt: 0, between5to10jt: 0, above10jt: 0 });

  const fetchDashboardData = async () => {
    try {
      const response = await setBaseUrl.get('/dashboard');
      setDashboardData(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Gagal memuat data dasbor.");
    } finally {
      setIsLoading(false);
    }
  };

  const localFetch = () => {
    try {
      const dataUser = localStorage.getItem("user")
      const dataJson = JSON.parse(dataUser)
      setUser({
        name: String(dataJson.name||"Unknowing").trim(),
        avatar: String(dataJson.avatar||"default_user.png").trim(),
        email: String(dataJson.email||"unknowing@mail.net").trim(),
        roles: String(dataJson.roles||"").trim() // gunakan 'roles'
      })
    } catch(e) {
      console.log("Bad localfetch", e)
    }
  }
  // const fetchUserData = async () => {
  //   try {
  //     const res = await setBaseUrl.get('/me'); // 404 Route kang?
  //     setUser({
  //       name: res.data.name || 'admin',
  //       avatar: res.data.avatar || 'default_user.png',
  //       email: res.data.email || '',
  //       role: res.data.role || 'Admin', // set role from backend
  //     });
  //   } catch {
  //     // Fallback to token or localStorage data if API fails
  //     const token = localStorage.getItem('token');
  //     if (token) {
  //       try {
  //         const payload = JSON.parse(atob(token.split('.')[1]));
  //         setUser({
  //           name: payload.name || 'admin',
  //           avatar: 'default_user.png',
  //           email: payload.email || '',
  //           role: payload.role || 'Admin', // set role from token
  //         });
  //       } catch {
  //         setUser({
  //           name: 'Admin',
  //           avatar: 'default_user.png',
  //           email: '',
  //           role: 'Admin',
  //         });
  //       }
  //     } else {
  //       setUser({
  //         name: 'Admin',
  //         avatar: 'default_user.png',
  //         email: '',
  //         role: 'Admin',
  //       });
  //     }
  //   }
  // };

  useEffect(() => {
    fetchDashboardData();
    localFetch();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('user'));
    } catch {
      user = null;
    }
    const role = user?.roles;
    if (role === 'Karyawan') {
      navigate('/datakaryawan', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (dashboardData && dashboardData.payrollDistribution && Array.isArray(dashboardData.payrollDistribution)) {
      // Jika sudah ada dari backend, gunakan saja
      return;
    }
    // Jika tidak, hitung manual dari data karyawan (misal dashboardData.karyawanList)
    if (dashboardData && dashboardData.karyawanList && Array.isArray(dashboardData.karyawanList)) {
      const under5jt = dashboardData.karyawanList.filter(k => k.gaji_pokok < 5000000).length;
      const between5to10jt = dashboardData.karyawanList.filter(k => k.gaji_pokok >= 5000000 && k.gaji_pokok <= 10000000).length;
      const above10jt = dashboardData.karyawanList.filter(k => k.gaji_pokok > 10000000).length;
      setGajiDistribusi({ under5jt, between5to10jt, above10jt });
    }
  }, [dashboardData]);

  const payrollTrendData = {
    labels: dashboardData.payrollTrendData?.labels || [],
    datasets: [{
      label: 'Total Penggajian (Rp)',
      data: dashboardData.payrollTrendData?.datasets?.[0]?.data || [],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    }],
  };

  return (
    <div className="dashboard-container d-flex flex-column min-vh-100">
      <Header />

      {/* Main Content */}
      <main className="container-fluid flex-grow-1 p-4">
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-danger">
            <FiAlertCircle size={48} className="mb-3" />
            <h4>Terjadi Kesalahan</h4>
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Cards */}
            <div className="row g-4 mb-4">
              {/* Card Items */}
              {/* Card implementation di sini sama seperti sebelumnya */}
              {/* ... */}
            </div>

            {/* Chart & Distribusi */}
            <div className="row g-4">
              <div className="col-lg-8">
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body>
                    <Card.Title className="fw-bold">Tren Penggajian</Card.Title>
                    <Line options={{ responsive: true }} data={payrollTrendData} />
                  </Card.Body>
                </Card>
              </div>
              <div className="col-lg-4">
                <Card className="h-100 shadow-sm border-0">
                  <Card.Body>
                    <Card.Title className="fw-bold mb-4">Distribusi Gaji</Card.Title>
                    {dashboardData.payrollDistribution && dashboardData.payrollDistribution.length > 0 ? (
                      dashboardData.payrollDistribution.map((item, index) => (
                        <div key={index} className="mb-3">
                          <div className="d-flex justify-content-between">
                            <span>{item.range}</span>
                            <span className="fw-bold">{item.count} Karyawan</span>
                          </div>
                          <ProgressBar now={item.percentage} label={`${item.percentage}%`} className="mt-1" />
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between">
                            <span>{'< Rp 5.000.000'}</span>
                            <span className="fw-bold">{gajiDistribusi.under5jt} Karyawan</span>
                          </div>
                          <ProgressBar now={gajiDistribusi.under5jt} label={`${gajiDistribusi.under5jt}`} className="mt-1" />
                        </div>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between">
                            <span>{'Rp 5.000.000 - Rp 10.000.000'}</span>
                            <span className="fw-bold">{gajiDistribusi.between5to10jt} Karyawan</span>
                          </div>
                          <ProgressBar now={gajiDistribusi.between5to10jt} label={`${gajiDistribusi.between5to10jt}`} className="mt-1" />
                        </div>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between">
                            <span>{'> Rp 10.000.000'}</span>
                            <span className="fw-bold">{gajiDistribusi.above10jt} Karyawan</span>
                          </div>
                          <ProgressBar now={gajiDistribusi.above10jt} label={`${gajiDistribusi.above10jt}`} className="mt-1" />
                        </div>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </div>
            </div>

            {/* Aktivitas Terbaru */}
            <Card className="mt-4 shadow-sm border-0">
              <Card.Body>
                <Card.Title className="fw-bold">Aktivitas Terbaru</Card.Title>
                <Table responsive hover className="mt-3">
                  <thead className="table-light">
                    <tr><th>Tanggal</th><th>Aktivitas</th><th>Detail</th></tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentActivities.map((a, i) => (
                      <tr key={i}>
                        <td>{dayjs(a.date).format('DD MMM YYYY')}</td>
                        <td>{a.activity}</td>
                        <td>{a.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center mt-auto py-4 bg-light border-top">
        <div className="container">
          <p className="mb-1 fw-semibold text-muted">
            &copy; 2025 <span className="text-primary">SMK Palapa Semarang</span>. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Enhanced Styles */}
      <style jsx>{`
        .dashboard-container {
          background-color: #f8f9fa;
        }
        
        /* Navbar Enhancements */
        .custom-navbar {
          padding: 0.75rem 0;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        }
        
        .brand-container {
          transition: all 0.3s ease;
        }
        
        .brand-container:hover {
          transform: translateY(-1px);
        }
        
        .logo-img {
          transition: all 0.3s ease;
          border-radius: 8px;
        }
        
        .brand-name {
          font-size: 1.25rem;
          color: #212529 !important;
          background: none !important;
          -webkit-background-clip: unset !important;
          -webkit-text-fill-color: unset !important;
          background-clip: unset !important;
        }
        
        .brand-subtitle {
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .nav-item-custom {
          position: relative;
          color: #495057 !important;
          transition: all 0.3s ease;
          border-radius: 8px;
          padding: 0.5rem 1rem !important;
        }
        
        .nav-item-custom:hover {
          color: #0d6efd !important;
          background-color: rgba(13, 110, 253, 0.1);
          transform: translateY(-1px);
        }
        
        .nav-item-custom::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(135deg, #0d6efd, #6f42c1);
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        
        .nav-item-custom:hover::after {
          width: 80%;
        }
        
        /* User Dropdown */
        .user-dropdown-toggle {
          transition: all 0.3s ease;
          border-radius: 12px !important;
        }
        
        .user-dropdown-toggle:hover {
          background-color: rgba(13, 110, 253, 0.1) !important;
          transform: translateY(-1px);
        }
        
        .user-avatar {
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(13, 110, 253, 0.1);
          transition: all 0.3s ease;
        }
        
        .user-avatar:hover {
          border-color: #0d6efd;
          transform: scale(1.05);
        }
        
        .user-name {
          font-size: 0.9rem;
          line-height: 1.2;
        }
        
        .user-role {
          font-size: 0.75rem;
        }
        
        .user-dropdown-menu {
          border-radius: 12px;
          border: none;
          min-width: 280px;
          margin-top: 0.5rem;
        }
        
        .user-dropdown-header {
          border-radius: 12px 12px 0 0;
        }
        
        .dropdown-item-custom {
          transition: all 0.3s ease;
          border-radius: 8px;
          margin: 0.25rem 0.5rem;
        }
        
        .dropdown-item-custom:hover {
          background-color: rgba(13, 110, 253, 0.1);
          color: #0d6efd;
          transform: translateX(5px);
        }
        
        .logout-item:hover {
          background-color: rgba(220, 53, 69, 0.1) !important;
          color: #dc3545 !important;
        }
        
        /* Notification Enhancements */
        .notification-toggle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        
        .notification-toggle:hover {
          background-color: rgba(13, 110, 253, 0.1) !important;
          transform: scale(1.1);
        }
        
        .notification-wrapper {
          position: relative;
          padding: 0.5rem;
        }
        
        .notification-badge {
          font-size: 0.7rem;
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(220, 53, 69, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
          }
        }
        
        .notification-dropdown {
          width: 380px;
          border-radius: 12px;
          border: none;
          margin-top: 0.5rem;
        }
        
        .notification-header {
          border-radius: 12px 12px 0 0;
        }
        
        .notification-item {
          padding: 1rem;
          transition: all 0.3s ease;
          border-radius: 8px;
          margin: 0.25rem 0.5rem;
        }
        
        .notification-item:hover {
          background-color: rgba(13, 110, 253, 0.05);
          transform: translateX(5px);
        }
        
        .notification-item.unread {
          background-color: rgba(13, 110, 253, 0.08);
          border-left: 3px solid #0d6efd;
        }
        
        .notification-title {
          font-size: 0.9rem;
          color: #212529;
        }
        
        .notification-message {
          font-size: 0.8rem;
          color: #6c757d;
          line-height: 1.4;
        }
        
        .notification-footer {
          border-radius: 0 0 12px 12px;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .brand-subtitle {
            display: none !important;
          }
          
          .nav-item-custom {
            text-align: center;
            margin: 0.25rem 0;
          }
          
          .notification-dropdown {
            width: 320px;
          }
          
          .user-dropdown-menu {
            min-width: 250px;
          }
        }
        
        /* Loading Animation */
        .spinner-border {
          width: 3rem;
          height: 3rem;
        }
        
        /* Smooth Transitions */
        * {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;