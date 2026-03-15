import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

// ── Scroll reveal hook ──────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

// ── Leaf SVG (reusable) ─────────────────────────────────────
function LeafSVG({ className }) {
  return (
    <svg className={className} viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 10 Q180 50 180 130 Q180 220 100 250 Q20 220 20 130 Q20 50 100 10Z" fill="#7aab4a"/>
      <path d="M100 250 Q98 160 100 10" stroke="#5a7a3a" strokeWidth="3" strokeLinecap="round"/>
      <path d="M100 180 Q60 155 40 120" stroke="#5a7a3a" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <path d="M100 150 Q140 125 160 90"  stroke="#5a7a3a" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <path d="M100 120 Q65 100 50 72"   stroke="#5a7a3a" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  )
}

// ── Data ────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: '🔬',
    title: 'AI Disease Prediction',
    desc: 'Upload any leaf image and our EfficientNet model instantly identifies the disease with a confidence score across 44 classes.',
  },
  {
    icon: '✦',
    title: 'Gemini AI Reports',
    desc: 'Google Gemini generates a detailed, human-readable report with treatment advice, prevention tips, and care recommendations.',
  },
  {
    icon: '📋',
    title: 'Health History',
    desc: 'Every scan is saved to your personal history so you can track your plants over time and spot recurring problems early.',
  },
]

const PLANTS = [
  { emoji: '🍎', name: 'Apple' },
  { emoji: '🍓', name: 'Strawberry' },
  { emoji: '🌿', name: 'Cassava' },
  { emoji: '🍅', name: 'Tomato' },
  { emoji: '🍑', name: 'Peach' },
  { emoji: '🍇', name: 'Grape' },
  { emoji: '🫑', name: 'Bell Pepper' },
  { emoji: '🌽', name: 'Corn' },
  { emoji: '🍊', name: 'Orange' },
  { emoji: '🥔', name: 'Potato' },
  { emoji: '🍒', name: 'Cherry' },
  { emoji: '🌾', name: 'Rice' },
]

const STEPS = [
  {
    num: '01',
    title: 'Upload a Photo',
    desc: 'Take a clear, well-lit photo of a single leaf and upload it directly from your device.',
  },
  {
    num: '02',
    title: 'Predict Disease',
    desc: 'Our AI model analyzes the image and returns the most likely disease along with alternative diagnoses.',
  },
  {
    num: '03',
    title: 'Get AI Insights',
    desc: 'Generate a full Gemini-powered report with treatment steps, prevention methods, and plant care advice.',
  },
]

const TECH = [
  { logo: '⚛️',  name: 'React',  role: 'Frontend UI' },
  { logo: '🐍',  name: 'Flask',  role: 'Backend API' },
  { logo: '🎨',  name: 'CSS',    role: 'Styling & Animation' },
  { logo: '🗄️',  name: 'SQLite', role: 'Database' },
]

