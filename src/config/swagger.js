// src/config/swagger.js
const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Netbeans-server API",
      version: "1.0.0",
      description: "API documentation for users & job postings",
    },
    servers: [
      { url: "http://localhost:5000", description: "Local server" }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {    
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        UserCreate: {
          type: "object",
          required: ["full_name", "email", "password"],
          properties: {
            full_name: { type: "string", example: "Ravi Kumar" },
            email: { type: "string", format: "email", example: "ravi@example.com" },
            password: { type: "string", example: "raviPass123" },
            role: { type: "string", enum: ["ADMIN", "JOB_MANAGER"], example: "JOB_MANAGER" }
          }
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            full_name: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string" },
            created_at: { type: "string", format: "date-time" },
            created_by_admin_id: { type: "string", format: "uuid", nullable: true }
          }
        }
      }
    },
    security: [
      { bearerAuth: [] }
    ]
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
