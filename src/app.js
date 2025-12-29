const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");


require("dotenv").config();

app.use(cors({
  origin: ["http://localhost:3000", "http://192.168.1.194:3000"], 
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));


app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);


// Swagger mount
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Auth routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

// Users
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// Jobs 
const jobRoutes = require("./routes/jobRoutes");
app.use("/api/jobs", jobRoutes);

// FORMS 
const formRoutes = require("./routes/formRoutes");
app.use("/api/forms", formRoutes);

module.exports = app;
