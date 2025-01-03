import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [applicants, setApplicants] = useState([]);

  const fetchApplicants = () => {
    fetch(`${process.env.REACT_APP_API_URL}/applicants`)
      .then((res) => res.json())
      .then((data) => setApplicants(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleUpdate = (id) => {
    const name = prompt("Enter new name:");
    const spots = prompt("Enter new spots:");
    const status = prompt("Enter new status (Paid/Pending):");
    fetch(`${process.env.REACT_APP_API_URL}/update-applicant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, spots, status }),
    })
      .then((res) => res.json())
      .then(() => fetchApplicants())
      .catch((err) => console.error(err));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure?")) {
      fetch(`${process.env.REACT_APP_API_URL}/delete-applicant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
        .then((res) => res.json())
        .then(() => fetchApplicants())
        .catch((err) => console.error(err));
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Spots</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applicants.map((applicant) => (
            <tr key={applicant.id}>
              <td>{applicant.id}</td>
              <td>{applicant.name}</td>
              <td>{applicant.spots}</td>
              <td>{applicant.status}</td>
              <td>
                <button onClick={() => handleUpdate(applicant.id)}>Edit</button>
                <button onClick={() => handleDelete(applicant.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
