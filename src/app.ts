import express from "express";
import { ErrorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { AppError } from "./shared/errors.js";


const app = express();

app.use(express.json());

app.get("/health", (req, res, next) => {
  res.json({ message: "Welcome to codecurate backend!" });
});

app.get("/test-error", (req, res, next) => {
  const error = new AppError("This is test error", 400, "TEST_ERROR");
  next(error);
});

app.use(notFoundHandler);

app.use(ErrorHandler);

export { app };
