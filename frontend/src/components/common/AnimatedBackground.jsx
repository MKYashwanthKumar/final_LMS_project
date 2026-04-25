const particles = Array.from({ length: 10 });

const AnimatedBackground = ({ variant = "default" }) => {
  return (
    <div className={`animated-background animated-${variant}`}>
      <div className="floating-blob blob-primary" />
      <div className="floating-blob blob-secondary" />
      <div className="floating-blob blob-tertiary" />

      <div className="gradient-wave wave-one" />
      <div className="gradient-wave wave-two" />

      <div className="grid-overlay" />

      {particles.map((_, index) => (
        <span key={index} className={`bg-particle particle-${index + 1}`} />
      ))}
    </div>
  );
};

export default AnimatedBackground;