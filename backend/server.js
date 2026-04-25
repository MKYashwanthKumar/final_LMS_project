require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");
const seedData = require("./src/seed/seedData");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    await seedData();

    app.listen(PORT, () => {
      console.log(`✅ Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();