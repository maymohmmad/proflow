import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/proflowlogo.png";


export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register(name, email, password, confirmPassword);
      navigate("/dashboard");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Logo */}
           
       <div style={{ textAlign: "center" }}>
  <img
    src={logo}
    alt="ProFlow Logo"
    style={{
      width: "100px",
      height: "100px",
      objectFit: "contain"
    }}
  />
</div>

        <h2 style={s.title}>Create account</h2>
        <p style={s.sub}>Start managing your projects</p>

        <form onSubmit={handleSubmit} style={s.form}>

          <div style={s.fieldWrap}>
            <label style={s.label}>Full name</label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={s.input}
              required
            />
          </div>

          <div style={s.fieldWrap}>
            <label style={s.label}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={s.input}
              required
            />
          </div>

          <div style={s.fieldWrap}>
            <label style={s.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={s.input}
              required
            />
          </div>

          <div style={s.fieldWrap}>
            <label style={s.label}>Confirm password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={s.input}
              required
            />
          </div>

          {error && <div style={s.errorBox}>{error}</div>}

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p style={s.switchText}>
            Already have an account?{" "}
            <Link to="/" style={s.link}>
              Login
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
  background: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, sans-serif",
  },
  card: {
    width: "380px",
    background: "#1e293b",
    border: "0.5px solid #2a2a2a",
    borderRadius: "16px",
    padding: "36px 32px",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "28px",
    justifyContent: "center",
  },
  logoDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#6366f1",
  },
  logoText: {
    fontSize: "18px",
    fontWeight: 500,
    color: "#f0f0f0",
  },
  title: {
    fontSize: "20px",
    fontWeight: 500,
    color: "#f0f0f0",
    margin: "0 0 6px",
    textAlign: "center",
  },
  sub: {
    fontSize: "13px",
    color: "#555",
    textAlign: "center",
    marginBottom: "28px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  fieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  label: {
    fontSize: "12px",
    color: "#666",
  },
  input: {
    height: "40px",
    background: "#0f172a", border: "1px solid #334155" ,
    borderRadius: "8px",
    padding: "0 12px",
    fontSize: "13px",
    color: "#e0e0e0",
    outline: "none",
  },
  errorBox: {
    background: "rgba(226,75,74,0.1)",
    border: "0.5px solid rgba(226,75,74,0.3)",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "12px",
    color: "#F09595",
  },
  btn: {
    height: "42px",
    background: "#6366f1",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    marginTop: "4px",
  },
  switchText: {
    fontSize: "12px",
    color: "#555",
    textAlign: "center",
    marginTop: "4px",
  },
  link: {
   color: "#6366f1",
    textDecoration: "none",
  },
};