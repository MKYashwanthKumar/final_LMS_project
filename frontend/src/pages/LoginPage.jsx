import {
  BookOpen,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  User,
  UserCog,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AnimatedBackground from "../components/common/AnimatedBackground";
import { useAuth } from "../context/AuthContext";
import { roleBasePaths } from "../data/dashboardData";

const roleCards = [
  { label: "Student", value: "student", icon: Users },
  { label: "Faculty", value: "faculty", icon: User },
  { label: "Librarian", value: "librarian", icon: UserCog },
  { label: "Admin", value: "admin", icon: Shield }
];

const emptyForm = {
  name: "",
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  department: "",
  studentId: "",
  facultyId: "",
  year: ""
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, loading, login, register } = useAuth();

  const [mode, setMode] = useState("signin");
  const [selectedRole, setSelectedRole] = useState("student");
  const [formData, setFormData] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user?.role) {
      navigate(roleBasePaths[user.role], { replace: true });
    }
  }, [loading, user, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setShowPassword(false);
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      if (mode === "signin") {
        if (!formData.username || !formData.password) {
          toast.error("Please enter username and password");
          return;
        }

        const loggedInUser = await login({
          username: formData.username.trim(),
          password: formData.password,
          role: selectedRole
        });

        toast.success("Login successful");
        navigate(roleBasePaths[loggedInUser.role], { replace: true });
        return;
      }

      if (!formData.name || !formData.email || !formData.username || !formData.password) {
        toast.error("Please fill all required sign up fields");
        return;
      }

      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      const signupUsername = formData.username;
      const signupPassword = formData.password;

      const result = await register({
        name: formData.name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        role: selectedRole,
        department: formData.department,
        studentId: formData.studentId,
        facultyId: formData.facultyId,
        year: formData.year
      });

      toast.success(
        result.message || "Registration submitted. Wait for admin approval before login."
      );

      setMode("signin");
      setFormData({
        ...emptyForm,
        username: signupUsername,
        password: signupPassword
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        .floating-home-btn {
          position: fixed;
          top: 24px;
          right: 28px;
          z-index: 999;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 22px;
          border-radius: 16px;
          text-decoration: none;
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;
          background: linear-gradient(135deg, rgba(255, 140, 26, 0.95), rgba(255, 111, 0, 0.95));
          border: 1px solid rgba(255, 180, 74, 0.35);
          box-shadow: 0 10px 28px rgba(255, 111, 0, 0.28);
          backdrop-filter: blur(10px);
          animation: floatHomeBtn 3s ease-in-out infinite;
          transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
        }

        .floating-home-btn:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 16px 34px rgba(255, 111, 0, 0.4);
          filter: brightness(1.05);
        }

        @keyframes floatHomeBtn {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }

        @media (max-width: 768px) {
          .floating-home-btn {
            top: 16px;
            right: 16px;
            padding: 10px 16px;
            font-size: 14px;
            border-radius: 14px;
          }
        }
      `}</style>

      <div className="login-page">
        <AnimatedBackground variant="login" />

        <Link to="/" className="floating-home-btn">
          ⟵ Home
        </Link>

        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="login-brand-panel">
            <div className="login-brand-icon">
              <BookOpen size={28} />
            </div>

            <h2>{mode === "signin" ? "Welcome Back!" : "Create Account"}</h2>
            <p>
              {mode === "signin"
                ? "Access your personalized dashboard to manage library resources, track borrowed books, and explore the collection."
                : "Register as a new user. Your account will be created and sent to admin for approval before login."}
            </p>

            <div className="feature-pill">Secure Authentication</div>
            <div className="feature-pill">Role-based Dashboards</div>
            <div className="feature-pill">Admin Approval for New Accounts</div>
          </div>

          <div className="login-form-panel">
            <div className="auth-mode-switch">
              <button
                type="button"
                className={`auth-mode-btn ${mode === "signin" ? "active" : ""}`}
                onClick={() => handleModeChange("signin")}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-mode-btn ${mode === "signup" ? "active" : ""}`}
                onClick={() => handleModeChange("signup")}
              >
                Sign Up
              </button>
            </div>

            <h2>{mode === "signin" ? "Sign In" : "Sign Up"}</h2>
            <p>
              {mode === "signin"
                ? "Enter your credentials to access your account"
                : "Fill your details to create a new account request"}
            </p>

            <form className="login-form" onSubmit={handleSubmit}>
              <div>
                <label>Select Role</label>
                <div className="role-grid">
                  {roleCards.map((role) => {
                    const Icon = role.icon;

                    return (
                      <button
                        type="button"
                        key={role.value}
                        className={`role-option ${selectedRole === role.value ? "selected" : ""}`}
                        onClick={() => setSelectedRole(role.value)}
                      >
                        <Icon size={20} />
                        <span>{role.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {mode === "signup" && (
                <>
                  <div className="field-group">
                    <label>Full Name</label>
                    <div className="input-wrapper">
                      <User size={16} />
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <label>Email</label>
                    <div className="input-wrapper">
                      <Mail size={16} />
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="field-group">
                <label>Username</label>
                <div className="input-wrapper">
                  <User size={16} />
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="field-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <Lock size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <>
                  <div className="field-group">
                    <label>Confirm Password</label>
                    <div className="input-wrapper">
                      <Lock size={16} />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <label>Department</label>
                    <div className="input-wrapper">
                      <BookOpen size={16} />
                      <input
                        type="text"
                        name="department"
                        placeholder="Enter department"
                        value={formData.department}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {selectedRole === "student" && (
                    <>
                      <div className="field-group">
                        <label>Student ID</label>
                        <div className="input-wrapper">
                          <User size={16} />
                          <input
                            type="text"
                            name="studentId"
                            placeholder="Enter student ID"
                            value={formData.studentId}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="field-group">
                        <label>Year</label>
                        <div className="input-wrapper">
                          <User size={16} />
                          <input
                            type="text"
                            name="year"
                            placeholder="Enter year"
                            value={formData.year}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {selectedRole === "faculty" && (
                    <div className="field-group">
                      <label>Faculty ID</label>
                      <div className="input-wrapper">
                        <User size={16} />
                        <input
                          type="text"
                          name="facultyId"
                          placeholder="Enter faculty ID"
                          value={formData.facultyId}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <button type="submit" className="btn-primary full" disabled={submitting}>
                {submitting
                  ? mode === "signin"
                    ? "Signing In..."
                    : "Submitting..."
                  : mode === "signin"
                  ? "Sign In"
                  : "Create Account Request"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;