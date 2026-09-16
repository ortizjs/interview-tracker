import Anthropic from "@anthropic-ai/sdk";
import {
  logInterviewRoundSchema,
  handleLogInterviewRound,
  LogInterviewRoundInput,
} from "./logInterviewRound";

// Every tool schema Claude is allowed to call, aggregated for the API request.
// Adding a new tool = add its file, then list its schema here.
export const tools: Anthropic.Tool[] = [logInterviewRoundSchema];

// Routes a tool_use block to its handler by name and normalizes the result
// into the shape askClaude needs to build a tool_result content block.
export async function executeTool(
  name: string,
  input: unknown
): Promise<{ result: string; isError: boolean }> {
  try {
    switch (name) {
      case "log_interview_round":
        return {
          result: await handleLogInterviewRound(
            input as LogInterviewRoundInput
          ),
          isError: false,
        };
      default:
        return { result: `Unknown tool: ${name}`, isError: true };
    }
  } catch (err) {
    console.error(`Tool "${name}" failed:`, err);
    return {
      result: `Tool execution failed: ${err instanceof Error ? err.message : String(err)}`,
      isError: true,
    };
  }
}
