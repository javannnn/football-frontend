import React, { useState, useEffect } from "react";

const API_URL = process.env.REACT_APP_API_URL; // Backend API URL

function App() {
    const [name, setName] = useState("");
    const [spots, setSpots] = useState(1);
    const [message, setMessage] = useState("");
    const [applicants, setApplicants] = useState([]);
    const [adminLoggedIn, setAdminLoggedIn] = useState(false);
    const [confirmedCount, setConfirmedCount] = useState(0);

    // Fetch applicants and confirmed count
    useEffect(() => {
        fetch(`${API_URL}/applicants`)
            .then((res) => res.json())
            .then((data) => {
                setApplicants(data);
                setConfirmedCount(data.filter((app) => app.status === "Paid").length);
            });
    }, []);

    // Handle Booking Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (confirmedCount >= 20) {
            setMessage("Booking is full!");
            return;
        }
        try {
            const response = await fetch(`${API_URL}/book`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, spots }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage("Booking successful! Please complete payment via Telebirr.");
            } else {
                setMessage(`Error: ${data.error || "Unknown error"}`);
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.");
        }
    };

    // Admin Login Logic
    const handleAdminLogin = () => {
        const password = prompt("Enter Admin Password:");
        if (password === "admin123") {
            setAdminLoggedIn(true);
        } else {
            alert("Incorrect password!");
        }
    };

    // Render Admin Actions
    const handleStatusChange = async (id, status) => {
        await fetch(`${API_URL}/applicants/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        window.location.reload();
    };

    return (
        <div className="container mx-auto p-4">
            <header className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Yerer Football Booking App</h1>
                {!adminLoggedIn ? (
                    <button
                        onClick={handleAdminLogin}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Admin Login
                    </button>
                ) : (
                    <p className="text-green-500">Admin Logged In</p>
                )}
            </header>

            <form onSubmit={handleSubmit} className="mb-8">
                <div className="mb-4">
                    <label className="block mb-2 font-bold">Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border p-2 w-full"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2 font-bold">Spots:</label>
                    <input
                        type="number"
                        value={spots}
                        onChange={(e) => setSpots(e.target.value)}
                        min="1"
                        max="20"
                        className="border p-2 w-full"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className={`bg-green-500 text-white px-4 py-2 rounded ${
                        confirmedCount >= 20 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={confirmedCount >= 20}
                >
                    Book
                </button>
            </form>

            {message && <p className="text-red-500">{message}</p>}

            <h2 className="text-xl font-bold mb-4">Applicants ({confirmedCount}/20 Confirmed)</h2>
            <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Spots</th>
                        <th className="border p-2">Status</th>
                        {adminLoggedIn && <th className="border p-2">Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {applicants.map((applicant) => (
                        <tr key={applicant.id}>
                            <td className="border p-2">{applicant.name}</td>
                            <td className="border p-2">{applicant.spots}</td>
                            <td className="border p-2">{applicant.status}</td>
                            {adminLoggedIn && (
                                <td className="border p-2">
                                    <button
                                        onClick={() => handleStatusChange(applicant.id, "Paid")}
                                        className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                                    >
                                        Mark as Paid
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(applicant.id, "Unpaid")}
                                        className="bg-red-500 text-white px-2 py-1 rounded"
                                    >
                                        Mark as Unpaid
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default App;
