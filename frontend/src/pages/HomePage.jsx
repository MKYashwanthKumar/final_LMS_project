import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Shield,
  UserCog,
  LogOut,
  BrainCircuit,
  Database,
  Code2,
  Cpu,
  Network,
  Sparkles,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/apiClient";
import { useAuth } from "../context/AuthContext";
import { roleBasePaths } from "../data/dashboardData";

const REVIEWS_KEY = "vemu_library_reviews";

const defaultReviews = [
  {
    id: "rv1",
    name: "Karthik",
    rating: 5,
    message: "Excellent library website design and very easy to use.",
    time: new Date().toLocaleString()
  },
  {
    id: "rv2",
    name: "Teja",
    rating: 4,
    message: "Very attractive design and good review feature.",
    time: new Date().toLocaleString()
  }
];

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const getFeaturedBookIcon = (category = "", title = "") => {
  const text = `${category} ${title}`.toLowerCase();

  if (text.includes("artificial intelligence") || text.includes("ai")) {
    return <BrainCircuit size={54} />;
  }

  if (text.includes("database") || text.includes("sql")) {
    return <Database size={54} />;
  }

  if (
    text.includes("algorithm") ||
    text.includes("data structure") ||
    text.includes("programming") ||
    text.includes("coding")
  ) {
    return <Code2 size={54} />;
  }

  if (
    text.includes("computer architecture") ||
    text.includes("digital") ||
    text.includes("electronics") ||
    text.includes("hardware")
  ) {
    return <Cpu size={54} />;
  }

  if (text.includes("network") || text.includes("communication")) {
    return <Network size={54} />;
  }

  return <Sparkles size={54} />;
};

const getStoredReviews = () => {
  try {
    const saved = localStorage.getItem(REVIEWS_KEY);
    return saved ? JSON.parse(saved) : defaultReviews;
  } catch {
    return defaultReviews;
  }
};

const saveStoredReviews = (reviews) => {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
};

