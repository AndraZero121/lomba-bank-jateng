import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import setBaseUrl from '../utils/service';

const AuthPage = ({ type = 'login' }) => {
  const isLogin = type === 'login';
  const navigate = useNavigate();
  const [form, setForm] = useState({
    login: '',
    password: '',
    password_confirmation: '',
    name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  if (localStorage.getItem('token')) {
    return <Navigate to="/dashboard" />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Client-side validation
      if (!isLogin && form.password !== form.password_confirmation) {
        throw new Error('Password confirmation does not match');
      }

      const endpoint = isLogin ? '/login' : '/register';
      const payload = isLogin 
        ? { login: form.login, password: form.password }
        : form;

      const response = await setBaseUrl.post(endpoint, payload);

      if (response.status !== 200) {
        throw new Error('Authentication failed');
      }

      // Save token and user data
      if(!response.data.token) {
        Swal.fire({
          icon: 'error',
          title: 'Request Problem 😞',
          text: "Kesalahan terjadi pada permintaan ke server, silahkan kontak developer",
          confirmButtonText: 'OK'
        });
        return; // Stop
      }
      localStorage.setItem('token', String(response.data.token));
      localStorage.setItem('name', String(response.data.name)); // Teko save ae, nama uwong tok
      if (response.data.user) {
        const objectStringLocal = {
          create_at: String(response.data.user.created_at||""),    // String
          updated_at: String(response.data.user.updated_at||""),   // String
          email: String(response.data.user.email||""),             // String
          id: parseInt(response.data.user.id||1),                  // Int
          id_karyawan: response.data.user.id_karyawan||null,       // Int | null
          roles: String(response.data.user.roles||"Karyawan"),     // String
        }
        localStorage.setItem('role', String(objectStringLocal.roles));
        localStorage.setItem('user', JSON.stringify(objectStringLocal));
        console.log("Set User!")
      }

      Swal.fire({
        icon: 'success',
        title: isLogin ? 'Login Successful!' : 'Registration Complete!',
        text: isLogin 
          ? 'You are now logged in' 
          : 'Your account has been created successfully',
        confirmButtonText: 'Continue'
      }).then(() => {
        if (response.data.user) {
          const role = response.data.user.roles;
          if (role === 'Karyawan') {
            navigate('/datakaryawan');
          } else if (role === 'HR') {
            navigate('/hr-dashboard');
          } else if (role === 'Admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/dashboard');
          }
        } else {
          navigate('/dashboard');
        }
      });

    } catch (error) {
      const errorMessage = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.message || 'Authentication failed. Please try again.';

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg bg-white shadow-sm">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <img
              src="/bank_jateng.png"
              alt="Bank Logo"
              width="60"
              height="40"
              className="me-2"
            />
            <span className="fw-bold text-primary">Bank Jateng Syariah</span>
          </Link>
          <div className="d-flex">
            <Link 
              to={isLogin ? "/register" : "/login"} 
              className="btn btn-outline-primary ms-2"
            >
              {isLogin ? 'Register' : 'Login'}
            </Link>
          </div>
        </div>
      </nav>
      <main className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <img 
                    src={isLogin ? "/login-icon.png" : "/register-icon.png"} 
                    alt={isLogin ? "Login" : "Register"} 
                    width="80"
                    className="mb-3"
                  />
                  <h2 className="fw-bold">
                    {isLogin ? 'Masuk ke Akun Anda' : 'Buat Akun Baru'}
                  </h2>
                  <p className="text-muted">
                    {isLogin 
                      ? 'Masukkan email dan kata sandi Anda' 
                      : 'Isi formulir berikut untuk mendaftar'}
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  {!isLogin && (
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label fw-semibold">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="login" className="form-label fw-semibold">
                      Email atau Username
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="login"
                      name="login"
                      value={form.login}
                      onChange={handleChange}
                      required
                      placeholder="Masukkan email atau username"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold">
                      Kata Sandi
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                      placeholder="Minimal 6 karakter"
                    />
                  </div>

                  {!isLogin && (
                    <div className="mb-4">
                      <label htmlFor="password_confirmation" className="form-label fw-semibold">
                        Konfirmasi Kata Sandi
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={form.password_confirmation}
                        onChange={handleChange}
                        required
                        placeholder="Ketik ulang kata sandi"
                      />
                    </div>
                  )}

                  <div className="d-grid mb-3">
                    <button 
                      type="submit" 
                      className="btn btn-primary py-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                          {isLogin ? 'Memproses...' : 'Mendaftarkan...'}
                        </>
                      ) : (
                        isLogin ? 'Masuk' : 'Daftar'
                      )}
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="text-muted mb-0">
                      {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
                      <Link 
                        to={isLogin ? "/register" : "/login"} 
                        className="text-decoration-none fw-semibold ms-2"
                      >
                        {isLogin ? 'Daftar disini' : 'Masuk disini'}
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Separate page components for better routing
export const Login = () => <AuthPage type="login" />;
export const Register = () => <AuthPage type="register" />;

