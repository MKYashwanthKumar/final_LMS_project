# VEMU DLMS - Department Library Management System

VEMU DLMS is a full stack MERN-based Department Library Management System developed for managing library operations for four user roles:

- Admin
- Librarian
- Faculty
- Student

The project includes role-based dashboards, book management, issue and return flow, fine calculation, recommendations, reservations, approval-based registration, and profile update requests.

---

# Tech Stack

## Frontend
- React.js
- Vite
- React Router DOM
- Axios
- Framer Motion
- Lucide React
- React Hot Toast

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

---

# Main Features

## Admin
- Approve or reject newly registered users
- Manage users
- Approve or reject faculty profile update requests
- View reports
- View transactions
- Data export and reset options

## Librarian
- Add new books
- Edit book details
- Delete books
- Issue books to students and faculty
- Accept returns
- Fine calculation for late returns
- Check stock availability
- View borrowing reports
- Get notifications for recommendations and reservations

## Faculty
- Login with faculty credentials
- Browse available books
- Reserve books
- Recommend new books to librarian
- View borrowing history
- Request profile updates through admin approval

## Student
- Login with student credentials
- Browse books
- View issued books
- View borrowing history
- Review books and use dashboard features

---

# Project Folder Structure

```bash
project-root/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   ├── package.json
│   ├── .env
│   └── ...
│
└── README.md