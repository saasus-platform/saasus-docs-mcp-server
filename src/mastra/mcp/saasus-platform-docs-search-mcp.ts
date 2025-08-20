import { MCPServer } from "@mastra/mcp";
import { saasusDocsSearchTool } from "../tools/saasus-search-tool.js";
import { saasusDocsContentTool } from "../tools/saasus-content-tool.js";
import { saasusDocsSitemapTool } from "../tools/saasus-sitemap-tool.js";
import packageJson from "../../../package.json" with { type: "json" };

export const mcpServer = new MCPServer({
  name: "SaaSus Platform Docs Search",
  version: packageJson.version,
  tools: {
    saasusDocsSearchTool,
    saasusDocsContentTool,
    saasusDocsSitemapTool,
  },
});
