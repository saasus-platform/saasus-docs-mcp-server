import { MCPServer } from "@mastra/mcp";
import { saasusDocsSearchTool } from "./tools/saasus-search-tool";
import { saasusDocsContentTool } from "./tools/saasus-content-tool";

const server = new MCPServer({
  name: "SaaSus Platform Docs Search",
  version: "0.1.0",
  tools: {
    saasusDocsSearchTool,
    saasusDocsContentTool,
  },
});

server.startStdio().then(() => {
  console.log("MCP Server is running...");
});
