import { useEffect, useState } from 'react'
import { useShop } from '../../context/ShopContext'
import './Settings.css'

function Settings() {
  const { settings, setSettings, showToast } = useShop()
  const [form, setForm] = useState(settings)

  useEffect(() => {
    setForm(settings)
  }, [settings])

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const saveSettings = (event) => {
    event.preventDefault()
    setSettings(form)
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    if (u) {
      const next = { ...u, photoURL: (form.avatarUrl || '').trim() || u.photoURL || '' }
      localStorage.setItem('user', JSON.stringify(next))
      window.dispatchEvent(new Event('storage'))
    }
    showToast?.('Saved', 'Your settings were updated.', 'success')
  }

  return (
    <section className="settings-page">
      <div className="settings-card">
        <h1>Account Settings</h1>
        <p>Manage profile details and preferred payment method.</p>

        <form onSubmit={saveSettings} className="settings-form">
          <div className="settings-grid">
            <label>
              Full Name
              <input value={form.fullName || ''} onChange={(e) => updateField('fullName', e.target.value)} />
            </label>
            <label>
              Email
              <input type="email" value={form.email || ''} onChange={(e) => updateField('email', e.target.value)} />
            </label>
            <label>
              Phone
              <input value={form.phone || ''} onChange={(e) => updateField('phone', e.target.value)} />
            </label>
            <label>
              Preferred Payment
              <select value={form.preferredPayment || 'card'} onChange={(e) => updateField('preferredPayment', e.target.value)}>
                <option value="card">Card Payment</option>
                <option value="koko">Koko / Pay Later</option>
                <option value="cod">Cash on Delivery</option>
                <option value="bank">Bank Transfer</option>
                <option value="wallet">Wallet / UPI</option>
              </select>
            </label>
            <label className="full">
              Default Delivery Address
              <textarea value={form.address || ''} onChange={(e) => updateField('address', e.target.value)} />
            </label>
            <label className="full">
              Profile image URL
              <input
                type="url"
                value={form.avatarUrl || ''}
                onChange={(e) => updateField('avatarUrl', e.target.value)}
                placeholder="https://… (e.g. Google account photo or any image link)"
              />
            </label>
            {(form.avatarUrl || '').trim() && (
              <div className="settings-avatar-preview">
                <img src={form.avatarUrl.trim()} alt="Profile preview" />
              </div>
            )}
          </div>
          <button type="submit" className="btn btn-primary">Save Settings</button>
        </form>
      </div>
    </section>
  )
}

export default Settings
