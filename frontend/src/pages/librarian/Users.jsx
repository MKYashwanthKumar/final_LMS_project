import { useEffect, useMemo, useState } from "react";
import {
  Users,
  GraduationCap,
  UserRound,
  BadgeIndianRupee
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import PanelCard from "../../components/common/PanelCard";
import StatsGrid from "../../components/dashboard/StatsGrid";
import api from "../../services/apiClient";
import { roleNavConfig, roleSearchPlaceholders } from "../../data/dashboardData";

const buildNotifications = (reportRows) => {
  return reportRows
    .filter((row) => row.pendingFine > 0)
    .slice(0, 8)
    .map((row) => ({
      id: row._id,
      title: "Fine pending",
      message: `${row.name} has pending fine of Rs. ${row.pendingFine}.`,
      time: "Live"
    }));
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    try {
      const [usersRes, txRes] = await Promise.all([
        api.get("/users"),
        api.get("/transactions")
      ]);

      setUsers(usersRes.data.users || []);
      setTransactions(txRes.data.transactions || []);
    } catch (error) {
      toast.error("Failed to load user report");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const reportRows = useMemo(() => {
    return users
      .filter((user) => user.accessStatus === "approved" && ["student", "faculty"].includes(user.role))
      .map((user) => {
        const userTransactions = transactions.filter(
          (item) => item.borrowerName === user.name
        );

        const activeBooks = userTransactions.filter((item) =>
          ["active", "overdue"].includes(item.status)
        ).length;

        const overdueBooks = userTransactions.filter((item) => item.status === "overdue").length;

        const pendingFine = userTransactions
          .filter((item) => item.status === "overdue")
          .reduce((sum, item) => sum + Number(item.fine || 0), 0);

        const latestTransaction = userTransactions[0];

        return {
          ...user,
          activeBooks,
          overdueBooks,
          pendingFine,
          latestBook: latestTransaction?.bookTitle || "-",
          latestIssue: latestTransaction?.issueDate
            ? new Date(latestTransaction.issueDate).toLocaleDateString()
            : "-"
        };
      });
  }, [users, transactions]);

  const filteredRows = useMemo(() => {
    return reportRows.filter((row) => {
      const text = searchQuery.toLowerCase();
      if (!text) return true;

      return [
        row.name,
        row.username,
        row.role,
        row.department,
        row.latestBook,
        row.pendingFine
      ].some((value) => String(value || "").toLowerCase().includes(text));
    });
  }, [reportRows, searchQuery]);

  const notifications = useMemo(
    () => buildNotifications(reportRows),
    [reportRows]
  );

  const stats = useMemo(() => {
    return [
      {
        label: "Borrowing Users",
        value: String(reportRows.length),
        badge: "Approved",
        tone: "info",
        icon: Users
      },
      {
        label: "Students",
        value: String(reportRows.filter((item) => item.role === "student").length),
        badge: "Academic",
        tone: "success",
        icon: GraduationCap
      },
      {
        label: "Faculty",
        value: String(reportRows.filter((item) => item.role === "faculty").length),
        badge: "Teaching",
        tone: "primary",
        icon: UserRound
      },
      {
        label: "Fee Pending",
        value: `Rs. ${reportRows.reduce((sum, item) => sum + item.pendingFine, 0)}`,
        badge: "Overdue",
        tone: "danger",
        icon: BadgeIndianRupee
      }
    ];
  }, [reportRows]);

  return (
    <DashboardLayout
      role="librarian"
      title="Users Report"
      searchPlaceholder={roleSearchPlaceholders.librarian}
      navItems={roleNavConfig.librarian}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      notifications={notifications}
    >
      <StatsGrid stats={stats} />

      <PanelCard title="Borrowing Summary by User">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Books Taken</th>
                <th>Overdue</th>
                <th>Fee Pending</th>
                <th>Latest Book</th>
                <th>Latest Issue</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <tr key={row._id}>
                    <td>{row.name}</td>
                    <td>{row.role}</td>
                    <td>{row.department || "-"}</td>
                    <td>{row.activeBooks}</td>
                    <td>{row.overdueBooks}</td>
                    <td>Rs. {row.pendingFine}</td>
                    <td>{row.latestBook}</td>
                    <td>{row.latestIssue}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No matching users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </DashboardLayout>
  );
};

export default UsersPage;