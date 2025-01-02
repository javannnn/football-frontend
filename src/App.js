import React, { useState } from "react";

const API_URL = process.env.REACT_APP_API_URL; // Backend API URL from .env file

function App() {
    const [name, setName] = useState("");
    const [spots, setSpots] = useState(1);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/book`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, spots }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage("Booking Successful!");
            } else {
                setMessage(`Error: ${data.error || "Unknown error"}`);
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.");
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Football Booking</h1>
            <form onSubmit={handleSubmit} style={{ display: "inline-block", textAlign: "left" }}>
                <div style={{ marginBottom: "15px" }}>
                    <label>
                        <strong>Name:</strong>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{
                                marginLeft: "10px",
                                padding: "5px",
                                fontSize: "16px",
                                width: "300px",
                            }}
                        />
                    </label>
                </div>
                <div style={{ marginBottom: "15px" }}>
                    <label>
                        <strong>Spots:</strong>
                        <input
                            type="number"
                            value={spots}
                            onChange={(e) => setSpots(e.target.value)}
                            min="1"
                            max="20"
                            required
                            style={{
                                marginLeft: "10px",
                                padding: "5px",
                                fontSize: "16px",
                                width: "300px",
                            }}
                        />
                    </label>
                </div>
                <div style={{ textAlign: "center" }}>
                    <button
                        type="submit"
                        style={{
                            backgroundColor: "#4CAF50",
                            color: "white",
                            border: "none",
                            padding: "10px 20px",
                            fontSize: "16px",
                            cursor: "pointer",
                        }}
                    >
                        Book
                    </button>
                </div>
            </form>
            {message && (
                <p style={{ color: message.includes("Error") ? "red" : "green", marginTop: "20px" }}>
                    {message}
                </p>
            )}
        </div>
    );
}

export default App;
