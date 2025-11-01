import React, { useState } from "react";

function App() {
  const [status, setStatus] = useState("");
  const [mood, setMood] = useState("");
  const [response, setResponse] = useState("");

  const checkStatus = async () => {
    try {
      const res = await fetch("http://localhost:5000/status");
      const data = await res.json();
      setStatus(data.status);
    } catch (error) {
      setStatus("Error connecting to backend");
    }
  };

  const submitMood = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });
      const data = await res.json();
      setResponse(data.success ? `Mood set as "${data.mood}"` : "Error setting mood");
    } catch (error) {
      setResponse("Error submitting mood");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: 24 }}>
      <h1>MoodSync Frontend</h1>

      <button onClick={checkStatus}>Check Backend Status</button>
      <p>Backend status: {status}</p>

      <form onSubmit={submitMood} style={{ marginTop: 20 }}>
        <label>
          Your mood:
          <input
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            style={{ marginLeft: 10 }}
          />
        </label>
        <button type="submit" style={{ marginLeft: 10 }}>Submit</button>
      </form>
      <p>{response}</p>
    </div>
  );
}

export default App;
