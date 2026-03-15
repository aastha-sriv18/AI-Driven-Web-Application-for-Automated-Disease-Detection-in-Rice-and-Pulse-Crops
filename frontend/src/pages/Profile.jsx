import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, updateProfile } from '../api'

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [picture, setPicture] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [removePicture, setRemovePicture] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getCurrentUser()
        setUser(data.user)
        setFirstName(data.user.first_name)
        setLastName(data.user.last_name)
        setEmail(data.user.email || '')
      } catch {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  function handlePictureChange(e) {
    const file = e.target.files?.[0]
    if (file) {
      setPicture(file)
      setPreviewUrl(URL.createObjectURL(file))
      setRemovePicture(false)
    }
  }

  function handleRemovePicture() {
    setRemovePicture(true)
    setPicture(null)
    setPreviewUrl(null)
  }

  function handleCancelRemove() {
    setRemovePicture(false)
    setPreviewUrl(null)
    setPicture(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    const formData = new FormData()
    formData.append('first_name', firstName)
    formData.append('last_name', lastName)
    formData.append('email', email)
    formData.append('password', password)
    if (picture) formData.append('profile_picture', picture)
    if (removePicture) formData.append('remove_profile_picture', 'true')
    setSubmitting(true)
    try {
      await updateProfile(formData)
      setSuccess('Profile updated successfully!')
      setPassword('')
      setPicture(null)
      setPreviewUrl(null)
      const data = await getCurrentUser()
      setUser(data.user)
    } catch (err) {
      setError(err.payload?.message || err.message || 'Update failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="profile-container">
        <div className="profile-card">
          <p style={{ color: '#8aaa94', textAlign: 'center', padding: '40px 0' }}>Loading…</p>
        </div>
      </main>
    )
  }

  const currentPicUrl = user?.profile_picture
    ? `http://localhost:5000/static/uploads/${user.profile_picture}`
    : null
  const avatarToShow = removePicture ? null : (previewUrl || currentPicUrl)
  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()

  return (
    <main className="profile-container">
      <div className="profile-card">

        {/* ── Top actions bar ── */}
        <div className="profile-actions">
          <button type="button" className="profile-btn profile-btn--ghost" onClick={() => navigate('/dashboard')}>
            ← Back
          </button>
          <button type="submit" form="profile-form" className="profile-btn profile-btn--primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>

        {/* ── Header ── */}
        <h1 className="profile-title">Settings</h1>
        <p className="profile-subtitle">Manage your account details and profile picture</p>

        {error && <div className="profile-alert profile-alert--error">{error}</div>}
        {success && <div className="profile-alert profile-alert--success">✓ {success}</div>}

        <form id="profile-form" onSubmit={handleSubmit} encType="multipart/form-data" className="profile-form">

          {/* ── Avatar ── */}
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrap">
              {avatarToShow ? (
                <img src={avatarToShow} alt="avatar" className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-initials">{initials}</div>
              )}
              {previewUrl && !removePicture && <span className="profile-avatar-badge">New</span>}
              {removePicture && <span className="profile-avatar-badge profile-avatar-badge--remove">Removed</span>}
            </div>

            <div className="profile-avatar-actions">
              <p className="profile-avatar-name">{firstName} {lastName}</p>
              <p className="profile-avatar-email">{email}</p>
              <div className="profile-avatar-buttons">
                <label className="profile-btn profile-btn--outline" htmlFor="profilePicture">
                  📷 {currentPicUrl ? 'Change photo' : 'Upload photo'}
                </label>
                <input id="profilePicture" type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePictureChange} />
                {(currentPicUrl || previewUrl) && !removePicture && (
                  <button type="button" className="profile-btn profile-btn--danger" onClick={handleRemovePicture}>
                    🗑 Remove
                  </button>
                )}
                {removePicture && (
                  <button type="button" className="profile-btn profile-btn--outline" onClick={handleCancelRemove}>
                    ↩ Undo
                  </button>
                )}
              </div>
              {previewUrl && !removePicture && <p className="profile-avatar-hint">New photo selected — save to apply</p>}
              {removePicture && <p className="profile-avatar-hint profile-avatar-hint--warn">Photo will be removed on save</p>}
            </div>
          </div>

          <div className="profile-divider" />
          <div className="profile-section-label">Personal Information</div>

          <div className="profile-two-col">
            <div className="profile-field">
              <label htmlFor="firstName">First name</label>
              <input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required placeholder="John" />
            </div>
            <div className="profile-field">
              <label htmlFor="lastName">Last name</label>
              <input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} required placeholder="Doe" />
            </div>
          </div>

          <div className="profile-field">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>

          <div className="profile-divider" />
          <div className="profile-section-label">Security</div>

          <div className="profile-field">
            <label htmlFor="password">New password</label>
            <div className="profile-password-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Leave blank to keep current password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button type="button" className="profile-eye" onClick={() => setShowPassword(v => !v)}>
                <span className="material-symbols-outlined">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </main>
  )
}