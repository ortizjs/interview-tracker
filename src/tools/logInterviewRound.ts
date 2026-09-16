import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "../lib/prisma";
import { formatDateUTC } from "../helpers/dateHelpers";

export interface LogInterviewRoundInput {
  companyName: string;
  roundType: string;
  date: string;
  interviewer?: string;
  notes?: string;
}

// `input_schema` is plain JSON Schema — it's what Claude validates its own
// generated arguments against before a tool_use block is ever produced.
export const logInterviewRoundSchema: Anthropic.Tool = {
  name: "log_interview_round",
  description:
    "Record a new interview round for a company in the tracker. Use this " +
    "when the user describes an interview they had, are scheduled for, " +
    "or want logged — e.g. a phone screen, technical round, or onsite.",
  input_schema: {
    type: "object",
    properties: {
      companyName: {
        type: "string",
        description: "Name of the company the interview was with",
      },
      roundType: {
        type: "string",
        description:
          "Type of round, e.g. phone_screen, system_design, coding, behavioral",
      },
      date: {
        type: "string",
        description: "ISO 8601 date of the interview, e.g. 2026-08-20",
      },
      interviewer: {
        type: "string",
        description: "Interviewer's name, if mentioned",
      },
      notes: {
        type: "string",
        description: "Any notes about the round the user shared",
      },
    },
    required: ["companyName", "roundType", "date"],
  },
};

/**
 * Writes the round Claude just parsed out of the conversation into the DB.
 */
export async function handleLogInterviewRound(
  input: LogInterviewRoundInput
): Promise<string> {
  let company = await prisma.company.findFirst({
    where: { name: input.companyName },
  });

  if (!company) {
    company = await prisma.company.create({
      data: { name: input.companyName },
    });
  }

  const round = await prisma.interviewRound.create({
    data: {
      companyId: company.id,
      type: input.roundType,
      date: new Date(input.date),
      interviewer: input.interviewer,
      notes: input.notes,
    },
  });

  return `Logged a ${input.roundType} round for ${input.companyName} on ${formatDateUTC(round.date)}.`;
}
