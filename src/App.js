import React, { useState, useEffect } from 'react';
import './App.css'; // Create or modify a CSS file for custom styles.

const App = () => {
  const [name, setName] = useState('');
  const [spots, setSpots] = useState(1);
  const [applicants, setApplicants] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch applicants on load
  const fetchApplicants = () => {
    fetch(`${process.env.REACT_APP_API_URL}/applicants`)
      .then((res) => res.json())
      .then((data) => setApplicants(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleAdminLogin = () => {
    const password = prompt("Enter Admin Password:");
    if (password === "supersecurepassword") {
      const applicantId = prompt("Enter Applicant ID to update status:");
      const newStatus = prompt("Enter new status (Paid/Pending):");
      fetch(`${process.env.REACT_APP_API_URL}/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(applicantId), status: newStatus }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            alert(data.error);
          } else {
            alert(data.message);
            fetchApplicants(); // Refresh the table
          }
        })
        .catch((err) => console.error(err));
    } else {
      alert("Incorrect Password!");
    }
  };

  const handlePaymentInfo = () => {
    if (!name || spots <= 0) {
      setErrorMessage('Name and valid number of spots are required.');
      return;
    }
    setErrorMessage('');
    const totalAmount = spots * 800;
    alert(`Please pay ETB ${totalAmount} using the QR code or phone number +251910187397.`);
    setName('');
    setSpots(1);
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
        <button onClick={handlePaymentInfo}>Get Payment Info</button>
        {errorMessage && <p className="error">{errorMessage}</p>}
      </div>

      <h2>Applicants ({applicants.filter((a) => a.status === 'Paid').length}/20 Confirmed)</h2>
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
          {applicants.map((applicant) => (
            <tr key={applicant.id}>
              <td>{applicant.id}</td>
              <td>{applicant.name}</td>
              <td>{applicant.slots}</td>
              <td>{applicant.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="payment-info">
        <h2>Payment Instructions</h2>
        <p>Please use the QR code below or the phone number <strong>+251910187397</strong> to make your payment. The amount depends on the number of spots selected.</p>
        <p><strong>Price per spot: ETB 800</strong></p>
        <img src={`${process.env.REACT_APP_API_URL}/static/chat_qr_code.jpg`} alt="QR Code" className="qr-code" />
      </div>
    </div>
  );
};

export default App;
