import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import service from "../utils/service";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "", // sesuai yang Laravel butuh
  });

  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState({
    show: false,
    type: "",
    message: "",
  });

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: "", message: "" });
    }, type === "success" ? 3000 : 4000);
  };

  const onChangeForm = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const validateForm = () => {
    const { name, email, password, password_confirmation } = form;

    if (!name || !email || !password || !password_confirmation) {
      showAlert("error", "Semua field wajib diisi");
      return false;
    }

    if (password !== password_confirmation) {
      showAlert("error", "Password dan konfirmasi password tidak cocok");
      return false;
    }

    if (password.length < 6) {
      showAlert("error", "Password minimal 6 karakter");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert("error", "Format email tidak valid");
      return false;
    }

    return true;
  };

  useEffect(() => {
    async function IsLogin() {
      const token = localStorage.getItem("token")
      if(!!token) {
        navigate("/dashboard")
      }
    }
    IsLogin()
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await service.post("/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation, // penting!
        roles: "Karyawan", // Set default role saat register
      });

      if (response.data.status) {
        showAlert("success", "Registrasi berhasil! Mengalihkan ke halaman login...");
        setForm({ name: "", email: "", password: "", password_confirmation: "" });
        navigate("/");
      } else {
        showAlert("error", response.data.message || "Registrasi gagal. Silakan coba lagi.");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Terjadi kesalahan saat registrasi.";
      showAlert("error", message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Alert */}
      {alert.show && (
        <div
          className={`alert ${alert.type === "success" ? "alert-success" : "alert-danger"} alert-dismissible fade show`}
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 9999,
            minWidth: "320px",
            maxWidth: "450px",
            animation: "slideInRight 0.5s ease-out",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            border: "none",
            borderRadius: "8px",
          }}
        >
          <div className="d-flex align-items-center">
            <div className="me-2">
              {alert.type === "success" ? (
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.061L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                </svg>
              ) : (
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" />
                </svg>
              )}
            </div>
            <div className="fw-bold">{alert.message}</div>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={() => setAlert({ show: false, type: "", message: "" })}
            style={{ fontSize: "0.8rem" }}
          ></button>
        </div>
      )}

      {/* CSS */}
      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .btn-loading { animation: pulse 1.5s ease-in-out infinite; }
        .alert { transition: all 0.3s ease; }
        .alert:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.2) !important;
        }
        .form-control:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }
        .footer {
          background: #f8f9fa;
          color: #555;
          text-align: center;
          padding: 1rem 0;
          margin-top: auto;
          border-top: 1px solid #ddd;
        }
        .footer .text-primary {
          font-weight: bold;
        }
      `}</style>

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg bg-white shadow-sm border-bottom">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="/">
            <img src="bank_jateng.png" alt="Logo" style={{ height: "2em", marginRight: "8px" }} />
            <span className="fw-bold text-dark">Bank Jateng Syariah</span>
          </a>
          <div className="navbar-nav ms-auto">
            <button className="btn btn-primary fw-bold" onClick={handleLoginRedirect}>
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Form Section */}
      <section className="container my-5 flex-grow-1">
        <div className="row align-items-center">
          <div className="col-md-6">
            <h2 className="fw-bold mb-4">Daftar</h2>
            <form onSubmit={onSubmit}>
              {["name", "email", "password", "password_confirmation"].map((field) => (
                <div className="mb-3" key={field}>
                  <label className="form-label fw-semibold text-capitalize">
                    {field === "password_confirmation" ? "Konfirmasi Kata Sandi" : field.charAt(0).toUpperCase() + field.slice(1)}
                    <span className="text-danger"> *</span>
                  </label>
                  <input
                    type={field.includes("password") ? "password" : field}
                    className="form-control"
                    placeholder={`Masukkan ${field === "password_confirmation" ? "konfirmasi kata sandi" : field}`}
                    value={form[field]}
                    onChange={(e) => onChangeForm(field, e.target.value)}
                    disabled={loading}
                    required
                  />
                  {field === "password_confirmation" && form.password_confirmation && form.password !== form.password_confirmation && (
                    <small className="text-danger">Password tidak cocok</small>
                  )}
                </div>
              ))}

              <button
                type="submit"
                className={`btn btn-primary w-100 fw-bold ${loading ? "btn-loading" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Mendaftar...
                  </>
                ) : (
                  "Daftar"
                )}
              </button>
            </form>

            <p className="text-center mt-4">
              Sudah punya akun?{" "}
              <button onClick={handleLoginRedirect} className="btn btn-link fw-bold p-0">
                Masuk
              </button>
            </p>
          </div>

          <div className="col-md-6 text-center">
            <img src="orang.png" alt="Register Illustration" className="img-fluid" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p className="mb-0">
            &copy; 2025 <span className="text-primary">SMK Palapa Semarang</span>. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
