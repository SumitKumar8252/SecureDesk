export default function MessageBanner({ type = "info", message }) {
  if (!message) {
    return null;
  }

  return <p className={`message ${type}`}>{message}</p>;
}
