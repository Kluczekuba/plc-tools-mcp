import express from "express";
import { z } from "zod";

import { plcGenerateStTool, runPlcGenerateSt } from "./tools/plc_generate_st.js";
import { plcReviewStTool, runPlcReviewSt } from "./tools/plc_review_st.js";
import { plcMakeIoListTool, runPlcMakeIoList } from "./tools/plc_make_io_list.js";

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/mcp/list_tools", (_req, res) => {
  res.json({
    server_name: "plc-tools",
    tools: [plcGenerateStTool, plcReviewStTool, plcMakeIoListTool]
  });
});

const CallSchema = z.object({
  tool: z.string(),
  arguments: z.unknown()
});

app.post("/mcp/call", async (req, res) => {
  const parsed = CallSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const { tool, arguments: args } = parsed.data;
  try {
    if (tool === plcGenerateStTool.name) {
      return res.json(await runPlcGenerateSt(args));
    }
    if (tool === plcReviewStTool.name) {
      return res.json(await runPlcReviewSt(args));
    }
    if (tool === plcMakeIoListTool.name) {
      return res.json(await runPlcMakeIoList(args));
    }
    return res.status(404).json({ error: `Unknown tool: ${tool}` });
  } catch (e: any) {
    return res.status(500).json({ error: String(e?.message ?? e) });
  }
});

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => {
  console.log(`PLC MCP server listening on http://localhost:${port}`);
});
