import "dotenv/config";
import app from "./app.js";
import connectDatabase from "./config/db.js";
import ensureSuperAdmin from "./utils/ensureSuperAdmin.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDatabase();
    await ensureSuperAdmin();

    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT} ✨`);
    });
  } catch (error) {
    console.error("Unable to start backend server:", error.message);
    process.exit(1);
  }
};

startServer();
