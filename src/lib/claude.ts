import Anthropic from "@anthropic-ai/sdk";
import { tools, executeTool } from "../tools";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Cheap + fast for dev iteration. Swap to "claude-sonnet-5" once you're
// testing real prompt quality, not just plumbing.
const MODEL = "claude-haiku-4-5-20251001";

// Hard stop on tool round-trips so a confused model (or a tool that keeps
// producing input Claude wants to retry) can't loop forever on one request.
const MAX_TOOL_ROUNDS = 5;

export async function askClaude(message: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: message },
  ];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      tools,
      messages,
    });

    // stop_reason is "tool_use" only when Claude wants to call one or more
    // tools instead of answering directly. Anything else (usually
    // "end_turn") means it's done and content contains its final answer.
    if (response.stop_reason !== "tool_use") {
      const textBlock = response.content.find((block) => block.type === "text");
      return textBlock?.type === "text" ? textBlock.text : "";
    }

    // Claude's turn (which may mix explanatory text with one or more
    // tool_use blocks) goes back into the conversation verbatim...
    messages.push({ role: "assistant", content: response.content });

    // ...and each tool_use block gets a matching tool_result, sent back as
    // a "user" turn. tool_use_id is what lets Claude match a result to the
    // call that requested it when there's more than one in a turn.
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        const { result, isError } = await executeTool(block.name, block.input);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
          is_error: isError,
        });
      }
    }
    messages.push({ role: "user", content: toolResults });
  }

  return "I wasn't able to finish that after several tool calls — can you rephrase or try again?";
}
