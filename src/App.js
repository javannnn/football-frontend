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
      <p>{message || "An unexpected error occurred."}</p>
      <button onClick={onClose}>OK</button>
    </Modal>
  );
};

// ====== Booking Page Component ======
const PRICE_PER_SLOT = 800;

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
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch applicants.");
        return res.json();
      })
      .then((data) => {
        setApplicants(data);
        setPaidPlayers(data.filter((applicant) => applicant.status === "Paid"));
      })
      .catch((err) => openNotify(err.message));
  }, []);

  const handleBook = () => {
    fetch(`${process.env.REACT_APP_API_URL}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slots: spots }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to book slot.");
        return res.json();
      })
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
      .catch((err) => openNotify(err.message));
  };

  const handlePaymentConfirmation = () => {
    setHasPaid(true);
  };

  const paidCount = paidPlayers.length;
  const progressPercent = (paidCount / 20) * 100;

  return (
    <div className="app-container">
      <h1>Yerer Football Booking App</h1>

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

      <h2>Applicants ({paidCount}/20 Confirmed)</h2>
      <div className="progress-bar">
        <span
          style={{
            width: `${progressPercent}%`,
            backgroundColor:
              progressPercent < 50
                ? "#4caf50"
                : progressPercent < 75
                ? "#ffeb3b"
                : progressPercent < 90
                ? "#ffa000"
                : "#f44336",
          }}
        />
        <div className="progress-bar-label">{Math.floor(progressPercent)}%</div>
      </div>

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
            src="https://muhkjvufppfapjkoupgc.supabase.co/storage/v1/object/public/static/chat_qr_code.jpg"
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

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BookingPage />} />
      </Routes>
    </Router>
  );
};

export default App;
