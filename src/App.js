import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [name, setName] = useState('');
  const [spots, setSpots] = useState(1);
  const [applicants, setApplicants] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);

  const fetchApplicants = () => {
    fetch(`${process.env.REACT_APP_API_URL}/applicants`)
      .then((res) => res.json())
      .then((data) => setApplicants(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleBook = () => {
    if (!name || spots <= 0) {
      setErrorMessage('Name and valid number of spots are required.');
      return;
    }

    setErrorMessage('');
    fetch(`${process.env.REACT_APP_API_URL}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slots: spots }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setErrorMessage(data.error);
        } else {
          setPaymentDetails(data.payment_details);
        }
      })
      .catch((err) => console.error(err));
  };

  const handlePaymentConfirm = () => {
    alert("Payment confirmation sent! Your booking will be verified by the admin.");
  };

  const handleAdminLogin = () => {
    const password = prompt("Enter Admin Password:");
    if (password === "supersecurepassword") {
      fetch(`${process.env.REACT_APP_API_URL}/admin-dashboard`)
        .then((res) => res.json())
        .then((data) => setDashboardStats(data))
        .catch((err) => console.error(err));
    } else {
      alert("Incorrect Password!");
    }
  };

  const progressPercentage = () => {
    const confirmed = applicants.filter((a) => a.status === "Confirmed").reduce((sum, a) => sum + a.slots, 0);
    return (confirmed / 20) * 100;
  };

  return (
    <div className="app-container">
      <h1>Yerer Football Booking App</h1>
      <div className="form-container">
        <button className="admin-login-btn" onClick={handleAdminLogin}>Admin Login</button>
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
        {errorMessage && <p className="error">{errorMessage}</p>}
      </div>

      {paymentDetails && (
        <div className="payment-info">
          <h2>Payment Instructions</h2>
          <p>Please pay ETB {paymentDetails.amount} using the QR code or phone number <strong>{paymentDetails.phone_number}</strong>.</p>
          <img src={paymentDetails.qr_code} alt="QR Code" className="qr-code" />
          <button onClick={handlePaymentConfirm}>I Have Paid</button>
        </div>
      )}

      <h2>Confirmed Slots</h2>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{
            width: `${progressPercentage()}%`,
            background: progressPercentage() < 50 ? "green" : progressPercentage() < 75 ? "yellow" : "red",
          }}
        ></div>
      </div>

      {dashboardStats && (
        <div className="admin-dashboard">
          <h2>Admin Dashboard</h2>
          <p>Total Slots: {dashboardStats.total_slots}</p>
          <p>Confirmed Slots: {dashboardStats.confirmed_slots}</p>
          <p>Pending Slots: {dashboardStats.pending_slots}</p>
          <table className="applicants-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Spots</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardStats.applicants.map((applicant) => (
                <tr key={applicant.id}>
                  <td>{applicant.id}</td>
                  <td>{applicant.name}</td>
                  <td>{applicant.slots}</td>
                  <td>{applicant.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default App;
