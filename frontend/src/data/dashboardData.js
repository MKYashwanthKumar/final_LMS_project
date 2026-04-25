export const roleBasePaths = {
  admin: "/admin",
  librarian: "/librarian",
  faculty: "/faculty",
  student: "/student"
};

export const demoCredentials = {
  admin: { username: "admin", password: "admin123", role: "admin" },
  librarian: { username: "librarian", password: "lib123", role: "librarian" },
  faculty: { username: "faculty", password: "fac123", role: "faculty" },
  student: { username: "student", password: "stud123", role: "student" }
};

export const roleNavConfig = {
  admin: [
    { section: "MAIN", label: "Dashboard", to: "/admin" },
    { section: "MAIN", label: "User Management", to: "/admin/users" },
    { section: "MAIN", label: "All Transactions", to: "/admin/transactions" },
    { section: "SYSTEM", label: "Reports", to: "/admin/reports" },
    { section: "SYSTEM", label: "Data Management", to: "/admin/data" }
  ],
  librarian: [
    { section: "MAIN", label: "Dashboard", to: "/librarian" },
    { section: "MAIN", label: "Manage Books", to: "/librarian/books" },
    { section: "MAIN", label: "Transactions", to: "/librarian/transactions" },
    { section: "MAIN", label: "Users", to: "/librarian/users" },
    { section: "ACTIONS", label: "Issue Book", to: "/librarian/issue-book" },
    { section: "ACTIONS", label: "Return Book", to: "/librarian/return-book" }
  ],
  faculty: [
    { section: "MAIN", label: "Dashboard", to: "/faculty" },
    { section: "MAIN", label: "Browse Books", to: "/faculty/browse-books" },
    { section: "MAIN", label: "Borrowing History", to: "/faculty/history" },
    { section: "ACCOUNT", label: "Recommendations", to: "/faculty/recommendations" },
    { section: "ACCOUNT", label: "Profile", to: "/faculty/profile" }
  ],
  student: [
  { section: "MAIN", label: "Dashboard", to: "/student" },
  { section: "MAIN", label: "Browse Books", to: "/student/browse-books" },
  { section: "MAIN", label: "My History", to: "/student/history" },
  { section: "ACCOUNT", label: "Request New Book", to: "/student/settings" },
  { section: "ACCOUNT", label: "Profile", to: "/student/profile" }
]
};

export const roleSearchPlaceholders = {
  admin: "Search users, books...",
  librarian: "Search books or users...",
  faculty: "Search books...",
  student: "Search books..."
};

export const sampleBooks = [
  {
    category: "Computer Science",
    title: "Database Management Systems",
    author: "Raghu Ramakrishnan",
    isbn: "978-0072465638",
    availability: "3 Available"
  },
  {
    category: "Computer Science",
    title: "Artificial Intelligence: A Modern Approach",
    author: "Stuart Russell",
    isbn: "978-0134610993",
    availability: "1 Available"
  },
  {
    category: "Computer Science",
    title: "Computer Networks",
    author: "Andrew S. Tanenbaum",
    isbn: "978-0132126953",
    availability: "2 Available"
  },
  {
    category: "Computer Science",
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    isbn: "978-0321573513",
    availability: "4 Available"
  },
  {
    category: "Electronics",
    title: "Digital Electronics",
    author: "Morris Mano",
    isbn: "978-0132543033",
    availability: "2 Available"
  },
  {
    category: "Mechanical",
    title: "Thermodynamics: An Engineering Approach",
    author: "Yunus Cengel",
    isbn: "978-0073398174",
    availability: "2 Available"
  }
];

export const sampleUsers = [
  {
    id: "USR-001",
    name: "System Administrator",
    role: { type: "badge", label: "Admin", tone: "primary" },
    department: "Administration",
    email: "admin@vemu.edu.in"
  },
  {
    id: "USR-002",
    name: "Head Librarian",
    role: { type: "badge", label: "Librarian", tone: "info" },
    department: "Library",
    email: "librarian@vemu.edu.in"
  },
  {
    id: "USR-003",
    name: "Dr. Rajesh Kumar",
    role: { type: "badge", label: "Faculty", tone: "warning" },
    department: "CSE",
    email: "faculty@vemu.edu.in"
  },
  {
    id: "USR-004",
    name: "Vamsi Krishna",
    role: { type: "badge", label: "Student", tone: "success" },
    department: "CSE",
    email: "student@vemu.edu.in"
  }
];

