import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import PanelCard from "../../components/common/PanelCard";
import StatsGrid from "../../components/dashboard/StatsGrid";
import BookGrid from "../../components/dashboard/BookGrid";
import api from "../../services/apiClient";
import { roleNavConfig, roleSearchPlaceholders } from "../../data/dashboardData";

const ManageBooks = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data } = await api.get("/books");

        const formattedBooks = data.books.map((book) => ({
          category: book.category || "General",
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          availability: `${book.availableCopies} Available`
        }));

        setBooks(formattedBooks);
      } catch (error) {
        console.error("Failed to load books:", error);
      }
    };

    fetchBooks();
  }, []);

  const stats = [
    {
      label: "Total Titles",
      value: String(books.length),
      badge: "Library",
      tone: "info"
    },
    {
      label: "Available",
      value: String(
        books.filter((book) => !book.availability.startsWith("0")).length
      ),
      badge: "Ready",
      tone: "success"
    },
    {
      label: "Limited / Out",
      value: String(
        books.filter((book) => book.availability.startsWith("0")).length
      ),
      badge: "Check Stock",
      tone: "warning"
    },
    {
      label: "Catalog",
      value: "Live",
      badge: "Backend Connected",
      tone: "primary"
    }
  ];

  return (
    <DashboardLayout
      role="admin"
      title="Book Management"
      searchPlaceholder={roleSearchPlaceholders.admin}
      navItems={roleNavConfig.admin}
    >
      <StatsGrid stats={stats} />

      <PanelCard title="Library Books">
        <BookGrid books={books} actionLabel="Edit Book" />
      </PanelCard>
    </DashboardLayout>
  );
};

export default ManageBooks;