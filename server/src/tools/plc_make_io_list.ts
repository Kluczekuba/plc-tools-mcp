import { z } from "zod";

const Schema = z.object({ raw_text: z.string().min(10) });

export const plcMakeIoListTool = {
  name: "plc_make_io_list",
  description: "Convert raw IO description into a structured list.",
  input_schema: Schema.shape
};

export async function runPlcMakeIoList(args: unknown) {
  const input = Schema.parse(args);

  const io = input.raw_text
    .split("\n")
    .map((l, i) => ({
      name: `IO_${i + 1}`,
      type: "BOOL",
      dir: "IN",
      desc: l.trim()
    }))
    .filter(x => x.desc);

  return { io };
}
