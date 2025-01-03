import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';

const BookingPage = () => {
  const [name, setName] = useState('');
  const [spots, setSpots] = useState(1);
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/applicants`)
      .then((res) => res.json())
      .then((data) => setApplicants(data))
      .catch((err) => console.error(err));
  }, []);

  const handleBook = () => {
    fetch(`${process.env.REACT_APP_API_URL}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slots: spots }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          alert(`Pay ETB ${data.payment_details.amount} using the QR code.`);
          setName('');
          setSpots(1);
        }
      })
      .catch((err) => console.error(err));
  };

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
      <div className="payment-info">
        <p>Use this QR code or phone number to make your payment:</p>
        <img
          src={`${process.env.REACT_APP_API_URL}/static/chat_qr_code.jpg`}
          alt="QR Code"
        />
      </div>
      <Link to="/admin" className="admin-link">Admin Login</Link>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={BookingPage} />
        <Route path="/admin" component={AdminDashboard} />
      </Switch>
    </Router>
  );
};

export default App;
