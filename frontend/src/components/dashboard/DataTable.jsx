import StatusBadge from "../tables/StatusBadge";

const renderCell = (value) => {
  if (Array.isArray(value)) {
    return (
      <div className="inline-actions">
        {value.map((item, index) => (
          <span key={index}>{renderCell(item)}</span>
        ))}
      </div>
    );
  }

  if (value && typeof value === "object") {
    if (value.type === "badge") {
      return <StatusBadge label={value.label} tone={value.tone} />;
    }

    if (value.type === "stack") {
      return (
        <div className="table-stack">
          <strong>{value.title}</strong>
          <span>{value.subtitle}</span>
        </div>
      );
    }

    if (value.type === "button") {
      return <button className={`table-pill table-pill-${value.tone || "primary"}`}>{value.label}</button>;
    }

    if (value.type === "amount") {
      return <span className={value.tone === "danger" ? "text-danger" : ""}>{value.label}</span>;
    }

    if (value.label) {
      return value.label;
    }
  }

  return value;
};

const DataTable = ({ columns = [], rows = [] }) => {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id || rowIndex}>
              {columns.map((column) => (
                <td key={column.key}>{renderCell(row[column.key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;