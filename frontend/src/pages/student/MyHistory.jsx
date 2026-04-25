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
  { key: "fine", label: "Fine" }
];

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const MyHistory = () => {
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
            fine: {
              type: "amount",
              label: `Rs. ${item.fine || 0}`,
              tone: item.fine > 0 ? "danger" : "normal"
            }
          }));

        setRows(formattedRows);
      } catch (error) {
        console.error("Failed to load student history:", error);
      }
    };

    if (user) {
      fetchTransactions();
    }
  }, [user]);

  return (
    <DashboardLayout
      role="student"
      title="My History"
      searchPlaceholder={roleSearchPlaceholders.student}
      navItems={roleNavConfig.student}
    >
      <PanelCard title="Borrowing History">
        <DataTable columns={columns} rows={rows} />
      </PanelCard>
    </DashboardLayout>
  );
};

export default MyHistory;