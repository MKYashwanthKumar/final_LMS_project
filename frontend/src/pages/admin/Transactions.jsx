import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PanelCard from "../../components/common/PanelCard";
import DataTable from "../../components/dashboard/DataTable";
import api from "../../services/apiClient";
import { roleNavConfig, roleSearchPlaceholders } from "../../data/dashboardData";

const columns = [
  { key: "id", label: "ID" },
  { key: "book", label: "Book" },
  { key: "user", label: "User" },
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

const Transactions = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data } = await api.get("/transactions");

        const formattedRows = data.transactions.map((item) => ({
          id: item._id.slice(-5),
          book: {
            type: "stack",
            title: item.bookTitle,
            subtitle: item.bookIsbn
          },
          user: {
            type: "stack",
            title: item.borrowerName,
            subtitle: item.borrowerRole
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
        console.error("Failed to load transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <DashboardLayout
      role="admin"
      title="All Transactions"
      searchPlaceholder={roleSearchPlaceholders.admin}
      navItems={roleNavConfig.admin}
    >
      <PanelCard title="Transaction History">
        <DataTable columns={columns} rows={rows} />
      </PanelCard>
    </DashboardLayout>
  );
};

export default Transactions;