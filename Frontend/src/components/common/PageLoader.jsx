export default function PageLoader({ message = "Loading..." }) {
  return (
    <main className="dashboard-page">
      <section className="status-card">
        <p>{message}</p>
      </section>
    </main>
  );
}
