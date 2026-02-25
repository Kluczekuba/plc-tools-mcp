import { z } from "zod";

const Schema = z.object({
  platform: z.enum(["Siemens_S7","CODESYS","Rockwell","Beckhoff"]).default("Siemens_S7"),
  st_code: z.string().min(20)
});

export const plcReviewStTool = {
  name: "plc_review_st",
  description: "Review Structured Text: common pitfalls, safety checks.",
  input_schema: Schema.shape
};

export async function runPlcReviewSt(args: unknown) {
  const input = Schema.parse(args);
  const findings: string[] = [];
  if (!/END_PROGRAM/i.test(input.st_code)) findings.push("Brak END_PROGRAM.");
  if (!/Fault/i.test(input.st_code)) findings.push("Brak obsługi Fault latch/safe state.");
  return { platform: input.platform, findings };
}
