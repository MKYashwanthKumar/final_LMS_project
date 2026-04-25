const User = require("../models/User");
const Book = require("../models/Book");
const Transaction = require("../models/Transaction");
const Recommendation = require("../models/Recommendation");

function addDays(baseDate, days) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d;
}

async function seedUsers() {
  const count = await User.countDocuments();
  if (count > 0) return;

  await User.create([
    {
      name: "System Administrator",
      email: "admin@vemu.edu.in",
      username: "admin",
      password: "admin123",
      role: "admin",
      department: "Administration",
      accessStatus: "approved",
      approvedBy: "System",
      approvedAt: new Date()
    },
    {
      name: "Head Librarian",
      email: "librarian@vemu.edu.in",
      username: "librarian",
      password: "lib123",
      role: "librarian",
      department: "Library",
      accessStatus: "approved",
      approvedBy: "System",
      approvedAt: new Date()
    },
    {
      name: "Dr. Rajesh Kumar",
      email: "faculty@vemu.edu.in",
      username: "faculty",
      password: "fac123",
      role: "faculty",
      department: "CSE",
      facultyId: "FAC-101",
      accessStatus: "approved",
      approvedBy: "System",
      approvedAt: new Date()
    },
    {
      name: "Vamsi Krishna",
      email: "student@vemu.edu.in",
      username: "student",
      password: "stud123",
      role: "student",
      department: "CSE",
      studentId: "STU-301",
      year: "3rd Year",
      accessStatus: "approved",
      approvedBy: "System",
      approvedAt: new Date()
    }
  ]);

  console.log("✅ Default users seeded");
}

async function migrateExistingUsers() {
  await User.updateMany(
    {
      $or: [
        { accessStatus: { $exists: false } },
        { accessStatus: null },
        { accessStatus: "" }
      ]
    },
    {
      $set: {
        accessStatus: "approved",
        approvedBy: "Migration",
        approvedAt: new Date()
      }
    }
  );
}

async function seedBooks() {
  const count = await Book.countDocuments();
  if (count > 0) return;

  await Book.create([
    {
      title: "Database Management Systems",
      author: "Raghu Ramakrishnan",
      isbn: "9780072465638",
      category: "Computer Science",
      edition: "3rd",
      subject: "Database",
      totalCopies: 5,
      availableCopies: 5,
      issuedCopies: 0,
      rating: 4.6,
      status: "available"
    },
    {
      title: "Artificial Intelligence: A Modern Approach",
      author: "Stuart Russell",
      isbn: "9780134610993",
      category: "Computer Science",
      edition: "4th",
      subject: "Artificial Intelligence",
      totalCopies: 4,
      availableCopies: 4,
      issuedCopies: 0,
      rating: 4.8,
      status: "available"
    },
    {
      title: "Computer Networks",
      author: "Andrew S. Tanenbaum",
      isbn: "9780132126953",
      category: "Computer Science",
      edition: "5th",
      subject: "Networks",
      totalCopies: 3,
      availableCopies: 3,
      issuedCopies: 0,
      rating: 4.5,
      status: "available"
    },
    {
      title: "Introduction to Algorithms",
      author: "Thomas H. Cormen",
      isbn: "9780321573513",
      category: "Computer Science",
      edition: "3rd",
      subject: "Algorithms",
      totalCopies: 6,
      availableCopies: 6,
      issuedCopies: 0,
      rating: 4.7,
      status: "available"
    },
    {
      title: "Digital Electronics",
      author: "Morris Mano",
      isbn: "9780132543033",
      category: "Electronics",
      edition: "5th",
      subject: "Digital Electronics",
      totalCopies: 4,
      availableCopies: 4,
      issuedCopies: 0,
      rating: 4.4,
      status: "available"
    }
  ]);

  console.log("✅ Default books seeded");
}

async function seedTransactions() {
  const count = await Transaction.countDocuments();
  if (count > 0) return;

  const student = await User.findOne({ username: "student" });
  const faculty = await User.findOne({ username: "faculty" });

  const digitalElectronics = await Book.findOne({ title: "Digital Electronics" });
  const dbms = await Book.findOne({ title: "Database Management Systems" });
  const osLike = await Book.findOne({ title: "Computer Networks" });

  const today = new Date();

  const seededTransactions = [
    {
      user: student._id,
      book: digitalElectronics._id,
      borrowerName: student.name,
      borrowerRole: student.role,
      borrowerCode: student.studentId,
      bookTitle: digitalElectronics.title,
      bookIsbn: digitalElectronics.isbn,
      issueDate: addDays(today, -2),
      dueDate: addDays(today, 28),
      status: "active",
      fine: 0
    },
    {
      user: faculty._id,
      book: dbms._id,
      borrowerName: faculty.name,
      borrowerRole: faculty.role,
      borrowerCode: faculty.facultyId,
      bookTitle: dbms.title,
      bookIsbn: dbms.isbn,
      issueDate: addDays(today, -10),
      dueDate: addDays(today, 20),
      status: "active",
      fine: 0
    },
    {
      user: student._id,
      book: osLike._id,
      borrowerName: student.name,
      borrowerRole: student.role,
      borrowerCode: student.studentId,
      bookTitle: osLike.title,
      bookIsbn: osLike.isbn,
      issueDate: addDays(today, -20),
      dueDate: addDays(today, -5),
      status: "overdue",
      fine: 25
    }
  ];

  await Transaction.create(seededTransactions);

  digitalElectronics.availableCopies -= 1;
  digitalElectronics.issuedCopies += 1;
  digitalElectronics.status = "limited";

  dbms.availableCopies -= 1;
  dbms.issuedCopies += 1;
  dbms.status = "limited";

  osLike.availableCopies -= 1;
  osLike.issuedCopies += 1;
  osLike.status = "limited";

  await digitalElectronics.save();
  await dbms.save();
  await osLike.save();

  console.log("✅ Sample transactions seeded");
}

async function seedRecommendations() {
  const count = await Recommendation.countDocuments();
  if (count > 0) return;

  const faculty = await User.findOne({ username: "faculty" });

  if (!faculty) return;

  await Recommendation.create([
    {
      faculty: faculty._id,
      facultyName: faculty.name,
      department: faculty.department,
      title: "Deep Learning",
      author: "Ian Goodfellow",
      reason: "Useful for AI and ML students",
      status: "pending"
    },
    {
      faculty: faculty._id,
      facultyName: faculty.name,
      department: faculty.department,
      title: "Computer Architecture",
      author: "M. Morris Mano",
      reason: "Needed for hardware and system design subjects",
      status: "approved"
    }
  ]);

  console.log("✅ Sample recommendations seeded");
}

async function seedData() {
  await seedUsers();
  await migrateExistingUsers();
  await seedBooks();
  await seedTransactions();
  await seedRecommendations();
}

module.exports = seedData;