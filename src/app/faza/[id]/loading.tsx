export default function Loading() {
  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "3rem 1.25rem 5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
      }}
    >
      <div
        style={{
          width: 80,
          height: 20,
          background: "var(--surface)",
          borderRadius: 4,
          opacity: 0.6,
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      <div
        style={{
          width: "60%",
          height: 36,
          background: "var(--surface)",
          borderRadius: 6,
          opacity: 0.6,
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          height: 120,
          opacity: 0.5,
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          height: 70,
          opacity: 0.5,
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
    </div>
  );
}
