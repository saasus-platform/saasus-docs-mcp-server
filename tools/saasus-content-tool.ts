import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import TurndownService from "turndown";
import { JSDOM } from "jsdom";

export const saasusDocsContentTool = createTool({
  id: "saasus-docs-get-content",
  description:
    "Fetch the full content of a SaaSus Platform documentation article from its URL. Use this tool after getting URLs from saasus-docs-search-urls tool or saasus-docs-sitemap tool to retrieve the complete article content.",
  inputSchema: z.object({
    url: z
      .string()
      .describe(
        "The URL of the SaaSus Platform documentation article to fetch"
      ),
  }),
  outputSchema: z.object({
    url: z.string(),
    title: z.string(),
    content: z.string(),
  }),
  execute: async ({ context }) => {
    return await fetchSaaSusDocsContent(context.url);
  },
});

const fetchSaaSusDocsContent = async (
  url: string
): Promise<{ url: string; title: string; content: string }> => {
  if (!url) {
    throw new Error("URL is required");
  }

  // Ensure URL is a SaaSus Platform docs URL for security
  if (!url.startsWith("https://docs.saasus.io")) {
    throw new Error("URL must be a SaaSus Platform documentation URL");
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: Failed to fetch content from ${url}`
    );
  }

  const html = await response.text();

  // Extract title from HTML
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : "";

  // Parse HTML with DOM to extract clean content
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Find the main article content
  let articleElement = document.querySelector("article.markdown");
  if (!articleElement) {
    articleElement = document.querySelector("article");
  }
  if (!articleElement) {
    articleElement = document.querySelector("main");
  }

  if (!articleElement) {
    throw new Error("Could not find article content");
  }

  // Remove unwanted elements using DOM manipulation
  const unwantedSelectors = [
    "nav", // Navigation elements
    "ul:first-child", // First ul is likely breadcrumb/navigation
  ];

  unwantedSelectors.forEach((selector) => {
    const elements = articleElement!.querySelectorAll(selector);
    elements.forEach((el) => el.remove());
  });

  // Convert to Markdown with enhanced settings
  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    emDelimiter: "*",
    strongDelimiter: "**",
  });

  // Add rule to remove anchor links
  turndownService.addRule("removeAnchorLinks", {
    filter: function (node: any) {
      return (
        node.nodeName === "A" && node.getAttribute("href")?.startsWith("#")
      );
    },
    replacement: function () {
      return "";
    },
  });

  const content = turndownService
    .turndown(articleElement.innerHTML)
    .replace(/\n{3,}/g, "\n\n") // Normalize line breaks
    .trim();

  return {
    url,
    title,
    content,
  };
};
