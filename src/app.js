const express = require("express");
const app = express();
require("dotenv").config();

app.use(express.json());

// Swagger mount
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Auth routes
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

// Users
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);
// Jobs 
const jobRoutes = require("./routes/jobRoutes");
app.use("/api/jobs", jobRoutes);

module.exports = app;