// ── Component ───────────────────────────────────────────────
export default function Landing() {
  useReveal()

  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setSending(true)

    // Opens default mail client with pre-filled fields
    const subject = encodeURIComponent(`Suggestion from ${form.name} — Plant Disease App`)
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)
    window.location.href = `mailto:aastha@example.com?subject=${subject}&body=${body}`

    setTimeout(() => { setSending(false); setSent(true) }, 800)
  }

  return (
    <>
      {/* ── Navbar ── */}
      <nav className="land-nav">
        <span className="land-nav-logo"></span>
        <ul className="land-nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#plants">Plants</a></li>
          <li><a href="#how">How it works</a></li>
          <li><a href="#tech">Tech</a></li>
          <li><a href="#suggest">Feedback</a></li>
        </ul>
        <Link to="/login" className="land-nav-cta">Get Started</Link>
      </nav>

      {/* ══════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════ */}
      <section className="hero">
        <LeafSVG className="hero-leaf hero-leaf-1" />
        <LeafSVG className="hero-leaf hero-leaf-2" />
        <LeafSVG className="hero-leaf hero-leaf-3" />

        <div className="hero-badge">AI-Powered Plant Health</div>

        <h1 className="hero-title">
          Welcome to <em>AI Based</em>
          <span className="hero-title-line2">Plant Disease Detection</span>
        </h1>

        <p className="hero-sub">
          Diagnose plant diseases in seconds. Upload a leaf photo, get instant AI predictions,
          and receive detailed treatment reports powered by Google Gemini.
        </p>

        <div className="hero-actions">
          <Link to="/signup" className="btn-hero-primary">Start Diagnosing Free</Link>
          <a href="#how" className="btn-hero-ghost">See how it works ↓</a>
        </div>

        <div className="hero-scroll-cue">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2 — WHAT WE DO
      ══════════════════════════════════════ */}
      <div id="features" className="wave-divider">
        <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,48 C360,0 1080,0 1440,48 L1440,48 L0,48 Z" fill="#f3ede3"/>
        </svg>
      </div>

      <section className="features-section">
        <div className="features-inner">
          <div className="reveal">
            <p className="section-eyebrow">What We Do</p>
            <h2 className="section-heading">Everything your plants <em>need</em></h2>
            <p className="section-body">
              Three powerful tools working together to keep your plants healthy — from instant diagnosis to long-term tracking.
            </p>
          </div>

          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`feature-card reveal reveal-delay-${i + 1}`}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 3 — PLANTS SUPPORTED
      ══════════════════════════════════════ */}
      <div className="wave-divider">
        <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,0 C360,48 1080,48 1440,0 L1440,48 L0,48 Z" fill="#faf7f2"/>
        </svg>
      </div>

      <section id="plants" className="plants-section">
        <div className="plants-inner">
          <div className="plants-header">
            <div className="reveal">
              <p className="section-eyebrow">Supported Plants</p>
              <h2 className="section-heading">12 crops, <em>44 diseases</em></h2>
            </div>
            <p className="section-body reveal reveal-delay-2" style={{ maxWidth: 340 }}>
              From staple food crops to fruits — our model covers the plants that matter most to farmers and home gardeners.
            </p>
          </div>

          <div className="plants-grid">
            {PLANTS.map((p, i) => (
              <div key={p.name} className={`plant-chip reveal reveal-delay-${(i % 6) + 1}`}>
                <span className="plant-chip-emoji">{p.emoji}</span>
                <span className="plant-chip-name">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 4 — HOW IT WORKS
      ══════════════════════════════════════ */}
      <div className="wave-divider">
        <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,48 C360,0 1080,0 1440,48 L1440,48 L0,48 Z" fill="#f3ede3"/>
        </svg>
      </div>

      <section id="how" className="how-section">
        <div className="how-inner">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 0 }}>
            <p className="section-eyebrow">How It Works</p>
            <h2 className="section-heading">Three steps to a <em>diagnosis</em></h2>
          </div>

          <div className="how-steps">
            {STEPS.map((s, i) => (
              <div key={s.num} className={`how-step reveal reveal-delay-${i + 1}`}>
                <div className="how-step-num">{s.num}</div>
                <h3 className="how-step-title">{s.title}</h3>
                <p className="how-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 5 — QUOTE
      ══════════════════════════════════════ */}
      <div className="wave-divider">
        <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,0 C360,48 1080,48 1440,0 L1440,48 L0,48 Z" fill="#eee7d8"/>
        </svg>
      </div>

      <section className="quote-section">
        <div className="quote-inner">
          <div className="quote-leaf-accent reveal">🌱</div>
          <blockquote className="quote-text reveal reveal-delay-1">
            "To plant a garden is to believe in <strong>tomorrow</strong> —
            and today, AI helps us ensure that tomorrow is <strong>healthy</strong>."
          </blockquote>
          <p className="quote-attr reveal reveal-delay-2">— Plant AI, 2025</p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 6 — TECH STACK
      ══════════════════════════════════════ */}
      <div className="wave-divider">
        <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,48 C360,0 1080,0 1440,48 L1440,48 L0,48 Z" fill="#faf7f2"/>
        </svg>
      </div>

      <section id="tech" className="tech-section">
        <div className="tech-inner">
          <div className="reveal" style={{ textAlign: 'center' }}>
            <p className="section-eyebrow">Built With</p>
            <h2 className="section-heading">Technologies <em>behind the magic</em></h2>
          </div>

          <div className="tech-grid">
            {TECH.map((t, i) => (
              <div key={t.name} className={`tech-card reveal reveal-delay-${i + 1}`}>
                <div className="tech-card-logo">{t.logo}</div>
                <h4 className="tech-card-name">{t.name}</h4>
                <p className="tech-card-role">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 7 — SUGGEST IMPROVEMENTS
      ══════════════════════════════════════ */}
      <div className="wave-divider">
        <svg viewBox="0 0 1440 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,0 C360,48 1080,48 1440,0 L1440,48 L0,48 Z" fill="#f3ede3"/>
        </svg>
      </div>

      <section id="suggest" className="suggest-section">
        <div className="suggest-inner">
          <div className="reveal">
            <p className="section-eyebrow">Feedback</p>
            <h2 className="section-heading" style={{ textAlign: 'center' }}>
              Suggest <em>improvements</em>
            </h2>
            <p className="section-body" style={{ textAlign: 'center', margin: '12px auto 0' }}>
              Have an idea to make this better? Send it directly to the developer.
            </p>
          </div>

          {sent ? (
            <div className="suggest-success reveal">
              ✅ Your message has been sent — thank you for the feedback!
            </div>
          ) : (
            <form className="suggest-form reveal reveal-delay-1" onSubmit={handleSubmit}>
              <div className="suggest-row">
                <div className="suggest-field">
                  <label>Your Name</label>
                  <input
                    name="name"
                    placeholder="Jane Doe"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="suggest-field">
                  <label>Your Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="jane@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="suggest-field">
                <label>Your Suggestion</label>
                <textarea
                  name="message"
                  placeholder="I think it would be great if..."
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <button className="suggest-submit" type="submit" disabled={sending}>
                {sending ? 'Opening mail…' : 'Send Suggestion ✉'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className="land-footer">
        <span className="footer-brand"></span>

        <p className="footer-credit">
          Crafted with care by <strong>Aastha</strong> · 2026
        </p>

        <span className="footer-brand"></span>

      </footer>
    </>
  )
}