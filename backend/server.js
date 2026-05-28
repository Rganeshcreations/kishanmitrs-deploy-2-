require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// ✅ redirect root to home
app.get("/", (req, res) => {
 res.redirect("/index.html");
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// ✅ AUTO PAGE ROUTE (FIXED)
app.get("/:page", (req, res) => {
  const page = req.params.page;

  res.sendFile(
    path.join(__dirname, "../frontend", page + ".html"),
    (err) => {
      if (err) {
        res.status(404).send("Page Not Found ❌");
      }
    }
  );
});

// error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 KisanMitra Server running on port ${PORT}`);
});