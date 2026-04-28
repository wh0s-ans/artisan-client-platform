import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // API URL - fonctionne en local et en production
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/users`);
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Oops! Couldn't load users. Try refreshing! 🔄");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address! 📧");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const response = await fetch(
        `${API_BASE_URL}/users?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );

      if (response.ok) {
        setName("");
        setEmail("");
        setSuccessMessage("User added successfully! 🎉");
        await fetchUsers();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        throw new Error("Failed to add user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setError("Failed to add user. Please try again! 😅");
    } finally {
      setSubmitting(false);
    }
  };

  const getRandomEmoji = () => {
    const emojis = ["😊", "🤗", "🥳", "😎", "🤓", "🦄", "🌈", "🎈"];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">👥</span>
            <h1>User Manager</h1>
          </div>
          <p className="subtitle">Manage and organize your users with style! ✨</p>
        </div>
      </header>

      <main className="container">
        <div className="form-section">
          <h2>Add New User</h2>

          {successMessage && (
            <div style={{
              background: "linear-gradient(135deg, #51cf66 0%, #40c057 100%)",
              color: "white",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              textAlign: "center",
              fontWeight: "600"
            }}>
              {successMessage}
            </div>
          )}

          {error && (
            <div style={{
              background: "linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%)",
              color: "white",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              textAlign: "center",
              fontWeight: "600"
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="name">👤 Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your awesome name!"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
                maxLength={50}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">📧 Email</label>
              <input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                maxLength={100}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !name.trim() || !email.trim()}
              className="btn-submit"
            >
              {submitting ? "🚀 Adding User..." : "✨ Add User"}
            </button>
          </form>
        </div>

        <div className="users-section">
          <h2>Users List ({users.length})</h2>

          {loading ? (
            <div className="loading">
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
              Loading users...
            </div>
          ) : error ? (
            <div className="error">
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>😵</div>
              {error}
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
              No users yet! Add your first user above! 🎈
            </div>
          ) : (
            <div className="users-list">
              {users.map((user, index) => (
                <div key={index} className="user-card">
                  <h3>{user.name} {getRandomEmoji()}</h3>
                  <p>{user.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <p>No users yet. Add one to get started!</p>
            </div>
          ) : (
            <div className="users-grid">
              {users.map((user) => (
                <div key={user.id} className="user-card">
                  <div className="user-icon">👤</div>
                  <div className="user-info">
                    <h3>{user.name}</h3>
                    <p className="email">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;