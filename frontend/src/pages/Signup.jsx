import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup } from '../api'

const PASSWORD_RULES = {
  regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/, // at least 8 chars
  message:
    'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.',
}

function EyeIcon({ open }) {
  return (
    <span className="material-symbols-outlined" aria-hidden="true">
      {open ? 'visibility_off' : 'visibility'}
    </span>
  )
}

export default function Signup() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [picture, setPicture] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  function validatePassword(value) {
    return PASSWORD_RULES.regex.test(value)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!validatePassword(password)) {
      setError(PASSWORD_RULES.message)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const formData = new FormData()
    formData.append('first_name', firstName)
    formData.append('last_name', lastName)
    formData.append('email', email)
    formData.append('password', password)
    formData.append('confirm_password', confirmPassword)

    if (picture) {
      formData.append('profile_picture', picture)
    }

    setLoading(true)
    try {
      await signup(formData)
      setSuccess('Signup successful! Redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 800)
    } catch (err) {
      setError(err.payload?.message || err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="card">
        <div className="left">


          <div className="plant-wrap">
            <svg viewBox="0 0 160 220" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="80" cy="198" rx="38" ry="10" fill="#3b2e1e" opacity="0.5"/>
              <path d="M52 172 Q48 198 80 202 Q112 198 108 172 Z" fill="#6b4c2a"/>
              <path d="M46 168 Q44 174 80 176 Q116 174 114 168 Q110 160 80 162 Q50 160 46 168Z" fill="#8a6240"/>
              <ellipse cx="80" cy="163" rx="33" ry="8" fill="#3d2b1a"/>
              <path d="M80 162 Q78 120 80 80" stroke="#5a8a4a" stroke-width="4" stroke-linecap="round"/>
              <path d="M80 120 Q42 100 30 68 Q58 72 80 120Z" fill="#4a9a5e" opacity="0.95"/>
              <path d="M80 120 Q54 94 30 68" stroke="#3a7a48" stroke-width="1.2" stroke-linecap="round"/>
              <path d="M80 100 Q118 78 132 44 Q104 52 80 100Z" fill="#3d8a52" opacity="0.95"/>
              <path d="M80 100 Q108 72 132 44" stroke="#2d6a3e" stroke-width="1.2" stroke-linecap="round"/>
              <path d="M80 85 Q50 65 40 36 Q66 44 80 85Z" fill="#5aaa6a" opacity="0.85"/>
              <path d="M80 60 Q96 34 116 22 Q102 46 80 60Z" fill="#4aaa60" opacity="0.9"/>
              <path d="M80 60 Q64 30 44 20 Q58 44 80 60Z" fill="#52b468" opacity="0.85"/>
              <circle cx="70" cy="90" r="3" fill="#a8d8b0" opacity="0.5"/>
              <circle cx="102" cy="68" r="2.5" fill="#a8d8b0" opacity="0.4"/>
              <circle cx="56" cy="74" r="2" fill="#c0e8c8" opacity="0.5"/>
            </svg>
          </div>

          <div className="left-title">
            <h1>AI Based Plant</h1>
            <h1>Disease Detection</h1>
            <p>Sign up to scan leaves, save history, and keep plants thriving.</p>
          </div>
        </div>

        <div className="right">
          <h2>Welcome to AI Based Plant Disease Detection!</h2>
          <p className="sub">
            Create an account to start scanning leaves and tracking your plant health.
          </p>

          <div className="form">

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="two-col">
            <div className="input-group">
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="two-col">
            <div className="input-group password-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)}>
                <EyeIcon open={!showPassword} />
              </button>
            </div>

            <div className="input-group password-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)}>
                <EyeIcon open={!showConfirm} />
              </button>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="profilePicture">Profile picture (optional)</label>
            <input
              id="profilePicture"
              type="file"
              accept="image/*"
              onChange={(e) => setPicture(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="form-actions">
            <button className="button primary" type="submit" disabled={loading}>
              {loading ? 'Signing up…' : 'Sign up'}
            </button>
          </div>
        </form>

        <div className="form-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>

        <div className="form-credit">Created by aastha</div>
      </div>
    </div>
  </div>
</main>
  )
}
