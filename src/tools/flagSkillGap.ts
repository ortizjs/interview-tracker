import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "../lib/prisma";
import { formatDateUTC } from "../helpers/dateHelpers";

export interface FlagSkillGapInput {
  companyName: string;
  roundType?: string;
  name: string;
  notes?: string;
}

export const flagSkillGapSchema: Anthropic.Tool = {
  name: "flag_skill_gap",
  description:
    "Record a skill gap identified from an interview round — something the " +
    "candidate should improve on. Use this when the user mentions a " +
    "weakness, area to work on, or feedback pointing at a gap (e.g. " +
    "'I struggled with system design in that Shepherd interview').",
  input_schema: {
    type: "object",
    properties: {
      companyName: {
        type: "string",
        description:
          "Name of the company whose interview round this gap comes from",
      },
      roundType: {
        type: "string",
        description:
          "Round type, e.g. phone_screen, system_design, coding, behavioral. " +
          "Only needed if the company has more than one round on file and " +
          "it isn't clear which one the gap belongs to.",
      },
      name: {
        type: "string",
        description:
          "Short name of the skill gap, e.g. 'system design', 'bearer token auth'",
      },
      notes: {
        type: "string",
        description: "Any additional detail about the gap",
      },
    },
    required: ["companyName", "name"],
  },
};

export async function handleFlagSkillGap(
  input: FlagSkillGapInput
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
        `Ask the user which round this skill gap belongs to, then call this ` +
        `tool again including roundType.`
    );
  }

  const round = candidates[0];
  await prisma.skillGap.create({
    data: {
      roundId: round.id,
      name: input.name,
      notes: input.notes,
    },
  });
  return `Flagged a skill gap ("${input.name}") for the ${round.type} round with ${input.companyName}.`;
}
