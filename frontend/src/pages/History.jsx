import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPredictionHistory } from '../api'

export default function History() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getPredictionHistory()
        setHistory(data.history || [])
      } catch (err) {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [navigate])

  if (loading) {
    return (
      <main className="container">
        <p>Loading…</p>
      </main>
    )
  }

  return (
    <main className="history-container">
      <div className="history-form-card">

        <button type="button" className="profile-btn profile-btn--ghost" onClick={() => navigate('/dashboard')}>
            ← Back
        </button>

        <h1>Prediction History</h1>
        {history.length === 0 ? (
          <p>No predictions yet. Run a scan to start building history.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Disease</th>
                  <th>Confidence</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, idx) => (
                  <tr key={`${row.image_path}-${idx}`}>
                    <td>
                      <img
                        src={`http://localhost:5000${row.image_path}`}
                        alt={row.predicted_disease}
                        width={120}
                        style={{ borderRadius: 8 }}
                      />
                    </td>
                    <td>{row.predicted_disease}</td>
                    <td>{(row.confidence * 100).toFixed(2)}%</td>
                    <td>{new Date(row.uploaded_at).toLocaleString('en-GB',{
                        day: 'numeric',
                        month: 'long',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
