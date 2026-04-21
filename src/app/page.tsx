export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Agent API</h1>
      <p>Available endpoints:</p>
      <ul>
        <li><code>GET /api/health</code> — Health check</li>
        <li><code>GET /api/agents</code> — List agents</li>
        <li><code>POST /api/agents</code> — Create agent</li>
        <li><code>GET /api/agents/:id</code> — Get agent by ID</li>
        <li><code>PUT /api/agents/:id</code> — Update agent</li>
        <li><code>DELETE /api/agents/:id</code> — Delete agent</li>
      </ul>
    </main>
  );
}
