import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { roleBasePaths } from "../data/dashboardData";

// Admin pages
import ManageUsers from "../pages/admin/ManageUsers";
import AdminManageBooks from "../pages/admin/ManageBooks";
import AdminTransactions from "../pages/admin/Transactions";
import Reports from "../pages/admin/Reports";
import DataManagement from "../pages/admin/DataManagement";

// Librarian pages
import LibrarianManageBooks from "../pages/librarian/ManageBooks";
import LibrarianTransactions from "../pages/librarian/Transactions";
import IssueBook from "../pages/librarian/IssueBook";
import ReturnBook from "../pages/librarian/ReturnBook";
import LibrarianUsers from "../pages/librarian/Users";

// Faculty pages
import FacultyBrowseBooks from "../pages/faculty/BrowseBooks";
import BorrowingHistory from "../pages/faculty/BorrowingHistory";
import Recommendations from "../pages/faculty/Recommendations";
import FacultyProfile from "../pages/faculty/Profile";

// Student pages
import StudentBrowseBooks from "../pages/student/BrowseBooks";
import MyHistory from "../pages/student/MyHistory";
import StudentProfile from "../pages/student/Profile";
import Settings from "../pages/student/Settings";

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user?.role) return <Navigate to="/login" replace />;
  return <Navigate to={roleBasePaths[user.role]} replace />;
};

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<RoleRedirect />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <DashboardPage role="admin" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={["admin"]}>
            <ManageUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/books"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminManageBooks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminTransactions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute roles={["admin"]}>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/data"
        element={
          <ProtectedRoute roles={["admin"]}>
            <DataManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/librarian"
        element={
          <ProtectedRoute roles={["librarian"]}>
            <DashboardPage role="librarian" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/librarian/books"
        element={
          <ProtectedRoute roles={["librarian"]}>
            <LibrarianManageBooks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/librarian/transactions"
        element={
          <ProtectedRoute roles={["librarian"]}>
            <LibrarianTransactions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/librarian/issue-book"
        element={
          <ProtectedRoute roles={["librarian"]}>
            <IssueBook />
          </ProtectedRoute>
        }
      />
      <Route
        path="/librarian/return-book"
        element={
          <ProtectedRoute roles={["librarian"]}>
            <ReturnBook />
          </ProtectedRoute>
        }
      />
      <Route
        path="/librarian/users"
        element={
          <ProtectedRoute roles={["librarian"]}>
            <LibrarianUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/faculty"
        element={
          <ProtectedRoute roles={["faculty"]}>
            <DashboardPage role="faculty" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/browse-books"
        element={
          <ProtectedRoute roles={["faculty"]}>
            <FacultyBrowseBooks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/history"
        element={
          <ProtectedRoute roles={["faculty"]}>
            <BorrowingHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/recommendations"
        element={
          <ProtectedRoute roles={["faculty"]}>
            <Recommendations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/profile"
        element={
          <ProtectedRoute roles={["faculty"]}>
            <FacultyProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student"
        element={
          <ProtectedRoute roles={["student"]}>
            <DashboardPage role="student" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/browse-books"
        element={
          <ProtectedRoute roles={["student"]}>
            <StudentBrowseBooks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/history"
        element={
          <ProtectedRoute roles={["student"]}>
            <MyHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute roles={["student"]}>
            <StudentProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/settings"
        element={
          <ProtectedRoute roles={["student"]}>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;