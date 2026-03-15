import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { getCurrentUser, logout, predictDisease, generateReport } from '../api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Dashboard() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [user, setUser]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl]   = useState(null)
  const [prediction, setPrediction]   = useState(null)
  const [predicting, setPredicting]   = useState(false)
  const [aiReport, setAiReport]       = useState('')
  const [loadingReport, setLoadingReport] = useState(false)
  const [dragOver, setDragOver]       = useState(false)
  const [mounted, setMounted]         = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await getCurrentUser()
        setUser(data.user)
        setTimeout(() => setMounted(true), 80)
      } catch {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  function handleFileChange(e) {
    setPrediction(null)
    setAiReport('')
    setError('')
    const file = e.target.files?.[0]
    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)) }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setPrediction(null); setAiReport(''); setError('')
      setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file))
    }
  }

  function handleClear() {
    setSelectedFile(null); setPreviewUrl(null)
    setPrediction(null); setAiReport(''); setError('')
  }

  async function handlePredict() {
    if (!selectedFile) { setError('Please choose an image first.'); return }
    setError(''); setPredicting(true); setPrediction(null)
    try {
      const fd = new FormData()
      fd.append('image', selectedFile)
      setPrediction(await predictDisease(fd))
    } catch (err) {
      setError(err.message || 'Prediction failed')
    } finally {
      setPredicting(false)
    }
  }

  async function handleGenerateReport() {
    setLoadingReport(true)
    try {
      const data = await generateReport({
        disease:    prediction.main_prediction,
        confidence: prediction.main_confidence,
        top5:       prediction.top5,
      })
      setAiReport(data.report)
    } catch {
      setError('AI report generation failed')
    } finally {
      setLoadingReport(false)
    }
  }

  // Derived values
  const confPct = prediction
    ? ((prediction.main_confidence ?? prediction.top5?.[0]?.confidence ?? 0) * 100).toFixed(1)
    : 0
  const isHealthy   = prediction?.main_prediction?.toLowerCase().includes('healthy')
  const confClass   = confPct < 40 ? ' db-conf-low' : confPct < 65 ? ' db-conf-mid' : ''

  // ── Loading ──
  if (loading) {
    return (
      <div className="db-loading">
        <div className="db-loading-leaf">
          <svg viewBox="0 0 60 60" width="60" height="60">
            <path d="M30 5 Q55 15 55 35 Q55 55 30 58 Q5 55 5 35 Q5 15 30 5Z" fill="#5a7a3a" opacity="0.75" />
          </svg>
        </div>
        <p className="db-loading-text">Loading</p>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className={`db-root${mounted ? ' db-mounted' : ''}`}>

      {/* ── Sidebar ── */}
      <aside className="db-sidebar">
        <div className="db-sidebar-brand">
          <span className="db-sidebar-brand-tag">AI Powered</span>
          <span className="db-sidebar-brand-name">Plant Disease Detection</span>
        </div>

        <Link to="/profile" className="db-sidebar-avatar-link">
          {user.profile_picture ? (
            <img
              src={`http://localhost:5000/static/uploads/${user.profile_picture}`}
              alt="avatar"
              className="db-avatar-img"
            />
          ) : (
            <div className="db-avatar-initials">
              {user.first_name?.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="db-sidebar-username">{user.first_name} {user.last_name}</span>
        </Link>

        <nav className="db-sidebar-nav">
          <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'db-nav-active' : ''}>
            🌿 Dashboard
          </Link>
          <Link to="/history"   className={location.pathname === '/history'   ? 'db-nav-active' : ''}>
            🕰 History
          </Link>
          <Link to="/profile"   className={location.pathname === '/profile'   ? 'db-nav-active' : ''}>
            ⚙️ Settings
          </Link>
        </nav>

        <button className="db-sidebar-logout" onClick={handleLogout}>
          Sign out
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="db-main">

        {/* Header */}
        <div className="db-header">
          <h1 className="db-greeting">
            Good day, <em>{user.first_name}</em> 👋
          </h1>
          <p className="db-greeting-sub">Upload a leaf image to diagnose plant disease with AI</p>
        </div>

        {/* Stat row */}
        <div className="db-stats">
          <div className="db-stat">
            <p className="db-stat-label">Model Status</p>
            <p className="db-stat-value" style={{ color: '#5a7a3a', fontSize: 18 }}>● Active</p>
            <p className="db-stat-hint">EfficientNet backbone</p>
          </div>
          <div className="db-stat">
            <p className="db-stat-label">Disease Classes</p>
            <p className="db-stat-value">44</p>
            <p className="db-stat-hint">Across 12 plant species</p>
          </div>
          <div className="db-stat">
            <p className="db-stat-label">AI Reports</p>
            <p className="db-stat-value" style={{ fontSize: 18, color: '#c47f2e' }}>✦ Gemini</p>
            <p className="db-stat-hint">Google Gemini powered</p>
          </div>
        </div>

        {/* ── Upload card ── */}
        <div className="db-card">
          <h2 className="db-card-title">Leaf Disease Detection</h2>
          <p className="db-card-desc">
            Drop a clear leaf photo below — our model identifies the disease and confidence level instantly.
          </p>

          {/* Tips */}
          <div className="db-tips">
            {['Clear, sharp focus', 'Single centred leaf', 'Good lighting'].map(t => (
              <span key={t} className="db-tip db-tip-good">{t}</span>
            ))}
            {['Multiple leaves', 'Blurry images', 'Busy background'].map(t => (
              <span key={t} className="db-tip db-tip-bad">{t}</span>
            ))}
          </div>

          {/* Drop zone */}
          <div
            className={`db-dropzone${dragOver ? ' db-dragover' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {predicting ? (
              <div className="db-analyzing">
                <div className="db-pulse">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#4ade80" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <p className="db-analyzing-text">
                  Analyzing leaf&nbsp;
                  <span className="db-dots"><span /><span /><span /></span>
                </p>
              </div>
            ) : previewUrl ? (
              <img src={previewUrl} alt="Preview" className="db-dropzone-preview" />
            ) : (
              <>
                <div className="db-drop-icon">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="db-drop-label">Drag & drop or click to upload</p>
                <p className="db-drop-hint">JPG, PNG, WEBP supported</p>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          <div className="db-btn-row">
            <button
              className="db-btn-primary"
              onClick={handlePredict}
              disabled={!selectedFile || predicting}
            >
              {predicting ? (
                <><span className="db-dots"><span /><span /><span /></span> Analyzing</>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  Analyze Image
                </>
              )}
            </button>
            {selectedFile && !predicting && (
              <button className="db-btn-secondary" onClick={handleClear}>Clear</button>
            )}
          </div>

          {error && <div className="db-error">⚠ {error}</div>}
        </div>

        {/* ── Result card ── */}
        {prediction && (
          <div className="db-card">
            <span className={`db-result-badge ${isHealthy ? 'db-healthy' : 'db-disease'}`}>
              {isHealthy ? 'Healthy Plant' : 'Disease Detected'}
            </span>

            <p className="db-pred-name">
              {prediction.main_prediction ?? prediction.top5?.[0]?.disease ?? '—'}
            </p>

            <div className="db-conf-track">
              <div className={`db-conf-fill${confClass}`} style={{ width: `${confPct}%` }} />
            </div>
            <p className="db-conf-pct">{confPct}% confidence</p>

            {prediction.top5?.length > 0 && (
              <>
                <div className="db-divider" />
                <p className="db-alt-eyebrow">Other possibilities</p>
                {prediction.top5.map((item, i) => (
                  <div className="db-alt-row" key={i}>
                    <span className="db-alt-label">{item.disease}</span>
                    <div className="db-alt-track">
                      <div className="db-alt-fill" style={{ width: `${(item.confidence * 100).toFixed(1)}%` }} />
                    </div>
                    <span className="db-alt-pct">{(item.confidence * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </>
            )}

            <div className="db-divider" />
            <button
              className="db-btn-secondary"
              onClick={handleGenerateReport}
              disabled={loadingReport}
            >
              {loadingReport
                ? <><span className="db-dots"><span /><span /><span /></span> Generating report</>
                : <>✦ Generate AI Report</>
              }
            </button>
          </div>
        )}

        {/* ── Report card ── */}
        {aiReport && (
          <div className="db-card">
            <div className="db-report-header">
              <div className="db-report-icon">🌿</div>
              <h3 className="db-report-title">AI Generated Report</h3>
            </div>
            <div className="db-report-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiReport}</ReactMarkdown>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}