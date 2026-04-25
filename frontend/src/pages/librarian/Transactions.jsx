import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  RotateCcw,
  ShieldAlert,
  BadgeIndianRupee,
  Download
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import PanelCard from "../../components/common/PanelCard";
import StatsGrid from "../../components/dashboard/StatsGrid";
import api from "../../services/apiClient";
import { roleNavConfig, roleSearchPlaceholders } from "../../data/dashboardData";

const toCsv = (rows) => {
  const headers = [
    "Book",
    "ISBN",
    "Borrower",
    "Role",
    "Issue Date",
    "Due Date",
    "Return Date",
    "Status",
    "Fine"
  ];

  const lines = rows.map((item) => [
    item.bookTitle,
    item.bookIsbn,
    item.borrowerName,
    item.borrowerRole,
    item.issueDate ? new Date(item.issueDate).toLocaleDateString() : "",
    item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "",
    item.returnDate ? new Date(item.returnDate).toLocaleDateString() : "",
    item.status,
    item.fine || 0
  ]);

  return [headers, ...lines]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
};

const buildNotifications = (transactions) => {
  return transactions
    .filter((item) => item.status === "overdue")
    .slice(0, 8)
    .map((item) => ({
      id: item._id,
      title: "Fee pending",
      message: `${item.borrowerName} has overdue fine on ${item.bookTitle}.`,
      time: new Date(item.dueDate).toLocaleDateString()
    }));
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadTransactions = async () => {
    try {
      const { data } = await api.get("/transactions");
      setTransactions(data.transactions || []);
    } catch (error) {
      toast.error("Failed to load transactions");
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const text = searchQuery.toLowerCase();
      if (!text) return true;

      return [
        item.bookTitle,
        item.bookIsbn,
        item.borrowerName,
        item.borrowerRole,
        item.status,
        item.fine
      ].some((value) => String(value || "").toLowerCase().includes(text));
    });
  }, [transactions, searchQuery]);

  const notifications = useMemo(
    () => buildNotifications(transactions),
    [transactions]
  );

  const stats = useMemo(() => {
    return [
      {
        label: "Total Issues",
        value: String(transactions.length),
        badge: "Records",
        tone: "info",
        icon: ClipboardList
      },
      {
        label: "Returned",
        value: String(transactions.filter((item) => item.status === "returned").length),
        badge: "Closed",
        tone: "success",
        icon: RotateCcw
      },
      {
        label: "Overdue",
        value: String(transactions.filter((item) => item.status === "overdue").length),
        badge: "Late",
        tone: "danger",
        icon: ShieldAlert
      },
      {
        label: "Total Fines",
        value: `Rs. ${transactions.reduce((sum, item) => sum + Number(item.fine || 0), 0)}`,
        badge: "Collected",
        tone: "warning",
        icon: BadgeIndianRupee
      }
    ];
  }, [transactions]);

  const exportCsv = () => {
    const csv = toCsv(filteredTransactions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "librarian-issue-return-report.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toast.success("Report exported");
  };

  return (
    <DashboardLayout
      role="librarian"
      title="Transactions Report"
      searchPlaceholder={roleSearchPlaceholders.librarian}
      navItems={roleNavConfig.librarian}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      notifications={notifications}
    >
      <StatsGrid stats={stats} />

      <div className="action-strip">
        <button className="action-btn primary" onClick={exportCsv}>
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <PanelCard title="Issue / Return Report">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Borrower</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Fine</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((item) => (
                  <tr key={item._id}>
                    <td>
                      {item.bookTitle}
                      <br />
                      <span style={{ color: "#9fb4d8", fontSize: 12 }}>{item.bookIsbn}</span>
                    </td>
                    <td>
                      {item.borrowerName}
                      <br />
                      <span style={{ color: "#9fb4d8", fontSize: 12 }}>{item.borrowerRole}</span>
                    </td>
                    <td>{item.issueDate ? new Date(item.issueDate).toLocaleDateString() : "-"}</td>
                    <td>{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "-"}</td>
                    <td>{item.returnDate ? new Date(item.returnDate).toLocaleDateString() : "-"}</td>
                    <td>
                      <span
                        className={
                          item.status === "returned"
                            ? "badge badge-success"
                            : item.status === "overdue"
                            ? "badge badge-danger"
                            : "badge badge-info"
                        }
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>Rs. {item.fine || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No matching transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </DashboardLayout>
  );
};

export default Transactions;