import "dotenv/config";
import express from "express";
import cors from "cors";
import chatRouter from "./routes/chat";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", chatRouter);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
