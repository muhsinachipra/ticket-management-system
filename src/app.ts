// src\app.ts

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import userRoutes from "./routes/userRoutes";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(userRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
