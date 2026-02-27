import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../index.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      const { token, role } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      // store user info if provided
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      if (role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/student");
      }
    } catch {
      alert("Login failed");
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ display: 'flex', gap: 28, width: '100%', maxWidth: 1100 }} className="hero">
        <div style={{ flex: 1 }}>
          <h1 style={{ color: '#0f172a', marginBottom: 10 }}>Campus Portal</h1>
          <p style={{ color: '#334155', marginBottom: 18, fontSize: 16 }}>Discover events, download resources, and manage your registrations — designed for students and teachers.</p>

          <div className="features-grid">
            <div className="feature-card">
              <h3>🎟️ Explore Events</h3>
              <p style={{ color: '#475569', marginTop: 8 }}>Browse upcoming workshops and register in one click.</p>
            </div>
            <div className="feature-card">
              <h3>📚 Resources</h3>
              <p style={{ color: '#475569', marginTop: 8 }}>Access shared study sheets and course material.</p>
            </div>
            <div className="feature-card">
              <h3>👩‍🏫 Role-Based</h3>
              <p style={{ color: '#475569', marginTop: 8 }}>Admins and students see tailored dashboards.</p>
            </div>
            <div className="feature-card">
              <h3>🔒 Secure</h3>
              <p style={{ color: '#475569', marginTop: 8 }}>JWT-based authentication keeps data private.</p>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <button className="primary-cta" onClick={() => navigate('/signup')}>Get Started</button>
          </div>
        </div>

        <div style={{ width: 420 }}>
          <div className="card login-card">
            <h2 style={{ marginBottom: 6 }}>Sign in</h2>
            <p style={{ color: '#6b7280', marginBottom: 12 }}>Use your campus credentials</p>
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button className="btn primary-cta" type="submit">
                Login
              </button>
              <p style={{ marginTop: "14px", textAlign: "center" }}>
                Don't have an account? <span style={{ color: "#2563eb", cursor: "pointer" }} onClick={() => navigate("/signup")}>Sign Up</span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
