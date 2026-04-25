import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PanelCard from "../../components/common/PanelCard";
import DataTable from "../../components/dashboard/DataTable";
import api from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";
import { roleNavConfig, roleSearchPlaceholders } from "../../data/dashboardData";

const columns = [
  { key: "book", label: "Book" },
  { key: "issueDate", label: "Issue Date" },
  { key: "dueDate", label: "Due Date" },
  { key: "status", label: "Status" },
  { key: "daysLeft", label: "Days Left" }
];

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const getDaysLeftValue = (dueDate, status) => {
  if (status === "returned") return "Returned";

  const today = new Date();
  const due = new Date(dueDate);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diff < 0) {
    return {
      type: "amount",
      label: `${Math.abs(diff)} days overdue`,
      tone: "danger"
    };
  }

  return `${diff} days left`;
};

const BorrowingHistory = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data } = await api.get("/transactions");

        const formattedRows = data.transactions
          .filter((item) => item.borrowerName === user?.name)
          .map((item) => ({
            book: {
              type: "stack",
              title: item.bookTitle,
              subtitle: item.bookIsbn
            },
            issueDate: formatDate(item.issueDate),
            dueDate: formatDate(item.dueDate),
            status: {
              type: "badge",
              label: item.status,
              tone:
                item.status === "overdue"
                  ? "danger"
                  : item.status === "returned"
                  ? "primary"
                  : "success"
            },
            daysLeft: getDaysLeftValue(item.dueDate, item.status)
          }));

        setRows(formattedRows);
      } catch (error) {
        console.error("Failed to load faculty history:", error);
      }
    };

    if (user) {
      fetchTransactions();
    }
  }, [user]);

  return (
    <DashboardLayout
      role="faculty"
      title="Borrowing History"
      searchPlaceholder={roleSearchPlaceholders.faculty}
      navItems={roleNavConfig.faculty}
    >
      <PanelCard title="Complete Borrowing History">
        <DataTable columns={columns} rows={rows} />
      </PanelCard>
    </DashboardLayout>
  );
};

export default BorrowingHistory;