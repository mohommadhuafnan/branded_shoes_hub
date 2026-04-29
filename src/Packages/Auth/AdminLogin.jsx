import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShop } from '../../context/ShopContext'
import { API_BASE } from '../../lib/api'
import './Auth.css'

const API_URL = `${API_BASE}/auth`

function AdminLogin() {
  const navigate = useNavigate()
  const { showToast } = useShop()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const safeJson = async (response) => {
    try {
      return await response.json()
    } catch {
      return {}
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch(`${API_URL}/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await safeJson(response)
      if (!response.ok) throw new Error(data.message || 'Admin login failed')

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, role: 'admin' }))
      window.dispatchEvent(new Event('storage'))
      if (showToast) showToast('Success', 'Welcome Admin!', 'success')
      navigate('/admin')
    } catch (err) {
      const errorMsg =
        err instanceof TypeError && err.message === 'Failed to fetch'
          ? 'Cannot reach admin API. Check backend deployment and VITE_API_URL.'
          : err.message
      setMessage({ type: 'error', text: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-container">
        <div className="auth-form-container">
          <div className="auth-header">
            <h2>Admin Login</h2>
            <p>Authorized admins only</p>
          </div>

          {message.text && <div className={`api-message ${message.type}`}>{message.text}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="auth-input"
                placeholder="Enter admin email"
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="auth-input"
                placeholder="Enter admin password"
                required
              />
            </div>

            <div className="auth-actions">
              <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
                {loading ? 'Logging in...' : 'Log In as Admin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default AdminLogin
