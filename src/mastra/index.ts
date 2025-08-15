import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { mcpServer } from "./mcp/saasus-platform-docs-search-mcp";

export const mastra = new Mastra({
  mcpServers: { mcpServer },
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});
