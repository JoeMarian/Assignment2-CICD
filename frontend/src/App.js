import React from "react";

function App() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Smart Cloud Monitor</h1>
        <p style={styles.subtitle}>
          A unified platform to visualize, analyze, and monitor IoT systems effortlessly.
        </p>
        <button style={styles.button}>Get Started</button>
      </header>

      <section style={styles.features}>
        <div style={styles.card}>
          <h3>📊 Real-time Dashboard</h3>
          <p>Track live metrics and visualize device data in an intuitive dashboard.</p>
        </div>
        <div style={styles.card}>
          <h3>🔒 Secure Data</h3>
          <p>End-to-end encryption ensures your IoT data stays private and protected.</p>
        </div>
        <div style={styles.card}>
          <h3>⚙️ Easy Integration</h3>
          <p>Connect devices and APIs seamlessly with simple configuration.</p>
        </div>
      </section>

      <footer style={styles.footer}>
        <p>© 2025 Smart Cloud Monitor. All rights reserved.</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    color: "#fff",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    textAlign: "center",
    padding: "2rem",
  },
  header: {
    marginTop: "5rem",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: "1.1rem",
    margin: "1rem auto",
    maxWidth: "500px",
    color: "#dbe9ff",
  },
  button: {
    backgroundColor: "#00c4ff",
    color: "#fff",
    border: "none",
    padding: "0.8rem 1.6rem",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: "1rem",
  },
  features: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "1rem",
    marginTop: "4rem",
  },
  card: {
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    padding: "1.5rem",
    width: "280px",
    textAlign: "left",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
  },
  footer: {
    marginTop: "3rem",
    borderTop: "1px solid rgba(255,255,255,0.2)",
    paddingTop: "1rem",
    fontSize: "0.9rem",
    color: "#cfe0ff",
  },
};

export default App;
