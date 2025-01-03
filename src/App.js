import React, { useState, useEffect } from 'react';
import './App.css'; // Create or modify a CSS file for custom styles.

const App = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [spots, setSpots] = useState(1);
  const [applicants, setApplicants] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch applicants on load
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/applicants`)
      .then((res) => res.json())
      .then((data) => setApplicants(data))
      .catch((err) => console.error(err));
  }, []);

  const handleBook = () => {
    if (!name || !phone) {
      setErrorMessage('Name and phone number are required');
      return;
    }
    setErrorMessage('');
    fetch(`${process.env.REACT_APP_API_URL}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, spots }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setErrorMessage(data.error);
        } else {
          alert('Booking request submitted!');
          setName('');
          setPhone('');
          setSpots(1);
          fetchApplicants(); // Refresh the table
        }
      })
      .catch((err) => console.error(err));
  };

  const fetchApplicants = () => {
    fetch(`${process.env.REACT_APP_API_URL}/applicants`)
      .then((res) => res.json())
      .then((data) => setApplicants(data))
      .catch((err) => console.error(err));
  };

  return (
    <div className="app-container">
      <h1>Yerer Football Booking App</h1>
      <div className="form-container">
        <button className="admin-login-btn">Admin Login</button>
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
          <label>Phone:</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter your phone number"
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

      <h2>Applicants ({applicants.filter((a) => a.status === 'Paid').length}/20 Confirmed)</h2>
      <table className="applicants-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Spots</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {applicants.map((applicant) => (
            <tr key={applicant.id}>
              <td>{applicant.name}</td>
              <td>{applicant.spots}</td>
              <td>{applicant.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
