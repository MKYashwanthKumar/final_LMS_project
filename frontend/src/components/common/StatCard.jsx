const StatCard = ({ label, value, badge, tone = "info" }) => {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`} />
      <div className="stat-body">
        <span>{label}</span>
        <strong>{value}</strong>
        {badge && <small className={`badge badge-${tone}`}>{badge}</small>}
      </div>
    </div>
  );
};

export default StatCard;