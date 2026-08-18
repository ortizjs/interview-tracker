import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Cheap + fast for dev iteration. Swap to "claude-sonnet-5" once you're
// testing real prompt quality, not just plumbing.
const MODEL = "claude-haiku-4-5-20251001";

export async function askClaude(message: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: message }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.type === "text" ? textBlock.text : "";
}
