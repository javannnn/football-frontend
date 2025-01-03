import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import "./App.css";
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from "react-router-dom";

// ====== Admin Login Component ======
const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    const ADMIN_PASSWORD = "supersecurepassword"; // Replace with real password
    if (password === ADMIN_PASSWORD) {
      alert("Login successful!");
      navigate("/admin");
    } else {
      alert("Incorrect password!");
    }
  };

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
          alert(data.error);
        } else {
          alert(data.message);
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
      .catch((err) => console.error(err));
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
      <Link to="/" className="back-link">
        Back to Booking
      </Link>
    </div>
  );
};

// ====== Game Rules & Teams Component ======
const GameRulesAndTeams = () => {
  const [applicants, setApplicants] = useState([]);
  // Countdown + Locking
  const [timeLeft, setTimeLeft] = useState("");
  const [teamsLocked, setTeamsLocked] = useState(false);
  // We store the generated teams
  const [teams, setTeams] = useState([]);

  // Set the big game date: Jan 6, 2025, 00:00
  const gameDate = new Date(2025, 0, 6, 0, 0, 0).getTime();
  const lockThreshold = 24 * 60 * 60 * 1000; // 24 hours in ms

  useEffect(() => {
    // fetch applicants
    fetch(`${process.env.REACT_APP_API_URL}/applicants`)
      .then((res) => res.json())
      .then((data) => setApplicants(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    // Calculate and update countdown every second
    const timer = setInterval(() => {
      const now = Date.now();
      const distance = gameDate - now;
      if (distance <= lockThreshold) {
        setTeamsLocked(true);
      }
      if (distance < 0) {
        // Game already started or passed
        setTimeLeft("The match has started!");
        clearInterval(timer);
      } else {
        // Format time left as days/hours/mins/secs
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(
          `${days}d ${hours}h ${mins}m ${secs}s left until kickoff`
        );
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // If teams are locked, freeze the teams at that moment
  useEffect(() => {
    if (teamsLocked) {
      // Generate final teams if not already done
      if (teams.length === 0) {
        createTeams();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamsLocked, applicants]);

  const createTeams = () => {
    const paidPlayers = applicants.filter((a) => a.status === "Paid");
    // Shuffle players for randomness
    const shuffled = [...paidPlayers].sort(() => 0.5 - Math.random());
    const newTeams = [];
    let teamCount = Math.min(3, Math.ceil(shuffled.length / 5));

    let index = 0;
    for (let i = 0; i < teamCount; i++) {
      const teamSize =
        Math.floor(shuffled.length / teamCount) +
        (i < (shuffled.length % teamCount) ? 1 : 0);
      const slice = shuffled.slice(index, index + teamSize);
      index += teamSize;
      newTeams.push(slice);
    }
    setTeams(newTeams);
  };

  // For GK rotation, let’s assume up to 5 games. 
  const maxGames = 5;
  const getGKRotation = (team) => {
    // For game i, the GK is team[i % team.length].
    // That means if team has fewer players than maxGames, we cycle back around.
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
      <p>1. Three teams if enough players (paid). The loser steps out next game.</p>
      <p>2. Each match is 10 minutes or the first team to score 2 goals.</p>
      <p>3. If 0-0 after 10 minutes, add 3 minutes. Still 0-0? Penalties decide who goes out.</p>
      <p>4. We play Monday, January 6th, 2025, from 12:00 AM to 8:00 AM. </p>
      <p>5. Teams auto-selected from paid players. One GK per game, then rotate for the next.</p>
      <p>6. Once you lose, you rest for one match, then return to topple the winners.</p>
      <hr />
      <div className="countdown-timer">
        {timeLeft && !teamsLocked && <p>{timeLeft}</p>}
        {teamsLocked ? (
          <p className="locked">Teams are locked!</p>
        ) : (
          <p className="unlocked">Teams will lock 24 hours before kickoff.</p>
        )}
      </div>

      <h2>This Week’s Teams</h2>
      {!teamsLocked && (
        <p style={{ color: "#f00" }}>
          Note: Teams aren’t final until locked. Keep paying before the cutoff!
        </p>
      )}

      {teams.length === 0 ? (
        <p>Nobody (or not enough) paid yet, or teams not generated. Pay up, folks!</p>
      ) : (
        teams.map((team, idx) => (
          <div key={idx} className="team-section">
            <h3>Team {idx + 1}</h3>
            {/* Show normal roster */}
            <ul>
              {team.map((player) => (
                <li key={player.id}>{player.name}</li>
              ))}
            </ul>
            {/* Show GK rotation for maxGames */}
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
// Decide the fill color based on progress
const getProgressColor = (percent) => {
  if (percent < 50) {
    return "#4caf50"; // green
  } else if (percent < 75) {
    return "#ffeb3b"; // yellow
  } else if (percent < 90) {
    return "#ffa000"; // orange
  } else {
    return "#f44336"; // red
  }
};

const BookingPage = () => {
  const [name, setName] = useState("");
  const [spots, setSpots] = useState(1);
  const [applicants, setApplicants] = useState([]);
  const [paidPlayers, setPaidPlayers] = useState([]);
  const [qrModalIsOpen, setQrModalIsOpen] = useState(false);

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
          alert(data.error);
        } else {
          setQrModalIsOpen(true); // Show QR Code modal
          setName("");
          setSpots(1);
        }
      })
      .catch((err) => console.error(err));
  };

  const handlePaymentConfirmation = () => {
    alert("Payment confirmed. Please wait for admin approval.");
    setQrModalIsOpen(false);
  };

  // Calculate progress
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
      <h2>
        Applicants ({paidCount}/20 Confirmed)
      </h2>
      <div className="progress-bar">
        <span
          style={{
            width: `${progressPercent}%`,
            backgroundColor: getProgressColor(progressPercent),
          }}
        />
        <div className="progress-bar-label">
          {Math.floor(progressPercent)}%
        </div>
      </div>

      {/* QR Modal */}
      <Modal
        isOpen={qrModalIsOpen}
        onRequestClose={() => setQrModalIsOpen(false)}
        contentLabel="QR Code Payment"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Payment Instructions</h2>
        <p>Use the QR code or phone number to make your payment:</p>
        <img
          src={`${process.env.REACT_APP_API_URL}/static/chat_qr_code.jpg`}
          alt="QR Code"
          className="qr-code"
        />
        <button onClick={handlePaymentConfirmation}>I Have Paid</button>
      </Modal>

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
