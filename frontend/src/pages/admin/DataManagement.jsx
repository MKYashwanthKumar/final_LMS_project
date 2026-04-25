import { useState } from "react";
import toast from "react-hot-toast";
import { Download, RotateCcw, Trash2, DatabaseZap } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PanelCard from "../../components/common/PanelCard";
import { roleNavConfig, roleSearchPlaceholders } from "../../data/dashboardData";
import api from "../../services/apiClient";

const DataManagement = () => {
  const [working, setWorking] = useState("");

  const exportJson = async () => {
    try {
      setWorking("export");

      const { data } = await api.get("/reports/export");

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json"
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vemu-dlms-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("System backup exported successfully");
    } catch (error) {
      toast.error("Failed to export system data");
    } finally {
      setWorking("");
    }
  };

  const resetSystem = async () => {
    const confirmReset = window.confirm(
      "This will delete current users, books, transactions and restore default seeded data. Continue?"
    );

    if (!confirmReset) return;

    try {
      setWorking("reset");
      await api.post("/reports/reset");
      toast.success("System reset to default data successfully");
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reset system");
    } finally {
      setWorking("");
    }
  };

  const clearStorage = () => {
    const currentUser = localStorage.getItem("vemu_dlms_current_user");
    const keys = Object.keys(localStorage);

    keys.forEach((key) => {
      if (key !== "vemu_dlms_current_user") {
        localStorage.removeItem(key);
      }
    });

    if (currentUser) {
      localStorage.setItem("vemu_dlms_current_user", currentUser);
    }

    toast.success("Frontend local storage cleared");
  };

  return (
    <DashboardLayout
      role="admin"
      title="Data Management"
      searchPlaceholder={roleSearchPlaceholders.admin}
      navItems={roleNavConfig.admin.filter((item) => item.to !== "/admin/books")}
    >
      <PanelCard title="System Data Controls">
        <div className="stats-grid">
          <div className="stat-card">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                display: "grid",
                placeItems: "center",
                background: "rgba(255, 140, 26, 0.16)",
                color: "#ff8c1a",
                marginBottom: 16
              }}
            >
              <Download size={22} />
            </div>

            <h3 style={{ marginBottom: 10 }}>Export Data</h3>
            <p style={{ color: "#a8b8d8", marginBottom: 18 }}>
              Download system records as JSON backup.
            </p>

            <button className="btn-primary" onClick={exportJson} disabled={working === "export"}>
              {working === "export" ? "Exporting..." : "Export JSON"}
            </button>
          </div>

          <div className="stat-card">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                display: "grid",
                placeItems: "center",
                background: "rgba(245, 158, 11, 0.16)",
                color: "#f59e0b",
                marginBottom: 16
              }}
            >
              <RotateCcw size={22} />
            </div>

            <h3 style={{ marginBottom: 10 }}>Reset System</h3>
            <p style={{ color: "#a8b8d8", marginBottom: 18 }}>
              Reset all system data to initial seeded state.
            </p>

            <button
              className="danger-btn"
              style={{ width: "100%" }}
              onClick={resetSystem}
              disabled={working === "reset"}
            >
              {working === "reset" ? "Resetting..." : "Reset to Default"}
            </button>
          </div>

          <div className="stat-card">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                display: "grid",
                placeItems: "center",
                background: "rgba(59, 130, 246, 0.16)",
                color: "#60a5fa",
                marginBottom: 16
              }}
            >
              <Trash2 size={22} />
            </div>

            <h3 style={{ marginBottom: 10 }}>Clear Storage</h3>
            <p style={{ color: "#a8b8d8", marginBottom: 18 }}>
              Clear local cached data from the frontend.
            </p>

            <button className="btn-outline" style={{ width: "100%" }} onClick={clearStorage}>
              Clear All Data
            </button>
          </div>

          <div className="stat-card">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                display: "grid",
                placeItems: "center",
                background: "rgba(139, 92, 246, 0.16)",
                color: "#8b5cf6",
                marginBottom: 16
              }}
            >
              <DatabaseZap size={22} />
            </div>

            <h3 style={{ marginBottom: 10 }}>Admin Tools</h3>
            <p style={{ color: "#a8b8d8", marginBottom: 18 }}>
              Use export, reset, and cleanup tools safely from this page.
            </p>

            <button className="btn-outline" style={{ width: "100%" }} disabled>
              System Ready
            </button>
          </div>
        </div>
      </PanelCard>
    </DashboardLayout>
  );
};

export default DataManagement;