const API_URL = process.env.API_URL ?? "http://localhost:3001";

interface DbStatus {
  connected: boolean;
  error?: string;
}

interface Health {
  status: string;
  appDb: DbStatus;
  targetDb: DbStatus;
}

async function getHealth(): Promise<Health | null> {
  try {
    const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Health;
  } catch {
    return null;
  }
}

function Pill({ up }: { up: boolean }) {
  return (
    <span className={`pill ${up ? "ok" : "bad"}`}>
      {up ? "connected" : "down"}
    </span>
  );
}

export default async function Home() {
  const health = await getHealth();

  return (
    <main>
      <h1>Query Performance Advisor</h1>
      <p className="muted">
        Detects slow queries on a target Postgres database, explains why they
        are slow, suggests fixes, and validates them against a shadow copy.
      </p>

      <div className="card">
        <h2>Backend connectivity</h2>
        {health ? (
          <>
            <div className="row">
              <span>App metadata DB</span>
              <Pill up={health.appDb.connected} />
            </div>
            <div className="row">
              <span>Target DB (under analysis)</span>
              <Pill up={health.targetDb.connected} />
            </div>
          </>
        ) : (
          <p className="muted">
            Could not reach the backend at {API_URL}. Start it with{" "}
            <code>npm run start:dev</code> in <code>backend/</code>.
          </p>
        )}
      </div>
    </main>
  );
}
