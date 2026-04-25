import { useMemo, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  Menu,
  Search,
  X,
  Home,
  UserCircle2,
  LogOut
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const groupNavItems = (items = []) => {
  return items.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});
};

const DashboardLayout = ({
  role,
  title,
  searchPlaceholder,
  navItems = [],
  children,
  searchValue,
  onSearchChange,
  notifications = []
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");

  const grouped = useMemo(() => groupNavItems(navItems), [navItems]);
  const query = typeof searchValue === "string" ? searchValue : internalSearch;
  const unreadCount = notifications.length;

  const handleSearch = (value) => {
    if (typeof onSearchChange === "function") {
      onSearchChange(value);
    } else {
      setInternalSearch(value);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const profileSubtitle =
    user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1) || "User";

  return (
    <>
      <style>{`
        .dl-shell {
          min-height: 100vh;
          background: linear-gradient(180deg, #07142b 0%, #04112a 100%);
          color: #fff;
          display: flex;
        }

        .dl-sidebar {
          width: 250px;
          background: linear-gradient(180deg, rgba(17, 32, 60, 0.96), rgba(22, 36, 67, 0.96));
          border-right: 1px solid rgba(255,255,255,0.06);
          position: sticky;
          top: 0;
          height: 100vh;
          padding: 18px 0;
          z-index: 100;
          display: flex;
          flex-direction: column;
        }

        .dl-brand {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 18px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .dl-brand-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dl-brand-icon {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #ff9d31, #ff6f00);
          box-shadow: 0 12px 24px rgba(255, 111, 0, 0.25);
        }

        .dl-brand-text {
          font-size: 16px;
          font-weight: 800;
          line-height: 1.05;
        }

        .dl-menu-btn {
          background: transparent;
          border: none;
          color: #c9d6f5;
          cursor: pointer;
        }

        .dl-nav {
          padding: 14px 10px 24px;
          overflow-y: auto;
          flex: 1;
        }

        .dl-section-title {
          font-size: 12px;
          color: #7f92b8;
          font-weight: 700;
          letter-spacing: 0.08em;
          margin: 18px 10px 10px;
          text-transform: uppercase;
        }

        .dl-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 14px;
          color: #dce6fb;
          text-decoration: none;
          margin-bottom: 8px;
          transition: all 0.2s ease;
          font-weight: 600;
        }

        .dl-nav-link:hover,
        .dl-nav-link.active {
          background: rgba(255, 140, 26, 0.14);
          color: #ffb14a;
        }

        .dl-sidebar-footer {
          padding: 14px 12px 0;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .dl-profile-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          background: rgba(10, 21, 42, 0.92);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 12px 12px;
        }

        .dl-profile-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .dl-profile-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #ff9d31, #ff6f00);
          color: white;
          font-weight: 800;
          font-size: 13px;
          flex-shrink: 0;
        }

        .dl-profile-name {
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }

        .dl-profile-role {
          font-size: 12px;
          color: #90a6cf;
        }

        .dl-logout-btn {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02);
          color: #ff6b7a;
          display: grid;
          place-items: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: 0.2s ease;
        }

        .dl-logout-btn:hover {
          background: rgba(255, 107, 122, 0.12);
          border-color: rgba(255, 107, 122, 0.25);
        }

        .dl-main {
          flex: 1;
          min-width: 0;
        }

        .dl-topbar {
          position: sticky;
          top: 0;
          z-index: 90;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 18px 22px;
          background: rgba(4, 17, 42, 0.84);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .dl-title {
          font-size: 24px;
          font-weight: 800;
          color: #ffffff;
        }

        .dl-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .dl-search {
          position: relative;
          width: min(340px, 50vw);
        }

        .dl-search svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #8ea4ce;
        }

        .dl-search input {
          width: 100%;
          height: 44px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(13, 26, 53, 0.9);
          color: #fff;
          outline: none;
          padding: 0 14px 0 42px;
        }

        .dl-bell-wrap {
          position: relative;
        }

        .dl-bell-btn {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(13, 26, 53, 0.9);
          color: #d8e4ff;
          display: grid;
          place-items: center;
          cursor: pointer;
        }

        .dl-bell-count {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 18px;
          height: 18px;
          border-radius: 999px;
          background: #ff5f7a;
          color: white;
          font-size: 11px;
          display: grid;
          place-items: center;
          font-weight: 800;
          padding: 0 4px;
        }

        .dl-notification-panel {
          position: absolute;
          right: 0;
          top: calc(100% + 10px);
          width: min(380px, 82vw);
          background: rgba(10, 21, 42, 0.98);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          box-shadow: 0 18px 40px rgba(0,0,0,0.35);
          padding: 14px;
        }

        .dl-notification-title {
          font-size: 15px;
          font-weight: 800;
          margin-bottom: 10px;
          color: #fff;
        }

        .dl-notification-item {
          padding: 12px;
          border-radius: 14px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 10px;
        }

        .dl-notification-item:last-child {
          margin-bottom: 0;
        }

        .dl-notification-item strong {
          display: block;
          margin-bottom: 4px;
          color: #fff;
        }

        .dl-notification-item p {
          margin: 0 0 6px;
          color: #b6c6e4;
          line-height: 1.5;
          font-size: 14px;
        }

        .dl-notification-time {
          font-size: 12px;
          color: #8396bb;
        }

        .dl-content {
          padding: 20px;
        }

        @media (max-width: 900px) {
          .dl-sidebar {
            position: fixed;
            left: ${sidebarOpen ? "0" : "-260px"};
            transition: left 0.25s ease;
          }

          .dl-topbar {
            padding-left: 16px;
            padding-right: 16px;
          }

          .dl-title {
            font-size: 20px;
          }

          .dl-search {
            width: min(240px, 45vw);
          }
        }
      `}</style>

      <div className="dl-shell">
        <aside className="dl-sidebar">
          <div className="dl-brand">
            <div className="dl-brand-left">
              <div className="dl-brand-icon">
                <BookOpen size={18} />
              </div>
              <div className="dl-brand-text">
                VEMU
                <br />
                DLMS
              </div>
            </div>

            <button className="dl-menu-btn" onClick={() => setSidebarOpen((prev) => !prev)}>
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          <nav className="dl-nav">
            <div>
              <div className="dl-section-title">MAIN</div>
              <Link to="/" className="dl-nav-link">
                <Home size={18} />
                Home
              </Link>
            </div>

            {Object.entries(grouped).map(([section, links]) => (
              <div key={section}>
                <div className="dl-section-title">{section}</div>
                {links.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `dl-nav-link ${isActive ? "active" : ""}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <div className="dl-sidebar-footer">
            <div className="dl-profile-card">
              <div className="dl-profile-left">
                <div className="dl-profile-avatar">
                  {user?.name
                    ? user.name
                        .split(" ")
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase()
                    : "US"}
                </div>

                <div>
                  <div className="dl-profile-name">{user?.name || "User"}</div>
                  <div className="dl-profile-role">{profileSubtitle}</div>
                </div>
              </div>

              <button className="dl-logout-btn" onClick={handleLogout} title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        <div className="dl-main">
          <header className="dl-topbar">
            <div className="dl-title">{title}</div>

            <div className="dl-actions">
              <div className="dl-search">
                <Search size={16} />
                <input
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={searchPlaceholder || "Search..."}
                />
              </div>

              <div className="dl-bell-wrap">
                <button
                  className="dl-bell-btn"
                  onClick={() => setNotificationOpen((prev) => !prev)}
                >
                  <Bell size={18} />
                  {unreadCount > 0 ? <span className="dl-bell-count">{unreadCount}</span> : null}
                </button>

                {notificationOpen ? (
                  <div className="dl-notification-panel">
                    <div className="dl-notification-title">Notifications</div>

                    {notifications.length > 0 ? (
                      notifications.map((item) => (
                        <div className="dl-notification-item" key={item.id}>
                          <strong>{item.title}</strong>
                          <p>{item.message}</p>
                          <div className="dl-notification-time">{item.time}</div>
                        </div>
                      ))
                    ) : (
                      <div className="dl-notification-item">
                        <strong>No notifications</strong>
                        <p>Everything is up to date.</p>
                        <div className="dl-notification-time">Now</div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <main className="dl-content">{children}</main>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;