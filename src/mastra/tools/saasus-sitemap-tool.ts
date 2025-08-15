import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { JSDOM } from "jsdom";

export const saasusDocsSitemapTool = createTool({
  id: "saasus-docs-sitemap",
  description:
    "Fetch the sitemap XML from SaaSus Platform documentation to get a list of all available URLs. Useful for discovering all documentation pages and their structure, especially when search doesn't return relevant results or you need to browse the complete site hierarchy. Use with saasus-docs-get-content tool to fetch specific article content.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    baseUrl: z.string(),
    structure: z.record(z.any()),
  }),
  execute: async () => {
    return await fetchSaaSusSitemap();
  },
});

const fetchSaaSusSitemap = async (): Promise<{
  baseUrl: string;
  structure: Record<string, any>;
}> => {
  const sitemapUrl = "https://docs.saasus.io/ja/sitemap.xml";

  const response = await fetch(sitemapUrl);
  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: Failed to fetch sitemap from ${sitemapUrl}`
    );
  }

  const xmlText = await response.text();

  // Parse XML using JSDOM
  const dom = new JSDOM(xmlText, { contentType: "text/xml" });
  const document = dom.window.document;

  const baseUrl = "https://docs.saasus.io";

  const paths = Array.from(document.querySelectorAll("url")).map(
    (urlElement) => {
      const fullUrl = urlElement.querySelector("loc")?.textContent || "";
      return fullUrl.replace(baseUrl, "");
    }
  );

  // Build compact hierarchical structure using arrays for leafs only
  const structure: Record<string, any> = {};

  paths.forEach((path) => {
    if (!path) return;

    const segments = path.split("/").filter((segment) => segment);
    let current = structure;

    segments.forEach((segment, index) => {
      if (index === segments.length - 1) {
        // Last segment - set as 1 (endpoint marker)
        if (typeof current[segment] === "object") {
          current[segment]["/"] = 1; // Mark as endpoint in existing object
        } else {
          current[segment] = 1; // Simple endpoint
        }
      } else {
        // Intermediate segment
        if (!current[segment]) {
          current[segment] = {};
        } else if (current[segment] === 1) {
          // Convert endpoint to object with endpoint marker
          current[segment] = { "/": 1 };
        }
        current = current[segment];
      }
    });
  });

  return { baseUrl, structure };
};
