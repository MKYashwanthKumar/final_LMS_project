import { useEffect, useState } from "react";
import {
  Users,
  BookCopy,
  ClipboardList,
  BadgeIndianRupee
} from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PanelCard from "../../components/common/PanelCard";
import StatsGrid from "../../components/dashboard/StatsGrid";
import api from "../../services/apiClient";
import { roleNavConfig, roleSearchPlaceholders } from "../../data/dashboardData";

const Reports = () => {
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const { data } = await api.get("/reports/overview");
        setOverview(data.overview);
      } catch (error) {
        console.error("Failed to load reports:", error);
      }
    };

    fetchOverview();
  }, []);

  const stats = overview
    ? [
        {
          label: "Users Report",
          value: String(overview.totalUsers),
          badge: "Generated",
          tone: "success",
          icon: Users
        },
        {
          label: "Books Report",
          value: String(overview.totalBooks),
          badge: "Library",
          tone: "info",
          icon: BookCopy
        },
        {
          label: "Issues Report",
          value: String(overview.transactions?.activeIssues || 0),
          badge: "Current",
          tone: "warning",
          icon: ClipboardList
        },
        {
          label: "Fine Report",
          value: `Rs. ${overview.totalFines || 0}`,
          badge: "Collected",
          tone: "primary",
          icon: BadgeIndianRupee
        }
      ]
    : [];

  return (
    <DashboardLayout
      role="admin"
      title="Reports"
      searchPlaceholder={roleSearchPlaceholders.admin}
      navItems={roleNavConfig.admin.filter((item) => item.to !== "/admin/books")}
    >
      <StatsGrid stats={stats} />

      <div className="two-column-grid">
        <PanelCard title="Overall Summary">
          <div className="info-card-block">
            <p>Total registered users: {overview?.totalUsers ?? 0}</p>
            <p>Total books in library: {overview?.totalBooks ?? 0}</p>
            <p>Total book titles: {overview?.totalTitles ?? 0}</p>
            <p>Available books: {overview?.totalAvailable ?? 0}</p>
            <p>Total fines collected: Rs. {overview?.totalFines ?? 0}</p>
          </div>
        </PanelCard>

        <PanelCard title="Role Distribution">
          <div className="info-card-block">
            <p>Admins: {overview?.roleDistribution?.admins ?? 0}</p>
            <p>Librarians: {overview?.roleDistribution?.librarians ?? 0}</p>
            <p>Faculty: {overview?.roleDistribution?.faculty ?? 0}</p>
            <p>Students: {overview?.roleDistribution?.students ?? 0}</p>
            <p>Active issues: {overview?.transactions?.activeIssues ?? 0}</p>
            <p>Overdue books: {overview?.transactions?.overdue ?? 0}</p>
          </div>
        </PanelCard>
      </div>
    </DashboardLayout>
  );
};

export default Reports;