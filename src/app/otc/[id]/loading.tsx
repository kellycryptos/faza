export default function Loading() {
  return (
    <div
      style={{
        maxWidth: 680,
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
          width: "50%",
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
          borderRadius: 10,
          height: 90,
          opacity: 0.5,
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "0.65rem",
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: "var(--surface-muted)",
              borderRadius: 10,
              height: 60,
              opacity: 0.5,
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>
    </div>
  );
}