export const sampleTransactions = [
  {
    id: "007",
    book: {
      type: "stack",
      title: "Digital Electronics",
      subtitle: "Morris Mano"
    },
    user: {
      type: "stack",
      title: "Vamsi Krishna",
      subtitle: "Student"
    },
    issueDate: "23 Apr 2026",
    dueDate: "23 May 2026",
    status: { type: "badge", label: "Active", tone: "success" },
    fine: { type: "amount", label: "Rs. 0.00" }
  },
  {
    id: "003",
    book: {
      type: "stack",
      title: "Database Management Systems",
      subtitle: "Raghu Ramakrishnan"
    },
    user: {
      type: "stack",
      title: "Dr. Rajesh Kumar",
      subtitle: "Faculty"
    },
    issueDate: "13 Apr 2026",
    dueDate: "13 May 2026",
    status: { type: "badge", label: "Active", tone: "success" },
    fine: { type: "amount", label: "Rs. 0.00" }
  },
  {
    id: "002",
    book: {
      type: "stack",
      title: "Operating System Concepts",
      subtitle: "Abraham Silberschatz"
    },
    user: {
      type: "stack",
      title: "Vamsi Krishna",
      subtitle: "Student"
    },
    issueDate: "03 Apr 2026",
    dueDate: "18 Apr 2026",
    status: { type: "badge", label: "Overdue", tone: "danger" },
    fine: { type: "amount", label: "Rs. 25.00", tone: "danger" }
  }
];

export const sampleFacultyHistory = [
  {
    book: {
      type: "stack",
      title: "Database Management Systems",
      subtitle: "Raghu Ramakrishnan"
    },
    issueDate: "13 Apr 2026",
    dueDate: "13 May 2026",
    status: { type: "badge", label: "Active", tone: "success" },
    daysLeft: "20 days left"
  },
  {
    book: {
      type: "stack",
      title: "Artificial Intelligence: A Modern Approach",
      subtitle: "Stuart Russell"
    },
    issueDate: "21 Apr 2026",
    dueDate: "21 May 2026",
    status: { type: "badge", label: "Active", tone: "success" },
    daysLeft: "28 days left"
  },
  {
    book: {
      type: "stack",
      title: "Computer Networks",
      subtitle: "Andrew S. Tanenbaum"
    },
    issueDate: "29 Mar 2026",
    dueDate: "18 Apr 2026",
    status: { type: "badge", label: "Overdue", tone: "danger" },
    daysLeft: { type: "amount", label: "5 days overdue", tone: "danger" }
  }
];

export const sampleStudentCurrent = [
  {
    book: {
      type: "stack",
      title: "Data Structures and Algorithms",
      subtitle: "Thomas H. Cormen"
    },
    issueDate: "08 Apr 2026",
    dueDate: "08 May 2026",
    status: { type: "badge", label: "Active", tone: "success" },
    fine: { type: "amount", label: "Rs. 0.00" },
    action: { type: "button", label: "Return", tone: "success" }
  },
  {
    book: {
      type: "stack",
      title: "Digital Electronics",
      subtitle: "Morris Mano"
    },
    issueDate: "23 Apr 2026",
    dueDate: "23 May 2026",
    status: { type: "badge", label: "Active", tone: "success" },
    fine: { type: "amount", label: "Rs. 0.00" },
    action: { type: "button", label: "Return", tone: "success" }
  },
  {
    book: {
      type: "stack",
      title: "Operating System Concepts",
      subtitle: "Abraham Silberschatz"
    },
    issueDate: "03 Apr 2026",
    dueDate: "18 Apr 2026",
    status: { type: "badge", label: "Overdue", tone: "danger" },
    fine: { type: "amount", label: "Rs. 25.00", tone: "danger" },
    action: { type: "button", label: "Return", tone: "success" }
  }
];

export const sampleRecommendations = [
  {
    title: {
      type: "stack",
      title: "Deep Learning",
      subtitle: "Ian Goodfellow"
    },
    faculty: "Dr. Rajesh Kumar",
    reason: "Useful for final-year AI and ML students.",
    status: { type: "badge", label: "Pending", tone: "warning" }
  },
  {
    title: {
      type: "stack",
      title: "Computer Architecture",
      subtitle: "M. Morris Mano"
    },
    faculty: "Dr. Rajesh Kumar",
    reason: "Needed for hardware and system design subjects.",
    status: { type: "badge", label: "Approved", tone: "success" }
  }
];

