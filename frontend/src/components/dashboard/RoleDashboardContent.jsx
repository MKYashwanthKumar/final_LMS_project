import PanelCard from "../common/PanelCard";
import StatsGrid from "./StatsGrid";
import ActivityList from "./ActivityList";
import DataTable from "./DataTable";
import BookGrid from "./BookGrid";

const RoleDashboardContent = ({ content }) => {
  return (
    <>
      {content.actions?.length > 0 && (
        <div className="action-strip">
          {content.actions.map((action, index) => (
            <button
              key={action}
              className={`action-btn ${
                index === 0 ? "primary" : index === 1 ? "secondary" : "muted"
              }`}
            >
              {action}
            </button>
          ))}
        </div>
      )}

      {content.stats?.length > 0 && <StatsGrid stats={content.stats} />}

      {content.summaryCards?.length > 0 && (
        <PanelCard title="User Distribution by Role">
          <div className="summary-grid">
            {content.summaryCards.map((card) => (
              <div className="summary-card" key={card.title}>
                <strong>{card.value}</strong>
                <span>{card.title}</span>
              </div>
            ))}
          </div>
        </PanelCard>
      )}

      {content.activities && (
        <PanelCard title={content.activities.title}>
          <ActivityList items={content.activities.items} />
        </PanelCard>
      )}

      {content.table && (
        <PanelCard title={content.table.title}>
          <DataTable columns={content.table.columns} rows={content.table.rows} />
        </PanelCard>
      )}

      {content.books && (
        <PanelCard title={content.books.title}>
          <BookGrid books={content.books.items} actionLabel={content.books.actionLabel} />
        </PanelCard>
      )}
    </>
  );
};

export default RoleDashboardContent;