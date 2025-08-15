import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import lunr from "lunr";
import stemmerSupport from "lunr-languages/lunr.stemmer.support.js";
import tinyseg from "lunr-languages/tinyseg.js";
import ja from "lunr-languages/lunr.ja.js";

// Initialize Japanese language support
stemmerSupport(lunr);
tinyseg(lunr);
ja(lunr);

const INDEX_URL = "https://docs.saasus.io/ja/search-index.json";

interface SearchResult {
  score: number;
  title: string;
  url: string;
  excerpt: string;
}

interface Document {
  i: number;
  t?: string;
  u?: string;
  s?: string;
}

interface IndexItem {
  index: any;
  documents: Document[];
}

export const saasusDocsSearchTool = createTool({
  id: "saasus-docs-search-urls",
  description:
    "Search SaaSus Platform documentation to find relevant article URLs. Use this tool first to find relevant articles, then use saasus-docs-get-content tool to fetch the full content of specific articles.",
  inputSchema: z.object({
    query: z
      .string()
      .describe("Search query to find relevant SaaSus Platform documentation"),
  }),
  outputSchema: z.object({
    query: z.string(),
    results: z.array(
      z.object({
        score: z.number(),
        title: z.string(),
        url: z.string(),
        excerpt: z.string(),
      })
    ),
  }),
  execute: async ({ context }) => {
    return await searchSaaSusDocs(context.query);
  },
});

const searchSaaSusDocs = async (
  query: string
): Promise<{ query: string; results: SearchResult[] }> => {
  if (!query) {
    throw new Error("Query is required");
  }

  const response = await fetch(INDEX_URL);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const indexData = await response.json();
  if (!Array.isArray(indexData)) {
    throw new Error("Index is not array (expected array)");
  }

  const results = indexData.flatMap((indexItem: IndexItem) => {
    const index = lunr.Index.load(indexItem.index);
    const store = indexItem.documents;

    // Try multiple search strategies for better recall
    const searchStrategies = [];

    // Always try exact query first
    searchStrategies.push(query);

    // For single word queries, add wildcard variations
    const words = query.trim().split(/\s+/);
    if (words.length === 1) {
      searchStrategies.push(`${query}*`); // Prefix wildcard
      searchStrategies.push(`*${query}*`); // Contains wildcard

      // Only add character-split search for very short single words (1-3 characters)
      if (query.length <= 3) {
        searchStrategies.push(query.split("").join("* ") + "*");
      }
    } else {
      // For multi-word queries, try different combinations
      searchStrategies.push(words.map((word) => `${word}*`).join(" ")); // Each word with prefix wildcard
      searchStrategies.push(words.map((word) => `*${word}*`).join(" ")); // Each word with contains wildcard
    }

    const allResults = new Map<string, lunr.Index.Result>();

    searchStrategies.forEach((searchQuery, strategyIndex) => {
      try {
        const strategyResults = index.search(searchQuery);
        strategyResults.forEach((result) => {
          const key = String(result.ref);
          if (
            !allResults.has(key) ||
            allResults.get(key)!.score < result.score
          ) {
            // Adjust score based on strategy (exact matches get higher scores)
            const adjustedScore = result.score * (1 - strategyIndex * 0.1);
            allResults.set(key, { ...result, score: adjustedScore });
          }
        });
      } catch (error) {
        // Ignore search errors for complex wildcard queries
      }
    });

    return Array.from(allResults.values()).map((searchResult) => {
      const refString = String(searchResult.ref);
      const document = findDocument(store, refString);

      return formatResult(searchResult, document);
    });
  });

  // Sort by score (descending) and limit to 10 results
  const sortedResults = results.sort((a, b) => b.score - a.score).slice(0, 10);

  return { query, results: sortedResults };
};

function findDocument(store: Document[], ref: string): Document {
  return store.find((doc) => doc.i === Number(ref)) || { i: 0 };
}

function formatResult(
  searchResult: lunr.Index.Result,
  document: Document
): SearchResult {
  return {
    score: searchResult.score,
    title: document.t || "",
    url: `https://docs.saasus.io${document.u || ""}`,
    excerpt: String(document.s || document.t || "")
      .replace(/\s+/g, " ")
      .slice(0, 160),
  };
}
