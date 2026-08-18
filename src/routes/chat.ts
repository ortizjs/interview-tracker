import { Router, Request, Response } from "express";
import { askClaude } from "../lib/claude";

const router = Router();

router.post("/chat", async (req: Request, res: Response) => {
  const { message } = req.body as { message?: string };

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message (string) is required" });
  }

  try {
    const reply = await askClaude(message);
    res.json({ reply });
  } catch (err) {
    console.error("askClaude failed:", err);
    res.status(500).json({ error: "Failed to get response from Claude" });
  }
});

export default router;
