import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
    name: "",
    avatar: "/default_user.png",
    email: "",
    roles: "",
  });
  const [showProfile, setShowProfile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const localFetch = () => {
    try {
      const token = localStorage.getItem("token");
      const dataUser = localStorage.getItem("user");

      if (!token || !dataUser) {
        setIsAuthenticated(false);
        setUser({
          name: "Guest",
          avatar: "/default_user.png",
          email: "",
          roles: "",
        });
        return;
      }

      try {
        const dataJson = JSON.parse(dataUser);
        if (!dataJson) {
          throw new Error("Invalid user data");
        }

        setIsAuthenticated(true);
        setUser({
          name: dataJson.name ? String(dataJson.name).trim() : "Guest",
          avatar: dataJson.avatar ? String(dataJson.avatar).trim() : "/default_user.png",
          email: dataJson.email ? String(dataJson.email).trim() : "",
          roles: dataJson.roles ? String(dataJson.roles).trim() : "",
        });
      } catch (jsonError) {
        console.error("Error parsing user data:", jsonError);
        setIsAuthenticated(false);
        setUser({
          name: "Guest",
          avatar: "/default_user.png",
          email: "",
          roles: "",
        });
      }
    } catch (e) {
      console.error("Error in localFetch:", e);
      setIsAuthenticated(false);
      setUser({
        name: "Guest",
        avatar: "/default_user.png",
        email: "",
        roles: "",
      });
    }
  };

  useEffect(() => {
    localFetch();
  }, []);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <header className="sticky-top shadow-sm">
      <nav className="navbar navbar-expand-lg bg-white border-bottom">
        <div className="container">
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

                <div className="d-flex align-items-center ms-auto position-relative" ref={dropdownRef}>
                  <button
                    className="btn btn-light d-flex align-items-center"
                    type="button"
                    onClick={() => setShowProfile(!showProfile)}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      width="40"
                      height="40"
                      className="rounded-circle border me-2"
                    />
                    <span className="fw-semibold text-dark">{user.name || "Profil"}</span>
                  </button>

                  {showProfile && (
                    <ul className="dropdown-menu dropdown-menu-end show position-absolute mt-2 shadow-lg border-0 rounded-3" style={{ top: '100%', left: 'auto', right: 0, zIndex: 1050 }}>
                      <li className="px-3 py-2">
                        <div className="d-flex align-items-center">
                          <img src={user.avatar} alt={user.name} className="user-avatar me-2" />
                          <div>
                            <div className="fw-bold">{user.name}</div>
                            <div className="text-muted small">{user.email || "-"}</div>
                            <div className="text-muted small">Role: {user.roles || "-"}</div>
                          </div>
                        </div>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      {(user.roles === "Admin" || user.roles === "HR") && (
                        <li>
                          <Link to="/datakaryawan" className="dropdown-item">
                            Data Karyawan
                          </Link>
                        </li>
                      )}
                      <li>
                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                          Logout
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              </>
            ) : (
              <div className="ms-auto">
                <Link to="/login" className="btn btn-primary px-4">
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
        }
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid #ddd;
          object-fit: cover;
        }
      `}</style>
    </header>
  );
};

export default Header;
