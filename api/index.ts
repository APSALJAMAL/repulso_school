import express from "express";
import cors from "cors";

import usersRoute from "./routes/usersRoute";
import schoolsRoute from "./routes/schoolsRoute";
import devicesRoute from "./routes/devicesRoute";

import announcement from "./routes/announcements";
import examRoutes from "./routes/exam.routes";
import examMarkRoutes from "./routes/examMarkRoutes";
import markattendance from "./routes/attendanceRoutes";
import customFieldRoutes from "./routes/customField.routes";
const port = process.env.PORT || 5555;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(
  cors({
    origin: "http://localhost:3000", // ✅ use exact frontend URL
    credentials: true,               // ✅ allow cookies/auth headers
    exposedHeaders: ["Authorization"],
  })
);


app.get("/", (req, res) => {
  return res.send("backend is online!");
});

app.listen(port, () => {
  console.log(`App is listening to port: ${port}`);
});

app.use("/api", usersRoute);
app.use("/api", schoolsRoute);
app.use("/api", devicesRoute);

app.use("/api/announcements", announcement);
app.use("/api/exams", examRoutes);
app.use("/api/exam-marks", examMarkRoutes);
app.use("/api/markattendance", markattendance);
app.use("/api", customFieldRoutes);

