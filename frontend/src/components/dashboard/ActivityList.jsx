const ActivityList = ({ items = [] }) => {
  return (
    <div className="activity-list">
      {items.map((item, index) => (
        <div className="activity-item" key={`${item}-${index}`}>
          <span className="activity-dot" />
          <p>{item}</p>
          <small className="badge badge-success">Active</small>
        </div>
      ))}
    </div>
  );
};

export default ActivityList;