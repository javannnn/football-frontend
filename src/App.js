import React, { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import "./App.css";
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from "react-router-dom";

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

  // For pop-up feedback
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

  // Once user closes the modal after success, navigate if password was correct
  useEffect(() => {
    if (!modalOpen && modalMessage === "Login successful!") {
      navigate("/admin");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen]);

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

  // Fields for editing
  const [newName, setNewName] = useState("");
  const [newSlots, setNewSlots] = useState("");
  const [newStatus, setNewStatus] = useState("");

  // For pop-up feedback
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
                ? { ...app, name: newName, slots: newSlots, status: newStatus }
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
                <button className="edit-button" onClick={() => openEditModal(applicant)}>
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
  const [applicants, setApplicants] = useState([]);
  const [timeLeft, setTimeLeft] = useState("");
  const [teamsLocked, setTeamsLocked] = useState(false);
  const [teams, setTeams] = useState([]);

  // Jan 6, 2025, 00:00
  const gameDate = new Date(2025, 0, 6, 0, 0, 0).getTime();
  const lockThreshold = 24 * 60 * 60 * 1000; // 24 hours in ms

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/applicants`)
      .then((res) => res.json())
      .then((data) => setApplicants(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const distance = gameDate - now;
      if (distance <= lockThreshold) {
        setTeamsLocked(true);
      }
      if (distance < 0) {
        setTimeLeft("The match has started!");
        clearInterval(timer);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${days}d ${hours}h ${mins}m ${secs}s left until kickoff`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (teamsLocked && teams.length === 0) {
      createTeams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamsLocked, applicants]);

  const createTeams = () => {
    const paidPlayers = applicants.filter((a) => a.status === "Paid");
    if (paidPlayers.length < 15) {
        alert("Not enough paid players to create teams. Minimum 15 required.");
        return;
    }
    const shuffled = [...paidPlayers].sort(() => 0.5 - Math.random());
    const newTeams = [];
    let teamCount = Math.min(3, Math.ceil(shuffled.length / 5));
    let index = 0;

    for (let i = 0; i < teamCount; i++) {
        const teamSize =
            Math.floor(shuffled.length / teamCount) +
            (i < shuffled.length % teamCount ? 1 : 0);
        const slice = shuffled.slice(index, index + teamSize);
        index += teamSize;
        newTeams.push(slice);
    }
    setTeams(newTeams);
};


  const maxGames = 5;
  const getGKRotation = (team) => {
    const rotation = [];
    for (let i = 0; i < maxGames; i++) {
      const gkIndex = i % team.length;
      rotation.push({ game: i + 1, name: team[gkIndex].name });
    }
    return rotation;
  };

  return (
    <div className="rules-container">
      <h1>Game Rules</h1>
      <p>1. Three teams if enough (Paid). Loser steps out next game.</p>
      <p>2. Each match is 10 minutes or first to 2 goals.</p>
      <p>3. If 0-0 after 10 minutes, add 3. Still 0-0? Penalties decide who steps out.</p>
      <p>4. Time: Monday, January 6th, 2025 (12 AM to 8 AM).</p>
      <p>5. Teams auto-selected from paid players. GK rotates each game.</p>
      <p>6. Lose one? Wait a game, then return for revenge.</p>
      <hr />
      <div className="countdown-timer">
        {timeLeft && !teamsLocked && <p>{timeLeft}</p>}
        {teamsLocked ? (
          <p className="locked">Teams are locked!</p>
        ) : (
          <p className="unlocked">Teams lock 24 hours before kickoff.</p>
        )}
      </div>

      <h2>This Week’s Teams</h2>
      {!teamsLocked && (
        <p style={{ color: "#f00" }}>
          Teams aren’t final until locked. Pay before the cutoff!
        </p>
      )}

      {teams.length === 0 ? (
        <p>Nobody or not enough paid yet.</p>
      ) : (
        teams.map((team, idx) => (
          <div key={idx} className="team-section">
            <h3>Team {idx + 1}</h3>
            <ul>
              {team.map((player) => (
                <li key={player.id}>{player.name}</li>
              ))}
            </ul>
            <div className="gk-rotation">
              <strong>Goalkeeper Schedule:</strong>
              {getGKRotation(team).map((gkInfo) => (
                <p key={gkInfo.game}>
                  Game {gkInfo.game}: {gkInfo.name}
                </p>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// ====== Booking Page Component ======
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

  // For toggling between "I Have Paid" button and thank-you note
  const [hasPaid, setHasPaid] = useState(false);

  // For pop-up feedback
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
        setPaidPlayers(data.filter((applicant) => applicant.status === "Paid"));
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
    // Switch out the button with a slick "Thanks" message
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        <div className="form-group">
          <label>Spots:</label>
          <input
            type="number"
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
