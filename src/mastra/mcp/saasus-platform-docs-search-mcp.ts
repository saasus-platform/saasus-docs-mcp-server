import { MCPServer } from "@mastra/mcp";
import { saasusDocsSearchTool } from "../tools/saasus-search-tool";
import { saasusDocsContentTool } from "../tools/saasus-content-tool";
import { saasusDocsSitemapTool } from "../tools/saasus-sitemap-tool";
import { version } from "../../../package.json";

export const mcpServer = new MCPServer({
  name: "SaaSus Platform Docs Search",
  version,
  tools: {
    saasusDocsSearchTool,
    saasusDocsContentTool,
    saasusDocsSitemapTool,
  },
});
