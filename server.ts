import { MCPServer } from "@mastra/mcp";
import { saasusDocsSearchTool } from "./tools/saasus-search-tool";
import { saasusDocsContentTool } from "./tools/saasus-content-tool";
import { saasusDocsSitemapTool } from "./tools/saasus-sitemap-tool";

const server = new MCPServer({
  name: "SaaSus Platform Docs Search",
  version: "1.1.0",
  tools: {
    saasusDocsSearchTool,
    saasusDocsContentTool,
    saasusDocsSitemapTool,
  },
});

server.startStdio();
