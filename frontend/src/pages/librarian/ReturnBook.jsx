import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  RotateCcw,
  ClipboardList,
  ShieldAlert,
  BadgeIndianRupee,
  CheckCircle2
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PanelCard from "../../components/common/PanelCard";
import StatsGrid from "../../components/dashboard/StatsGrid";
import api from "../../services/apiClient";
import { roleNavConfig, roleSearchPlaceholders } from "../../data/dashboardData";

const buildNotifications = (transactions) => {
  return transactions
    .filter((item) => item.status === "overdue")
    .slice(0, 8)
    .map((item) => ({
      id: item._id,
      title: "Pending overdue return",
      message: `${item.borrowerName} should return ${item.bookTitle}.`,
      time: new Date(item.dueDate).toLocaleDateString()
    }));
};

const ReturnBook = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingId, setProcessingId] = useState("");

  const loadTransactions = async () => {
    try {
      const { data } = await api.get("/transactions");
      setTransactions(data.transactions || []);
    } catch (error) {
      toast.error("Failed to load return data");
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const activeTransactions = useMemo(
    () => transactions.filter((item) => ["active", "overdue"].includes(item.status)),
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    return activeTransactions.filter((item) => {
      const text = searchQuery.toLowerCase();
      if (!text) return true;

      return [
        item.bookTitle,
        item.bookIsbn,
        item.borrowerName,
        item.borrowerRole,
        item.status
      ].some((value) => String(value || "").toLowerCase().includes(text));
    });
  }, [activeTransactions, searchQuery]);

  const notifications = useMemo(
    () => buildNotifications(activeTransactions),
    [activeTransactions]
  );

  const stats = useMemo(() => {
    const overdue = activeTransactions.filter((item) => item.status === "overdue");
    const totalPendingFine = overdue.reduce((sum, item) => sum + Number(item.fine || 0), 0);
    const returnedToday = transactions.filter((item) => {
      if (!item.returnDate) return false;
      return new Date(item.returnDate).toDateString() === new Date().toDateString();
    }).length;

    return [
      {
        label: "Active Returns",
        value: String(activeTransactions.length),
        badge: "Open",
        tone: "info",
        icon: ClipboardList
      },
      {
        label: "Overdue",
        value: String(overdue.length),
        badge: "Attention",
        tone: "danger",
        icon: ShieldAlert
      },
      {
        label: "Fine Pending",
        value: `Rs. ${totalPendingFine}`,
        badge: "Current",
        tone: "warning",
        icon: BadgeIndianRupee
      },
      {
        label: "Returned Today",
        value: String(returnedToday),
        badge: "Completed",
        tone: "success",
        icon: CheckCircle2
      }
    ];
  }, [activeTransactions, transactions]);

  const handleReturn = async (id) => {
    try {
      setProcessingId(id);
      const { data } = await api.put(`/transactions/${id}/return`);
      toast.success(
        `Book returned successfully${data?.transaction?.fine ? ` - Fine Rs. ${data.transaction.fine}` : ""}`
      );
      loadTransactions();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to return book");
    } finally {
      setProcessingId("");
    }
  };

  return (
    <DashboardLayout
      role="librarian"
      title="Return Book"
      searchPlaceholder={roleSearchPlaceholders.librarian}
      navItems={roleNavConfig.librarian}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      notifications={notifications}
    >
      <StatsGrid stats={stats} />

      <PanelCard title="Pending Returns">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Borrower</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Fine</th>
                <th>Action</th>
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
                    <td>{new Date(item.issueDate).toLocaleDateString()}</td>
                    <td>{new Date(item.dueDate).toLocaleDateString()}</td>
                    <td>
                      <span className={item.status === "overdue" ? "badge badge-danger" : "badge badge-success"}>
                        {item.status}
                      </span>
                    </td>
                    <td>Rs. {item.fine || 0}</td>
                    <td>
                      <button
                        className="btn-primary"
                        onClick={() => handleReturn(item._id)}
                        disabled={processingId === item._id}
                      >
                        <RotateCcw size={16} />
                        {processingId === item._id ? "Returning..." : "Accept Return"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No matching return records.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </DashboardLayout>
  );
};

export default ReturnBook;