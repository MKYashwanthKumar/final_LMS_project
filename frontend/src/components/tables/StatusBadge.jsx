const StatusBadge = ({ label, tone = "info" }) => {
  return <span className={`badge badge-${tone}`}>{label}</span>;
};

export default StatusBadge;