export const homeDashboardContent = {
  admin: {
    title: "Admin Dashboard",
    stats: [
      { label: "Total Users", value: "6", badge: "Registered", tone: "success" },
      { label: "Total Books", value: "52", badge: "All Copies", tone: "info" },
      { label: "Active Issues", value: "5", badge: "Currently Out", tone: "warning" },
      { label: "Overdue", value: "2", badge: "Needs Attention", tone: "danger" },
      { label: "Total Fines", value: "Rs. 105.00", badge: "Collected", tone: "primary" },
      { label: "Today's Issues", value: "1", badge: "Today", tone: "success" }
    ],
    summaryCards: [
      { title: "Admins", value: "1" },
      { title: "Librarians", value: "1" },
      { title: "Faculty", value: "1" },
      { title: "Students", value: "3" }
    ],
    table: {
      title: "Recent Transactions",
      columns: [
        { key: "id", label: "ID" },
        { key: "book", label: "Book" },
        { key: "user", label: "User" },
        { key: "issueDate", label: "Issue Date" },
        { key: "dueDate", label: "Due Date" },
        { key: "status", label: "Status" },
        { key: "fine", label: "Fine" }
      ],
      rows: sampleTransactions
    }
  },

  librarian: {
    title: "Librarian Dashboard",
    actions: ["Issue Book", "Return Book", "Add New Book"],
    stats: [
      { label: "Total Books", value: "52", badge: "All Copies", tone: "info" },
      { label: "Available", value: "31", badge: "Ready to Issue", tone: "success" },
      { label: "Issued Today", value: "1", badge: "Today", tone: "warning" },
      { label: "Fines Collected", value: "Rs. 105.00", badge: "Total", tone: "primary" }
    ],
    activities: {
      title: "Recent Activity",
      items: [
        "Digital Electronics issued to Vamsi Krishna (student) on 23 Apr 2026",
        "Artificial Intelligence: A Modern Approach issued to Dr. Rajesh Kumar (faculty) on 21 Apr 2026",
        "Introduction to Algorithms issued to Mallikarjun (student) on 18 Apr 2026",
        "Database Management Systems issued to Dr. Rajesh Kumar (faculty) on 13 Apr 2026"
      ]
    }
  },

  faculty: {
    title: "Faculty Dashboard",
    stats: [
      { label: "Books Issued", value: "3", badge: "Active", tone: "success" },
      { label: "Reserved", value: "0", badge: "Pending", tone: "warning" },
      { label: "Library Collection", value: "12", badge: "Total Titles", tone: "info" },
      { label: "Borrowing Limit", value: "10", badge: "Extended", tone: "primary" }
    ],
    table: {
      title: "Currently Issued Books",
      columns: [
        { key: "book", label: "Book" },
        { key: "issueDate", label: "Issue Date" },
        { key: "dueDate", label: "Due Date" },
        { key: "status", label: "Status" },
        { key: "daysLeft", label: "Days Left" }
      ],
      rows: sampleFacultyHistory
    }
  },

  student: {
    title: "Student Dashboard",
    stats: [
      { label: "Books Issued", value: "2", badge: "Currently Active", tone: "success" },
      { label: "Due Soon", value: "0", badge: "Within 7 days", tone: "warning" },
      { label: "Overdue", value: "1", badge: "Fine Applied", tone: "danger" },
      { label: "Total Fines", value: "Rs. 25.00", badge: "Pay at Library", tone: "primary" }
    ],
    table: {
      title: "Currently Issued Books",
      columns: [
        { key: "book", label: "Book" },
        { key: "issueDate", label: "Issue Date" },
        { key: "dueDate", label: "Due Date" },
        { key: "status", label: "Status" },
        { key: "fine", label: "Fine" },
        { key: "action", label: "Action" }
      ],
      rows: sampleStudentCurrent
    },
    books: {
      title: "Recommended For You",
      items: sampleBooks.slice(0, 5),
      actionLabel: "Request Book"
    }
  }
};