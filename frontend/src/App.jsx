import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
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

    try {
      setSubmitting(true);
      const response = await fetch(
        `http://127.0.0.1:8000/users?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );
      if (response.ok) {
        setName("");
        setEmail("");
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">👥</span>
            <h1>User Manager</h1>
          </div>
          <p className="subtitle">Manage and organize your users</p>
        </div>
      </header>

      <main className="container">
        <div className="form-section">
          <h2>Add New User</h2>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter user name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter user email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !name.trim() || !email.trim()}
              className="btn-submit"
            >
              {submitting ? "Adding..." : "Add User"}
            </button>
          </form>
        </div>

        <div className="users-section">
          <h2>Users List ({users.length})</h2>
          {loading ? (
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