const HomePage = () => {
  const { user, logout } = useAuth();

  const [overview, setOverview] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    rating: "",
    message: ""
  });

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);

        const [overviewRes, booksRes] = await Promise.all([
          api.get("/reports/overview"),
          api.get("/books")
        ]);

        setOverview(overviewRes.data.overview || null);
        setBooks(booksRes.data.books || []);
      } catch (error) {
        console.error("Failed to load homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  useEffect(() => {
    const storedReviews = getStoredReviews();
    setReviews(storedReviews);
  }, []);

  const featuredBooks = useMemo(() => books.slice(0, 3), [books]);

  const stats = {
    books: overview?.totalBooks ?? 0,
    users: overview?.totalUsers ?? 0,
    access: "24/7"
  };

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();

    if (!user) return;

    const rating = Number(reviewForm.rating);
    const message = reviewForm.message.trim();

    if (!message || rating < 1 || rating > 5) {
      alert("Please enter a valid rating between 1 and 5 and write your review.");
      return;
    }

    const newReview = {
      id: `rv-${Date.now()}`,
      name: user.name || user.username || "User",
      rating,
      message,
      time: new Date().toLocaleString()
    };

    const updatedReviews = [...reviews, newReview];
    setReviews(updatedReviews);
    saveStoredReviews(updatedReviews);

    setReviewForm({
      rating: "",
      message: ""
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

        .gx-home {
          --bg-main: #071125;
          --bg-dark: #030812;
          --card-bg: rgba(14, 25, 45, 0.78);
          --border: rgba(255, 255, 255, 0.08);
          --white: #f7f9ff;
          --text: #c5cede;
          --accent: #ff8c1a;
          --accent2: #ffb14a;
          --shadow: 0 15px 40px rgba(0, 0, 0, 0.45);
          font-family: 'Poppins', sans-serif;
          color: var(--white);
          background: linear-gradient(135deg, #020611 0%, #071125 50%, #040916 100%);
          overflow-x: hidden;
          position: relative;
          min-height: 100vh;
        }

        .gx-home * {
          box-sizing: border-box;
          scroll-behavior: smooth;
        }

        .gx-home a {
          text-decoration: none;
          color: inherit;
        }

        .gx-home ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .gx-home section {
          padding: 90px 0;
          position: relative;
          z-index: 2;
        }

        .gx-galaxy-bg {
          position: fixed;
          inset: 0;
          overflow: hidden;
          z-index: 0;
          background:
            radial-gradient(circle at 20% 20%, rgba(58, 97, 255, 0.12), transparent 22%),
            radial-gradient(circle at 80% 15%, rgba(255, 115, 0, 0.14), transparent 22%),
            radial-gradient(circle at 50% 65%, rgba(145, 0, 255, 0.10), transparent 28%),
            radial-gradient(circle at 15% 85%, rgba(0, 180, 255, 0.08), transparent 18%),
            linear-gradient(160deg, #020611 0%, #071125 45%, #030816 100%);
        }

        .gx-stars,
        .gx-stars2,
        .gx-stars3 {
          position: absolute;
          inset: -2000px;
          background-repeat: repeat;
          animation: gx-drift linear infinite;
          opacity: 0.9;
        }

        .gx-stars {
          background-image:
            radial-gradient(2px 2px at 40px 60px, #ffffff, transparent 50%),
            radial-gradient(1.5px 1.5px at 120px 180px, #ffffff, transparent 50%),
            radial-gradient(2px 2px at 200px 90px, #ffd9a8, transparent 50%),
            radial-gradient(1.5px 1.5px at 300px 140px, #ffffff, transparent 50%),
            radial-gradient(1.5px 1.5px at 420px 260px, #9ed0ff, transparent 50%);
          background-size: 500px 500px;
          animation-duration: 120s;
        }

        .gx-stars2 {
          background-image:
            radial-gradient(1px 1px at 50px 100px, #ffffff, transparent 50%),
            radial-gradient(1px 1px at 180px 70px, #cce3ff, transparent 50%),
            radial-gradient(1px 1px at 280px 200px, #ffffff, transparent 50%),
            radial-gradient(1px 1px at 380px 130px, #ffe1b3, transparent 50%),
            radial-gradient(1px 1px at 460px 320px, #ffffff, transparent 50%);
          background-size: 600px 600px;
          animation-duration: 180s;
          opacity: 0.7;
        }

        .gx-stars3 {
          background-image:
            radial-gradient(2px 2px at 80px 40px, rgba(255,255,255,.9), transparent 50%),
            radial-gradient(2px 2px at 230px 170px, rgba(255,180,74,.8), transparent 50%),
            radial-gradient(2px 2px at 360px 80px, rgba(173,216,255,.8), transparent 50%),
            radial-gradient(2px 2px at 470px 240px, rgba(255,255,255,.9), transparent 50%);
          background-size: 700px 700px;
          animation-duration: 240s;
          opacity: 0.35;
        }

        .gx-nebula {
          position: absolute;
          border-radius: 50%;
          filter: blur(55px);
          animation: gx-pulse 8s ease-in-out infinite alternate;
        }

        .gx-nebula1 {
          width: 360px;
          height: 360px;
          top: 10%;
          left: 8%;
          background: rgba(92, 61, 255, 0.18);
        }

        .gx-nebula2 {
          width: 380px;
          height: 380px;
          top: 18%;
          right: 6%;
          background: rgba(255, 116, 24, 0.18);
          animation-delay: 2s;
        }

        .gx-nebula3 {
          width: 320px;
          height: 320px;
          bottom: 5%;
          left: 25%;
          background: rgba(0, 157, 255, 0.14);
          animation-delay: 1s;
        }

        @keyframes gx-drift {
          from { transform: translateY(0); }
          to { transform: translateY(1200px); }
        }

        @keyframes gx-pulse {
          from { transform: scale(1) translateY(0); opacity: 0.55; }
          to { transform: scale(1.12) translateY(-20px); opacity: 0.85; }
        }

        @keyframes gx-floaty {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }

        .gx-container {
          width: 90%;
          max-width: 1280px;
          margin: auto;
          position: relative;
          z-index: 2;
        }

        .gx-navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          backdrop-filter: blur(12px);
          background: rgba(2, 8, 18, 0.72);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .gx-nav-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 18px 0;
          flex-wrap: wrap;
        }

        .gx-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 28px;
          font-weight: 800;
        }

        .gx-brand-icon {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: linear-gradient(135deg, #ff9a2f, #ff6600);
          display: grid;
          place-items: center;
          box-shadow: 0 0 25px rgba(255, 128, 0, 0.35);
        }

        .gx-brand span {
          color: var(--accent);
        }

        .gx-nav-menu ul {
          display: flex;
          gap: 28px;
          flex-wrap: wrap;
        }

        .gx-nav-menu ul li a {
          color: #d5deec;
          font-weight: 500;
          transition: 0.3s;
        }

        .gx-nav-menu ul li a:hover {
          color: var(--accent);
        }

        .gx-nav-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .gx-btn,
        .gx-btn-outline {
          padding: 12px 22px;
          border-radius: 14px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: 0.3s;
          cursor: pointer;
          border: none;
        }

        .gx-btn {
          background: linear-gradient(135deg, #ff9d31, #ff6f00);
          color: white;
          box-shadow: 0 10px 28px rgba(255, 115, 0, 0.28);
        }

        .gx-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(255, 115, 0, 0.35);
        }

        .gx-btn-outline {
          border: 1px solid rgba(255,255,255,0.15);
          color: white;
          background: rgba(255,255,255,0.03);
        }

        .gx-btn-outline:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .gx-hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding-top: 40px;
          padding-bottom: 40px;
        }

        .gx-hero-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 40px;
          align-items: center;
        }

        .gx-tag {
          display: inline-block;
          padding: 10px 20px;
          border-radius: 30px;
          border: 1px solid rgba(255, 140, 26, 0.24);
          background: rgba(255, 140, 26, 0.06);
          color: var(--accent2);
          margin-bottom: 26px;
          box-shadow: 0 0 25px rgba(255,140,26,0.12);
        }

        .gx-hero h1 {
          font-size: 72px;
          line-height: 1.08;
          font-weight: 800;
          margin-bottom: 20px;
        }

        .gx-hero h1 .gx-accent-text {
          color: var(--accent2);
        }

        .gx-hero p {
          font-size: 20px;
          line-height: 1.9;
          color: var(--text);
          max-width: 680px;
          margin-bottom: 30px;
        }

        .gx-hero-actions {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 35px;
        }

        .gx-stats-box {
          display: flex;
          gap: 28px;
          align-items: center;
          background: rgba(17, 31, 55, 0.78);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 20px 24px;
          border-radius: 20px;
          box-shadow: var(--shadow);
          flex-wrap: wrap;
        }

        .gx-stat-item h3 {
          font-size: 30px;
          color: var(--accent2);
          margin-bottom: 6px;
        }

        .gx-stat-item p {
          color: #9cabbe;
          font-size: 14px;
          letter-spacing: 1px;
          margin: 0;
        }

        .gx-divider {
          width: 1px;
          height: 44px;
          background: rgba(255,255,255,0.12);
        }

        .gx-hero-cards {
          position: relative;
          min-height: 420px;
        }

        .gx-floating-card {
          position: absolute;
          width: 170px;
          height: 110px;
          border-radius: 22px;
          background: linear-gradient(180deg, rgba(29, 49, 78, 0.94), rgba(17, 31, 55, 0.88));
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          box-shadow: var(--shadow);
          animation: gx-floaty 4s ease-in-out infinite;
        }

        .gx-floating-card .gx-icon {
          color: var(--accent);
          margin-bottom: 8px;
        }

        .gx-floating-card h4 {
          font-size: 21px;
          margin-bottom: 4px;
        }

        .gx-floating-card p {
          font-size: 13px;
          color: #c0cbdb;
          margin: 0;
        }

        .gx-card1 { top: 20px; left: 25px; animation-delay: 0s; }
        .gx-card2 { top: 20px; right: 25px; animation-delay: 0.7s; }
        .gx-card3 { bottom: 20px; left: 25px; animation-delay: 1.4s; }
        .gx-card4 { bottom: 20px; right: 25px; animation-delay: 2s; }

        .gx-section-head {
          text-align: center;
          margin-bottom: 45px;
        }

        .gx-section-head h2 {
          font-size: 42px;
          margin-bottom: 12px;
          font-weight: 700;
        }

        .gx-section-head h2 span {
          color: var(--accent);
        }

        .gx-section-head p {
          max-width: 760px;
          margin: auto;
          color: var(--text);
          line-height: 1.9;
          font-size: 17px;
        }

        .gx-about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
        }

        .gx-glass-card {
          background: rgba(15, 28, 49, 0.76);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 30px;
          box-shadow: var(--shadow);
          backdrop-filter: blur(10px);
        }

        .gx-glass-card h3 {
          font-size: 26px;
          color: var(--accent2);
          margin-bottom: 14px;
        }

        .gx-glass-card p {
          color: var(--text);
          line-height: 1.9;
          font-size: 16px;
        }

        .gx-feature-list {
          display: grid;
          gap: 14px;
          margin-top: 18px;
          padding: 0;
        }

        .gx-feature-list li {
          padding: 14px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 14px;
          color: #d9e0ed;
        }

        .gx-book-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .gx-book-card {
          background: linear-gradient(180deg, rgba(19, 34, 58, 0.95), rgba(10, 20, 36, 0.95));
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 24px;
          box-shadow: var(--shadow);
          transition: 0.3s;
        }

        .gx-book-card:hover {
          transform: translateY(-8px);
          border-color: rgba(255, 140, 26, 0.3);
        }

        .gx-book-cover {
          height: 170px;
          border-radius: 18px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffb14a;
          background:
            linear-gradient(135deg, rgba(255, 140, 26, 0.22), rgba(0, 160, 255, 0.10)),
            linear-gradient(160deg, #132742, #0a1528);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: inset 0 0 24px rgba(255, 177, 74, 0.08);
        }

        .gx-book-card h3 {
          font-size: 23px;
          margin-bottom: 10px;
        }

        .gx-book-card p {
          color: var(--text);
          line-height: 1.8;
          margin-bottom: 16px;
        }

        .gx-badge {
          display: inline-block;
          padding: 8px 14px;
          border-radius: 20px;
          background: rgba(255, 140, 26, 0.08);
          border: 1px solid rgba(255, 140, 26, 0.18);
          color: var(--accent2);
          font-size: 14px;
        }

        .gx-reviews-wrap {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          align-items: start;
        }

        .gx-review-form input,
        .gx-review-form textarea,
        .gx-review-form select {
        width: 100%;
        margin-bottom: 16px;
        padding: 15px 16px;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.03);
        color: white;
        outline: none;
        font-size: 15px;
        }

        .gx-review-form select {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        padding-right: 48px;
        background-image:
            linear-gradient(45deg, transparent 50%, #d9e6ff 50%),
            linear-gradient(135deg, #d9e6ff 50%, transparent 50%);
        background-position:
            calc(100% - 22px) calc(50% - 3px),
            calc(100% - 16px) calc(50% - 3px);
        background-size: 6px 6px, 6px 6px;
        background-repeat: no-repeat;
        }

        .gx-review-form select option {
        background: #ffffff;
        color: #0b1730;
        }

        .gx-review-form textarea {
          min-height: 140px;
          resize: vertical;
        }

        .gx-review-form input:focus,
        .gx-review-form textarea:focus,
        .gx-review-form select:focus {
          border-color: rgba(255,140,26,0.45);
          box-shadow: 0 0 0 3px rgba(255,140,26,0.08);
        }

        .gx-review-form.disabled-form {
          opacity: 0.55;
          pointer-events: none;
        }

        .gx-review-lock {
          color: #ffb14a;
          margin-bottom: 18px;
          line-height: 1.8;
          font-size: 15px;
        }

        .gx-reviews-list {
          display: grid;
          gap: 18px;
          max-height: 520px;
          overflow-y: auto;
          padding-right: 6px;
        }

        .gx-review-card {
          background: rgba(21, 35, 58, 0.82);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 20px;
          box-shadow: var(--shadow);
        }

        .gx-review-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }

        .gx-review-top h4 {
          font-size: 20px;
          color: var(--accent2);
          margin: 0;
        }

        .gx-review-time {
          color: #93a4bb;
          font-size: 13px;
        }

        .gx-review-stars {
          display: flex;
          gap: 4px;
          color: #ffb347;
          margin-bottom: 10px;
        }

        .gx-review-card p {
          color: var(--text);
          line-height: 1.8;
          margin: 0;
        }

        .gx-footer {
          background: rgba(1, 5, 12, 0.82);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 75px;
          padding-bottom: 25px;
          position: relative;
          z-index: 2;
        }

        .gx-footer-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr 1fr 1fr;
          gap: 36px;
          margin-bottom: 45px;
        }

        .gx-footer-brand {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .gx-footer-brand p,
        .gx-contact-line {
          color: var(--text);
          line-height: 1.9;
        }

        .gx-footer-column h3 {
          font-size: 20px;
          margin-bottom: 18px;
        }

        .gx-footer-column ul {
          display: grid;
          gap: 12px;
        }

        .gx-footer-column ul li a {
          color: var(--text);
          transition: 0.3s;
        }

        .gx-footer-column ul li a:hover {
          color: var(--accent);
          padding-left: 4px;
        }

        .gx-footer-bottom {
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex;
          justify-content: space-between;
          gap: 15px;
          flex-wrap: wrap;
          color: #94a4bb;
        }

        .gx-footer-bottom-links {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
        }

        .gx-footer-bottom-links a:hover {
          color: var(--accent);
        }

        .gx-loading {
          color: var(--text);
          text-align: center;
          padding: 20px 0 0;
        }

        @media (max-width: 1100px) {
          .gx-hero-grid,
          .gx-about-grid,
          .gx-reviews-wrap,
          .gx-footer-grid {
            grid-template-columns: 1fr;
          }

          .gx-book-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .gx-hero {
            min-height: auto;
            padding-top: 70px;
          }

          .gx-hero h1 {
            font-size: 56px;
          }
        }

        @media (max-width: 700px) {
          .gx-book-grid {
            grid-template-columns: 1fr;
          }

          .gx-nav-inner {
            flex-direction: column;
            align-items: flex-start;
          }

          .gx-nav-menu ul {
            gap: 14px;
          }

          .gx-hero h1 {
            font-size: 40px;
          }

          .gx-hero p,
          .gx-section-head p {
            font-size: 15px;
          }

          .gx-stats-box {
            flex-wrap: wrap;
          }

          .gx-divider {
            display: none;
          }

          .gx-floating-card {
            width: 140px;
            height: 95px;
          }
        }
      `}</style>

      <div className="gx-home">
        <div className="gx-galaxy-bg">
          <div className="gx-stars" />
          <div className="gx-stars2" />
          <div className="gx-stars3" />
          <div className="gx-nebula gx-nebula1" />
          <div className="gx-nebula gx-nebula2" />
          <div className="gx-nebula gx-nebula3" />
        </div>

        <header className="gx-navbar">
          <div className="gx-container gx-nav-inner">
            <div className="gx-brand">
              <div className="gx-brand-icon">📚</div>
              <div>
                VEMU <span>Library</span>
              </div>
            </div>

            <nav className="gx-nav-menu">
              <ul>
                <li><a href="#gx-home">Home</a></li>
                <li><a href="#gx-about">About</a></li>
                <li><a href="#gx-books">Books</a></li>
                <li><a href="#gx-reviews">Reviews</a></li>
                <li><a href="#gx-contact">Contact Us</a></li>
              </ul>
            </nav>

            <div className="gx-nav-actions">
              {!user ? (
                <>
                  <Link to="/login" className="gx-btn-outline">Sign In</Link>
                  <Link to="/login" className="gx-btn">Register</Link>
                </>
              ) : (
                <>
                  <Link to={roleBasePaths[user.role]} className="gx-btn-outline">
                    Go to Dashboard
                  </Link>
                  <button type="button" className="gx-btn" onClick={handleLogout}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        <section className="gx-hero" id="gx-home">
          <div className="gx-container gx-hero-grid">
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55 }}
            >
              <div className="gx-tag">Next-Gen Library System</div>

              <h1>
                Manage Your Library <br />
                <span className="gx-accent-text">Smarter & Faster</span>
              </h1>

              <p>
                A modern library platform for students, faculty, librarians, and administrators
                to discover, access, organize, and manage academic resources efficiently.
              </p>

              <div className="gx-hero-actions">
                <a href="#gx-books" className="gx-btn">
                  Explore Books <ArrowRight size={18} />
                </a>

                <div className="gx-stats-box">
                  <div className="gx-stat-item">
                    <h3>{loading ? "..." : `${stats.books}+`}</h3>
                    <p>BOOKS</p>
                  </div>
                  <div className="gx-divider" />
                  <div className="gx-stat-item">
                    <h3>{loading ? "..." : `${stats.users}+`}</h3>
                    <p>USERS</p>
                  </div>
                  <div className="gx-divider" />
                  <div className="gx-stat-item">
                    <h3>{stats.access}</h3>
                    <p>ACCESS</p>
                  </div>
                </div>
              </div>

              {user && (
                <p className="gx-loading">
                  Signed in as <strong>{user.name}</strong> ({user.role})
                </p>
              )}
            </motion.div>

            <motion.div
              className="gx-hero-cards"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55 }}
            >
              <div className="gx-floating-card gx-card1">
                <div className="gx-icon"><GraduationCap size={28} /></div>
                <h4>Students</h4>
                <p>Access Books</p>
              </div>

              <div className="gx-floating-card gx-card2">
                <div className="gx-icon"><BookOpen size={28} /></div>
                <h4>Faculty</h4>
                <p>Track Learning</p>
              </div>

              <div className="gx-floating-card gx-card3">
                <div className="gx-icon"><UserCog size={28} /></div>
                <h4>Librarians</h4>
                <p>Manage Records</p>
              </div>

              <div className="gx-floating-card gx-card4">
                <div className="gx-icon"><Shield size={28} /></div>
                <h4>Admins</h4>
                <p>Control System</p>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="gx-about">
          <div className="gx-container">
            <div className="gx-section-head">
              <h2>About <span>The Library</span></h2>
              <p>
                A library is a center of knowledge, learning, and discovery. It provides access to books,
                journals, digital resources, and reference materials that support education, research,
                personal growth, and lifelong learning.
              </p>
            </div>

            <div className="gx-about-grid">
              <div className="gx-glass-card">
                <h3>Library Overview</h3>
                <p>
                  The library plays an important role in every educational institution by creating a space
                  where readers can explore information, improve their understanding, and develop academic
                  skills. It supports students, faculty, and researchers by offering a wide range of
                  resources for study, innovation, and knowledge sharing.
                </p>
              </div>

              <div className="gx-glass-card">
                <h3>Library Services</h3>
                <ul className="gx-feature-list">
                  <li>Book issuing and returning services</li>
                  <li>Access to academic and reference materials</li>
                  <li>Reading and study support for learners</li>
                  <li>Digital catalog search facilities</li>
                  <li>Support for research, projects, and self-learning</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="gx-books">
          <div className="gx-container">
            <div className="gx-section-head">
              <h2>Featured <span>Books</span></h2>
              <p>
                These books are loaded from your real backend database, not from hardcoded sample data.
              </p>
            </div>

            <div className="gx-book-grid">
              {featuredBooks.length > 0 ? (
                featuredBooks.map((book) => (
                  <div className="gx-book-card" key={book._id}>
                    <div className="gx-book-cover">
                      {getFeaturedBookIcon(book.category, book.title)}
                    </div>
                    <h3>{book.title}</h3>
                    <p>
                      {book.author}<br />
                      ISBN: {book.isbn}
                    </p>
                    <span className="gx-badge">
                      {book.category || "General"} • {book.availableCopies} Available
                    </span>
                  </div>
                ))
              ) : (
                <div className="gx-book-card">
                  <div className="gx-book-cover">
                    <Sparkles size={54} />
                  </div>
                  <h3>No Books Yet</h3>
                  <p>Add books from the admin or librarian panel to show them here.</p>
                  <span className="gx-badge">Waiting for Data</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="gx-reviews">
          <div className="gx-container">
            <div className="gx-section-head">
              <h2>User <span>Reviews</span></h2>
              <p>
                Signed-in users can submit reviews. Other visitors can still read all reviews shared by users.
              </p>
            </div>

            <div className="gx-reviews-wrap">
              <div className="gx-glass-card">
                <h3>Give Your Review</h3>

                <div className="gx-review-lock">
                  {user
                    ? "Signed in successfully. You can now submit your review."
                    : "Please sign in to give a review."}
                </div>

                <form
                  className={`gx-review-form ${!user ? "disabled-form" : ""}`}
                  onSubmit={handleReviewSubmit}
                >
                  <input
                    type="text"
                    value={user?.name || ""}
                    placeholder="Your name"
                    readOnly
                  />

                  <select
                    name="rating"
                    value={reviewForm.rating}
                    onChange={handleReviewChange}
                    disabled={!user}
                    required
                  >
                    <option value="">Select rating</option>
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </select>

                  <textarea
                    name="message"
                    placeholder="Write your review..."
                    value={reviewForm.message}
                    onChange={handleReviewChange}
                    disabled={!user}
                    required
                  />

                  <button type="submit" className="gx-btn">
                    Submit Review
                  </button>
                </form>
              </div>

              <div className="gx-glass-card">
                <h3>Live Reviews</h3>

                <div className="gx-reviews-list">
                  {reviews.length > 0 ? (
                    [...reviews].reverse().map((review) => (
                      <div className="gx-review-card" key={review.id}>
                        <div className="gx-review-top">
                          <h4>{review.name}</h4>
                          <div className="gx-review-time">{review.time}</div>
                        </div>

                        <div className="gx-review-stars">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              size={16}
                              fill={index < review.rating ? "#ffb347" : "transparent"}
                              color="#ffb347"
                            />
                          ))}
                        </div>

                        <p>{review.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="gx-review-card">
                      <div className="gx-review-top">
                        <h4>No Reviews Yet</h4>
                        <div className="gx-review-time">-</div>
                      </div>
                      <p>Be the first signed-in user to share a review.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="gx-footer" id="gx-contact">
          <div className="gx-container">
            <div className="gx-footer-grid">
              <div className="gx-footer-brand">
                <div className="gx-brand">
                  <div className="gx-brand-icon">📚</div>
                  <div>VEMU <span>Library</span></div>
                </div>

                <p>
                  A knowledge hub that supports learning, reading, research, and academic excellence
                  through books, digital resources, and library services.
                </p>

                <div className="gx-contact-line">📞 +91-9952649690</div>
                <div className="gx-contact-line">📍 Chittoor, Andhra Pradesh, India</div>
                <div className="gx-contact-line">✉ libraryproject@gmail.com</div>
              </div>

              <div className="gx-footer-column">
                <h3>Company</h3>
                <ul>
                  <li><a href="#gx-home">Home</a></li>
                  <li><a href="#gx-about">About</a></li>
                  <li><a href="#gx-books">Books</a></li>
                  <li><a href="#gx-reviews">Reviews</a></li>
                </ul>
              </div>

              <div className="gx-footer-column">
                <h3>Library Services</h3>
                <ul>
                  <li><a href="#gx-books">Issue Books</a></li>
                  <li><a href="#gx-books">Return Books</a></li>
                  <li><a href="/login">Digital Access</a></li>
                  <li><a href="/login">Reading Support</a></li>
                </ul>
              </div>

              <div className="gx-footer-column">
                <h3>Categories</h3>
                <ul>
                  <li><a href="#gx-books">Engineering</a></li>
                  <li><a href="#gx-books">Programming</a></li>
                  <li><a href="#gx-books">Literature</a></li>
                  <li><a href="#gx-books">Research Books</a></li>
                </ul>
              </div>
            </div>

            <div className="gx-footer-bottom">
              <div>Powered by VEMU Department Library Management System</div>
              <div className="gx-footer-bottom-links">
                <a href="#gx-home">Home</a>
                <a href="#gx-about">About</a>
                <a href="#gx-books">Books</a>
                <a href="#gx-contact">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;