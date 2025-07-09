import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { useNavigate, Navigate } from 'react-router-dom'
import setBaseUrl from '../utils/service'

export default function Home() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    login: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const onChangeForm = (key, value) => {
    setForm({
      ...form, [key]: value
    })
  }

  async function onSubmit(e) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const requestdata = await setBaseUrl.post("/login", {
        login: form.login,
        password: form.password
      })
      if(requestdata.status !== 200) {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Unexpected Response!",
          confirmButtonText: "OK",
        })
        setIsLoading(false)
        return
      }
      localStorage.setItem('token', String(requestdata.data.token).trim());
      localStorage.setItem('name', String(requestdata.data.user.name)); // Teko save ae, nama uwong tok
      if (requestdata.data.user) {
        const objectStringLocal = {
          name: String(requestdata.data.user.name||""),               // String
          create_at: String(requestdata.data.user.created_at||""),    // String
          updated_at: String(requestdata.data.user.updated_at||""),   // String
          email: String(requestdata.data.user.email||""),             // String
          id: parseInt(requestdata.data.user.id||1),                  // Int
          id_karyawan: requestdata.data.user.id_karyawan||null,       // Int | null
          roles: String(requestdata.data.user.roles||"Karyawan"),     // String
        }
        localStorage.setItem('role', String(objectStringLocal.roles));
        localStorage.setItem('user', JSON.stringify(objectStringLocal));
        console.log("Set User!")
      }
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Anda berhasil masuk ke akun Anda",
        confirmButtonText: "OK",
      })
      // Redirect sesuai role
      if (requestdata.data.user && requestdata.data.user.roles === 'Karyawan') {
        navigate('/datakaryawan')
      } else if (requestdata.data.user && requestdata.data.user.roles === 'HR') {
        navigate('/laporan')
      } else if (requestdata.data.user && requestdata.data.user.roles === 'Admin') {
        navigate('/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch(e) {
      const response = e.response;
      if (response) {
        let catchError = 'Terjadi kesalahan pada server';
        if (response.data && response.data.errors) {
          catchError = Object.values(response.data.errors)?.flat()?.join(", ");
        } else if (response.data && response.data.message) {
          catchError = response.data.message;
        }
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: catchError,
          confirmButtonText: "OK",
        });
        setIsLoading(false);
        return;
      }
      Swal.fire({
        icon: "error",
        title: "Kesalahan",
        text: "Masalah pada koneksi ke server",
        confirmButtonText: "OK",
      })
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const storeName = localStorage.getItem('name')
    if (storeName) {
      Swal.fire({
        icon: 'info',
        title: 'Selamat Datang',
        text: `Selamat datang kembali, ${storeName}`,
        confirmButtonText: 'OK',
      })
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Selamat Datang',
        text: 'Selamat datang di Bank Jateng Syariah',
        confirmButtonText: 'OK',
      })
    }
  }, [])

  const isLoggedIn = () => {
    const token = localStorage.getItem('token')
    return token
  }

  if (isLoggedIn()) {
    return <Navigate to='/dashboard' />
  }

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg bg-white shadow-sm border-bottom">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="/">
            <img src="bank_jateng.png" alt="Logo" style={{ height: "2em", marginRight: "8px" }} />
            <span className="fw-bold text-dark">Bank Jateng Syariah</span>
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavAltMarkup"
            aria-controls="navbarNavAltMarkup"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav ms-auto">
              <a className="btn btn-primary fw-bold" href="/register" style={{ padding: "0.5em 1.5em" }}>
                Daftar
              </a>
            </div>
          </div>
        </div>
      </nav>
      <section>
        <div className="container text-center my-5">
          <img src="login.png" alt="Bank Jateng Syariah Banner" className="img-fluid" />
          <p className="fs-3 fw-bold mt-3">Masuk Ke Akun Anda</p>
        </div>
      </section>
      <section>
        <div className="container">
          <form method="post" onSubmit={onSubmit}>
            <div className="row mb-3">
              <div className="col-md-4">
                <label htmlFor="login" className="form-label fw-bold">
                  Masukkan Email atau Nama
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="login"
                  placeholder="Masukkan Email atau Nama"
                  value={form.login}
                  onChange={event => onChangeForm("login", event.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-4">
                <label htmlFor="password" className="form-label fw-bold">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Kata Sandi"
                  value={form.password}
                  onChange={event => onChangeForm("password", event.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-4">
                <button
                  type="submit"
                  className={`btn btn-primary fw-bold w-100 ${isLoading ? "btn-loading" : ""}`}
                  style={{ maxWidth: 400 }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Memproses...
                    </>
                  ) : (
                    "Masuk"
                  )}
                </button>
              </div>
            </div>
            {/*<p className="text-muted text-center">
              Belum punya akun?{" "}
              <a href="/register" className="text-decoration-none">
                Daftar
              </a>
            </p>*/}
          </form>
        </div>
      </section>
      {/* Footer */}
      <footer className="text-center mt-auto py-4 bg-light border-top">
        <div className="container">
          <p className="mb-1 fw-semibold text-muted">
            &copy; 2025 <span className="text-primary">SMK Palapa Semarang</span>. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

