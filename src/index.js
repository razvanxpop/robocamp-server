import dotenv from "dotenv";
import express from "express";
import setupMiddleware from "./middleware/middleware.js";
import authRoutes from "./routes/auth-routers.js";
import robotRoutes from "./routes/robot-routes.js";
import taskRoutes from "./routes/task-routes.js";
import { robotGenerator, taskGenerator } from "./utils/cronjob.js";
import "./utils/socket.js";

dotenv.config();

const app = express();

// Setup middleware
setupMiddleware(app);

// Use utils to generate robots and tasks
//robotGenerator();
//taskGenerator();

// Routes
app.use('/api/robots', robotRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);

// Start the server
app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server is listening at http://localhost:${process.env.SERVER_PORT}`);
});

export default app;











// ! Note: The routes are not protected with authentication or authorization for simplicity.
// ! In a real-world application, you should implement proper authentication and authorization mechanisms.
// ! For example, you can use JSON Web Tokens (JWT) for authentication and role-based access control (RBAC) for authorization.
// ! You can also use Passport.js for authentication strategies.
// ! You can also use OAuth 2.0 for authentication and authorization.
// ! You can also use Firebase Authentication for authentication.
// ! You can also use Auth0 for authentication and authorization.

// ! Implement tests: Implement unit tests and integration tests for the service layer, controllers, and routes.
// TODO Add unit tests for each endpoint
// TODO Add validation middleware
// TODO Catch unhandled promise rejections
// ! Handle uncaught exceptions