import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { useNavigate, Navigate } from 'react-router-dom'
import setBaseUrl from '../utils/service'

export default function Home() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ login: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [pendingLogin, setPendingLogin] = useState({})
  const [isOtpVerified, setIsOtpVerified] = useState(false)

  const onChangeForm = (key, value) => {
    setForm({ ...form, [key]: value })
  }

  async function onSubmit(e) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const requestdata = await setBaseUrl.post('/login', form)
      if (requestdata.data && requestdata.data.need_otp) {
        setPendingLogin({ login: form.login })
        setShowOtpModal(true)
        setIsLoading(false)
        Swal.fire({
          icon: 'info',
          title: 'Verifikasi OTP',
          text: requestdata.data.message || 'Kode OTP telah dikirim ke email Anda.',
          confirmButtonText: 'OK',
        })
        return
      }
      setIsLoading(false)
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Login gagal atau server tidak mengirim instruksi OTP.',
        confirmButtonText: 'OK',
      })
    } catch (e) {
      const response = e.response
      let catchError = 'Terjadi kesalahan pada server'
      if (response?.data?.errors) {
        catchError = Object.values(response.data.errors).flat().join(', ')
      } else if (response?.data?.message) {
        catchError = response.data.message
      }
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: catchError,
        confirmButtonText: 'OK',
      })
      setIsLoading(false)
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    setOtpLoading(true)
    try {
      const res = await setBaseUrl.post('/verify-otp', {
        login: pendingLogin.login,
        otp: otp,
      })
      if (res.data?.token) {
        localStorage.setItem('token', String(res.data.token).trim())
        localStorage.setItem('name', String(res.data.user.name))
        const userData = {
          name: res.data.user.name || '',
          create_at: res.data.user.created_at || '',
          updated_at: res.data.user.updated_at || '',
          email: res.data.user.email || '',
          id: parseInt(res.data.user.id || 1),
          id_karyawan: res.data.user.id_karyawan || null,
          roles: res.data.user.roles || 'Karyawan',
        }
        localStorage.setItem('role', userData.roles)
        localStorage.setItem('user', JSON.stringify(userData))
        setShowOtpModal(false)
        setIsOtpVerified(true)
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Login dan verifikasi OTP berhasil',
          confirmButtonText: 'OK',
        })
        if (userData.roles === 'Karyawan') navigate('/datakaryawan')
        else if (userData.roles === 'HR') navigate('/laporan')
        else navigate('/dashboard')
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: res.data.message || 'OTP salah atau tidak valid',
          confirmButtonText: 'OK',
        })
      }
    } catch (e) {
      const msg = e.response?.data?.message || 'Terjadi kesalahan pada server'
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: msg,
        confirmButtonText: 'OK',
      })
    }
    setOtpLoading(false)
  }

  async function handleResendOtp() {
    if (!pendingLogin.login) return
    setOtpLoading(true)
    try {
      const resend = await setBaseUrl.post('/login', {
        login: pendingLogin.login,
        password: form.password,
      })
      if (resend.data?.need_otp) {
        Swal.fire({
          icon: 'info',
          title: 'OTP Dikirim Ulang',
          text: resend.data.message || 'Kode OTP baru telah dikirim ke email Anda.',
          confirmButtonText: 'OK',
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: resend.data?.message || 'Gagal mengirim ulang OTP',
          confirmButtonText: 'OK',
        })
      }
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal mengirim ulang OTP. Coba beberapa saat lagi.',
        confirmButtonText: 'OK',
      })
    }
    setOtpLoading(false)
  }

  useEffect(() => {
    const storeName = localStorage.getItem('name')
    Swal.fire({
      icon: 'info',
      title: 'Selamat Datang',
      text: storeName ? `Selamat datang kembali, ${storeName}` : 'Selamat datang di Bank Jateng Syariah',
      confirmButtonText: 'OK',
    })
  }, [])

  const isLoggedIn = () => {
    return !!localStorage.getItem('token')
  }

  if (isLoggedIn() && !showOtpModal && isOtpVerified) {
    return <Navigate to='/dashboard' />
  }

  return (
    <div>
      <nav className='navbar navbar-expand-lg bg-white shadow-sm border-bottom'>
        <div className='container'>
          <a className='navbar-brand d-flex align-items-center' href='/'>
            <img src='bank_jateng.png' alt='Logo' style={{ height: '2em', marginRight: '8px' }} />
            <span className='fw-bold text-dark'>Bank Jateng Syariah</span>
          </a>
        </div>
      </nav>
      <section>
        <div className='container text-center my-5'>
          <img src='login.png' alt='Bank Jateng Syariah Banner' className='img-fluid' />
          <p className='fs-3 fw-bold mt-3'>Masuk Ke Akun Anda</p>
        </div>
      </section>
      <section>
        <div className='container'>
          <form method='post' onSubmit={onSubmit}>
            <div className='row mb-3'>
              <div className='col-md-4'>
                <label htmlFor='login' className='form-label fw-bold'>Masukkan Email atau Nama</label>
                <input
                  type='text'
                  className='form-control'
                  id='login'
                  placeholder='Masukkan Email atau Nama'
                  value={form.login}
                  onChange={e => onChangeForm('login', e.target.value)}
                  autoComplete='username'
                />
              </div>
            </div>
            <div className='row mb-3'>
              <div className='col-md-4'>
                <label htmlFor='password' className='form-label fw-bold'>Kata Sandi</label>
                <input
                  type='password'
                  className='form-control'
                  id='password'
                  placeholder='Kata Sandi'
                  value={form.password}
                  onChange={e => onChangeForm('password', e.target.value)}
                  autoComplete='current-password'
                />
              </div>
            </div>
            <div className='row'>
              <div className='col-md-4'>
                <button
                  type='submit'
                  className={`btn btn-primary fw-bold w-100 ${isLoading ? 'btn-loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className='spinner-border spinner-border-sm me-2' role='status'></span>
                      Memproses...
                    </>
                  ) : (
                    'Masuk'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
      {showOtpModal && (
        <div className='modal fade show' style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }} tabIndex='-1'>
          <div className='modal-dialog modal-dialog-centered'>
            <div className='modal-content'>
              <form onSubmit={handleVerifyOtp}>
                <div className='modal-header'>
                  <h5 className='modal-title'>Verifikasi OTP</h5>
                  <button type='button' className='btn-close' onClick={() => setShowOtpModal(false)}></button>
                </div>
                <div className='modal-body'>
                  <p>Masukkan kode OTP yang telah dikirim ke email Anda.</p>
                  <input
                    type='text'
                    className='form-control text-center fs-4 fw-bold'
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder='Kode OTP'
                    autoFocus
                  />
                  <button
                    type='button'
                    className='btn btn-link mt-2'
                    onClick={handleResendOtp}
                    disabled={otpLoading}
                  >
                    {otpLoading ? 'Mengirim ulang...' : 'Kirim Ulang OTP'}
                  </button>
                </div>
                <div className='modal-footer'>
                  <button type='button' className='btn btn-secondary' onClick={() => setShowOtpModal(false)} disabled={otpLoading}>Batal</button>
                  <button type='submit' className='btn btn-primary fw-bold' disabled={otpLoading || otp.length !== 6}>
                    {otpLoading && <span className='spinner-border spinner-border-sm me-2' role='status'></span>}
                    Verifikasi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <footer className="bg-white border-top py-4 position-relative">
        <div className="container text-center">
          <p className="text-muted mb-1">
            &copy; 2025 <span className="text-primary fw-semibold">Bank Jateng Syariah</span>
          </p>
          <p className="small text-muted">
            Developed with <i className="bi bi-heart-fill text-danger mx-1"></i> by <span className="text-primary">Sipena Dev</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
