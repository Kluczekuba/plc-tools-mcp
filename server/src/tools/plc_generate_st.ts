import { z } from "zod";

const Schema = z.object({
  platform: z.enum(["Siemens_S7", "CODESYS", "Rockwell", "Beckhoff"]).default("Siemens_S7"),
  program_name: z.string().default("Main"),
  io: z.array(z.object({
    name: z.string(),
    type: z.enum(["BOOL", "INT", "DINT", "REAL"]),
    dir: z.enum(["IN", "OUT", "INOUT"]).default("IN"),
    desc: z.string().optional()
  })).default([]),
  description: z.string().min(10),
  safety: z.object({
    e_stop: z.string().optional(),
    fault_latch: z.boolean().default(true)
  }).default({ fault_latch: true })
});

export const plcGenerateStTool = {
  name: "plc_generate_st",
  description: "Generate IEC 61131-3 Structured Text skeleton + safety interlocks.",
  input_schema: Schema.shape
};

export async function runPlcGenerateSt(args: unknown) {
  const input = Schema.parse(args);

  const vars = input.io.map(v =>
    `  ${v.name} : ${v.type};${v.desc ? ` // ${v.desc}` : ""}`
  ).join("\n");

  const safety = input.safety.e_stop
    ? `IF ${input.safety.e_stop} THEN\n  Fault := TRUE;\nEND_IF;\n`
    : `// E-Stop nie podany\n`;

  return {
    program_name: input.program_name,
    st_code: `PROGRAM ${input.program_name}
VAR
${vars || "  // TODO: zmienne IO"}
  Fault : BOOL := FALSE;
END_VAR

// ${input.description.split("\n").map(l => "// " + l).join("\n")}

${safety}

IF Fault THEN
  // TODO: safe state outputs
ELSE
  // TODO: logic
END_IF;

END_PROGRAM
`,
    checklist: [
      "Zweryfikuj mapowanie I/O w IDE.",
      "Przetestuj w symulatorze/na sucho.",
      "Zweryfikuj E-Stop i przejścia do stanu bezpiecznego."
    ]
  };
}
