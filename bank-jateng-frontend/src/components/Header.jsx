import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiChevronDown, FiLogOut, FiUser } from "react-icons/fi";

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Karyawan", to: "/karyawan" },
  { label: "Departemen", to: "/departemen" },
  { label: "Jabatan", to: "/jabatan" },
  { label: "Payroll", to: "/payroll" },
  { label: "Laporan", to: "/laporan" },
];

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({ 
    name: '',
    avatar: 'default_user.png',
    email: '',
    roles: '', // gunakan 'roles' sesuai field di localStorage
  });
  const [showProfile, setShowProfile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const localFetch = () => {
    try {
      const token = localStorage.getItem("token")
      const dataUser = localStorage.getItem("user")
      const dataJson = JSON.parse(dataUser)
      setIsAuthenticated(!!token)
      setUser({
        name: String(dataJson.name||"Unknowing").trim(),
        avatar: String(dataJson.avatar||"/default_user.png").trim(),
        email: String(dataJson.email||"unknowing@mail.net").trim(),
        roles: String(dataJson.roles||"").trim(), // ambil dari 'roles'
      })
    } catch(e) {
      console.log("Bad localfetch", e)
    }
  }

  useEffect(() => {
    localFetch()
  }, [])

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   setIsAuthenticated(!!token);
  //   let name = '';
  //   if (token) {
  //     try {
  //       const payload = JSON.parse(atob(token.split('.')[1]));
  //       name = payload.name || '';
  //     } catch {
  //       name = localStorage.getItem('name') || '';
  //     }
  //   } else {
  //     name = localStorage.getItem('name') || '';
  //   }
  //   setUser({
  //     name,
  //     avatar: '/default_user.png',
  //     email: '',
  //   });
  // }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('name');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <header className="sticky-top shadow-sm">
      <nav className="navbar navbar-expand-lg bg-white border-bottom">
        <div className="container">
          {/* Brand Logo */}
          <Link className="navbar-brand d-flex align-items-center" to="/dashboard">
            <img
              src="/bank_jateng.png"
              alt="Bank Jateng Syariah Logo"
              width="60"
              height="40"
              className="me-2"
            />
            <span className="fw-bold text-dark">Bank Jateng Syariah</span>
          </Link>

          {/* Mobile Toggle Button */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navigation Content */}
          <div className="collapse navbar-collapse" id="navbarContent">
            {isAuthenticated ? (
              <>
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  {navItems.map((item) => (
                    <li className="nav-item" key={item.to}>
                      <Link
                        className={`nav-link ${location.pathname === item.to ? "active" : ""}`}
                        to={item.to}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="d-flex align-items-center ms-auto position-relative">
                  <button
                    className="btn btn-light d-flex align-items-center dropdown-toggle"
                    type="button"
                    id="dropdownProfile"
                    data-bs-toggle="dropdown"
                    aria-expanded={showProfile ? 'true' : 'false'}
                    onClick={() => setShowProfile(!showProfile)}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      width="40"
                      height="40"
                      className="rounded-circle border me-2"
                    />
                    <span className="fw-semibold text-dark">{user.name || 'Profil'}</span>
                    <FiChevronDown className="ms-2" />
                  </button>
                  <ul className={`dropdown-menu dropdown-menu-end${showProfile ? ' show' : ''}`} aria-labelledby="dropdownProfile">
                    <li className="px-3 py-2">
                      <div className="d-flex align-items-center">
                        <img src={user.avatar} alt={user.name} className="user-avatar me-2" />
                        <div>
                          <div className="fw-bold">{user.name}</div>
                          <div className="text-muted small">{user.email || '-'}</div>
                          <div className="text-muted small">Role: {user.roles || '-'}</div>
                        </div>
                      </div>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    {(user.roles === 'Admin' || user.roles === 'HR') && (
                      <li>
                        <Link to="/datakaryawan" className="dropdown-item d-flex align-items-center">
                          <FiUser className="me-2" /> Data Karyawan
                        </Link>
                      </li>
                    )}
                    <li>
                      <button className="dropdown-item text-danger d-flex align-items-center" onClick={handleLogout}>
                        <FiLogOut className="me-2" /> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="ms-auto">
                <Link to="/" className="btn btn-primary px-4">
                  Masuk
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      <style jsx>{`
        .navbar-brand .fw-bold.text-dark {
          color: #212529 !important;
          background: none !important;
          -webkit-background-clip: unset !important;
          -webkit-text-fill-color: unset !important;
          background-clip: unset !important;
        }
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid #ddd;
          object-fit: cover;
        }
        .dropdown-menu.show {
          display: block;
        }
      `}</style>
    </header>
  );
};

export default Header;