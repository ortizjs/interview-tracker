import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "../lib/prisma";
import { formatDateUTC } from "../helpers/dateHelpers";

export interface LogFeedbackInput {
  companyName: string;
  roundType?: string;
  source: string;
  text: string;
}

export const logFeedbackSchema: Anthropic.Tool = {
  name: "log_feedback",
  description:
    "Record feedback about an interview round — something a recruiter " +
    "said, or a self-assessment after the round. Use this when the user " +
    "shares feedback they received or their own reflection on how a " +
    "round went.",
  input_schema: {
    type: "object",
    properties: {
      companyName: {
        type: "string",
        description:
          "Name of the company whose interview round this feedback is about",
      },
      roundType: {
        type: "string",
        description:
          "Round type, e.g. phone_screen, system_design, coding, behavioral. " +
          "Only needed if the company has more than one round on file and " +
          "it isn't clear which one the feedback belongs to.",
      },
      source: {
        type: "string",
        description: 'Who the feedback is from: "recruiter" or "self_assessed"',
      },
      text: {
        type: "string",
        description: "The feedback itself, as shared by the user",
      },
    },
    required: ["companyName", "source", "text"],
  },
};

export async function handleLogFeedback(
  input: LogFeedbackInput
): Promise<string> {
  const candidates = await prisma.interviewRound.findMany({
    where: {
      company: { name: input.companyName },
      ...(input.roundType ? { type: input.roundType } : {}),
    },
    orderBy: { date: "desc" },
  });

  if (candidates.length === 0) {
    throw new Error(
      `No interview round found for ${input.companyName}` +
        `${input.roundType ? ` (${input.roundType})` : ""}. Ask the user ` +
        `to confirm the company name, or log the round first.`
    );
  }

  if (candidates.length > 1) {
    const options = candidates
      .map((r) => `${r.type} on ${formatDateUTC(r.date)}`)
      .join(", ");
    throw new Error(
      `Found multiple interview rounds for ${input.companyName}: ${options}. ` +
        `Ask the user which round this feedback belongs to, then call this ` +
        `tool again including roundType.`
    );
  }

  const round = candidates[0];

  await prisma.feedback.create({
    data: {
      roundId: round.id,
      source: input.source,
      text: input.text,
    },
  });
  return `Logged ${input.source} feedback for the ${round.type} round with ${input.companyName}.`;
}
