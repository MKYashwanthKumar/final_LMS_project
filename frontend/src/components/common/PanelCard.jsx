const PanelCard = ({ title, rightSlot, children }) => {
  return (
    <section className="panel-card">
      {(title || rightSlot) && (
        <div className="panel-header">
          <h3>{title}</h3>
          {rightSlot && <div>{rightSlot}</div>}
        </div>
      )}
      <div className="panel-body">{children}</div>
    </section>
  );
};

export default PanelCard;