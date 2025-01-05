import React, { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useNavigate
} from "react-router-dom";
import "./App.css";

// ====== Universal Reusable Modal for Feedback ======
const NotificationModal = ({ isOpen, onClose, message }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Notification"
      className="modal"
      overlayClassName="overlay"
    >
      <h2>Notice</h2>
      <p>{message}</p>
      <button onClick={onClose}>OK</button>
    </Modal>
  );
};

// ====== Admin Login Component ======
const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const closeModal = () => setModalOpen(false);

  const handleLogin = () => {
    const ADMIN_PASSWORD = "supersecurepassword"; // Replace with real password
    if (password === ADMIN_PASSWORD) {
      setModalMessage("Login successful!");
      setModalOpen(true);
    } else {
      setModalMessage("Incorrect password!");
      setModalOpen(true);
    }
  };

  useEffect(() => {
    if (!modalOpen && modalMessage === "Login successful!") {
      navigate("/admin");
    }
  }, [modalOpen, modalMessage, navigate]);

  return (
    <div className="admin-login-container">
      <h1>Admin Login</h1>
      <div className="form-group">
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Admin Password"
        />
      </div>
      <button onClick={handleLogin} className="login-button">
        Login
      </button>

      <NotificationModal
        isOpen={modalOpen}
        onClose={closeModal}
        message={modalMessage}
      />
    </div>
  );
};

// ====== Admin Dashboard Component ======
const AdminDashboard = () => {
  const [applicants, setApplicants] = useState([]);
  const [editingApplicant, setEditingApplicant] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const [newName, setNewName] = useState("");
  const [newSlots, setNewSlots] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const [msgModalOpen, setMsgModalOpen] = useState(false);
  const [msgModalMessage, setMsgModalMessage] = useState("");

  const openMsgModal = (text) => {
    setMsgModalMessage(text);
    setMsgModalOpen(true);
  };
  const closeMsgModal = () => setMsgModalOpen(false);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/applicants`)
      .then((res) => res.json())
      .then((data) => setApplicants(data))
      .catch((err) => console.error(err));
  }, []);

  const openEditModal = (applicant) => {
    setEditingApplicant(applicant);
    setNewName(applicant.name);
    setNewSlots(applicant.slots);
    setNewStatus(applicant.status);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setEditingApplicant(null);
  };

  const saveChanges = () => {
    fetch(`${process.env.REACT_APP_API_URL}/update-applicant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingApplicant.id,
        name: newName,
        slots: newSlots,
        status: newStatus,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          openMsgModal(data.error);
        } else {
          openMsgModal(data.message);
          setApplicants((prev) =>
            prev.map((app) =>
              app.id === editingApplicant.id
                ? {
                    ...app,
                    name: newName,
                    slots: newSlots,
                    status: newStatus,
                  }
                : app
            )
          );
          closeModal();
        }
      })
      .catch((err) => openMsgModal(err.toString()));
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <table className="applicants-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Slots</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applicants.map((applicant) => (
            <tr key={applicant.id}>
              <td>{applicant.id}</td>
              <td>{applicant.name}</td>
              <td>{applicant.slots}</td>
              <td>{applicant.status}</td>
              <td>
                <button
                  className="edit-button"
                  onClick={() => openEditModal(applicant)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Edit Applicant"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Edit Applicant</h2>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Slots:</label>
          <input
            type="number"
            value={newSlots}
            onChange={(e) => setNewSlots(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Status:</label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
        <div className="modal-buttons">
          <button onClick={saveChanges}>Save</button>
          <button onClick={closeModal}>Cancel</button>
        </div>
      </Modal>

      <NotificationModal
        isOpen={msgModalOpen}
        onClose={closeMsgModal}
        message={msgModalMessage}
      />

      <Link to="/" className="back-link">
        Back to Booking
      </Link>
    </div>
  );
};

// ====== Game Rules & Teams Component ======
const GameRulesAndTeams = () => {
  const [teams, setTeams] = useState([]);

  // Simply fetch final teams from the server (final_teams.json) on mount
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/get-teams`)
      .then((res) => res.json())
      .then((savedTeams) => {
        if (Array.isArray(savedTeams)) {
          setTeams(savedTeams);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="rules-container">
      <h1>Game Rules</h1>
      <p>1. Each team: 1 GK + 5 players (total 6) or as you set. No auto-shuffle now countdown is complete.</p>
      <p>2. Each match is 10 minutes or first to 2 goals.</p>
      <p>3. Monday, January 6th, 2025 (6 AM to 8 AM). .</p>
      <hr />
      <h2>This Week’s Teams</h2>
      {teams.length === 0 ? (
        <p>No teams found. Please refresh if empty.</p>
      ) : (
        <div className="teams-container">
          {teams.map((team, idx) => (
            <div key={idx} className="team-section">
              <h3>Team {idx + 1}</h3>
              <ul className="team-list">
                {team.map((player, playerIdx) => (
                  <li key={playerIdx}>
                    {playerIdx === 0 ? "🧤 " : `${playerIdx + 1}. `} {player.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PRICE_PER_SLOT = 800;
const getProgressColor = (percent) => {
  if (percent < 50) return "#4caf50";
  if (percent < 75) return "#ffeb3b";
  if (percent < 90) return "#ffa000";
  return "#f44336";
};

const BookingPage = () => {
  const [name, setName] = useState("");
  const [spots, setSpots] = useState(1);
  const [applicants, setApplicants] = useState([]);
  const [paidPlayers, setPaidPlayers] = useState([]);

  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [hasPaid, setHasPaid] = useState(false);

  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState("");

  const paymentRef = useRef(null);

  const openNotify = (msg) => {
    setNotifyMessage(msg);
    setNotifyOpen(true);
  };
  const closeNotify = () => setNotifyOpen(false);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/applicants`)
      .then((res) => res.json())
      .then((data) => {
        setApplicants(data);
        setPaidPlayers(data.filter((a) => a.status === "Paid"));
      })
      .catch((err) => console.error(err));
  }, []);

  const handleBook = () => {
    fetch(`${process.env.REACT_APP_API_URL}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slots: spots }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          openNotify(data.error);
        } else {
          const amount = PRICE_PER_SLOT * spots;
          setTotalAmount(amount);
          setShowPaymentSection(true);
          setHasPaid(false);
          setName("");
          setSpots(1);
          setTimeout(() => {
            if (paymentRef.current) {
              paymentRef.current.scrollIntoView({ behavior: "smooth" });
            }
          }, 200);
        }
      })
      .catch((err) => openNotify(err.toString()));
  };

  const handlePaymentConfirmation = () => {
    setHasPaid(true);
  };

  const paidCount = paidPlayers.length;
  const progressPercent = (paidCount / 20) * 100;

  return (
    <div className="app-container">
      <h1>Yerer Football Booking App</h1>

      {/* Booking Form */}
      <div className="form-container">
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            className="name-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        <div className="form-group">
          <label>Spots:</label>
          <input
            type="number"
            className="spots-field"
            value={spots}
            onChange={(e) => setSpots(Number(e.target.value))}
            min="1"
            max="20"
          />
        </div>
        <button onClick={handleBook}>Book</button>
      </div>

      {/* Confirmed Players */}
      <h2>Confirmed Players</h2>
      <div className="paid-players-grid">
        {paidPlayers.length > 0 ? (
          paidPlayers.map((player) => (
            <div key={player.id} className="player-card">
              <h3>{player.name}</h3>
              <p>
                <strong>Slots:</strong> {player.slots}
              </p>
              <p className="status-tag">{player.status}</p>
            </div>
          ))
        ) : (
          <p>No players confirmed yet.</p>
        )}
      </div>

      {/* Progress Bar */}
      <h2>Applicants ({paidCount}/20 Confirmed)</h2>
      <div className="progress-bar">
        <span
          style={{
            width: `${progressPercent}%`,
            backgroundColor: getProgressColor(progressPercent),
          }}
        />
        <div className="progress-bar-label">{Math.floor(progressPercent)}%</div>
      </div>

      {/* Payment Instructions Section */}
      {showPaymentSection && (
        <div ref={paymentRef} className="payment-info">
          <h2>Payment Instructions</h2>
          <p>
            You selected {spots} slot(s). The monthly fee covers 4 games.
            <br />
            <strong>Total Amount: {totalAmount} Birr</strong>
          </p>
          <p>
            Phone Number for Payment:
            <br />
            <strong>+251910187397</strong>
          </p>
          <p>You can also use this QR code to pay:</p>
          <img
            src={`${process.env.REACT_APP_API_URL}/static/chat_qr_code.jpg`}
            alt="QR Code"
            className="qr-code"
          />

          {!hasPaid ? (
            <button onClick={handlePaymentConfirmation} className="i-paid-btn">
              I Have Paid
            </button>
          ) : (
            <div className="paid-message">
              <p>Thank you! Please wait for admin approval.</p>
            </div>
          )}
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notifyOpen}
        onClose={closeNotify}
        message={notifyMessage}
      />

      <Link to="/login" className="admin-login-btn">
        Admin Login
      </Link>
      <Link to="/rules" className="rules-link">
        Game Rules & Teams
      </Link>
    </div>
  );
};

// ====== Main App Component with Routing ======
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BookingPage />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/rules" element={<GameRulesAndTeams />} />
      </Routes>
    </Router>
  );
};

export default App;
