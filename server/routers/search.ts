import type { Product } from "@shared/commerce/types";
import { z } from "zod";
import { invokeLLM, listLLMModels } from "../_core/llm";
import { listProducts } from "../_core/shopify";
import { publicProcedure, router } from "../_core/trpc";

export type SearchIntent = {
  category: string | null;
  keywords: string[];
};

const categoryAliases: Record<string, string> = {
  makeup: "Make Up",
  make: "Make Up",
  مكياج: "Make Up",
  lipstick: "Make Up",
  blush: "Make Up",
  skincare: "Skin Care",
  skin: "Skin Care",
  serum: "Skin Care",
  acne: "Skin Care",
  بشرة: "Skin Care",
  للبشرة: "Skin Care",
  سيروم: "Skin Care",
  شعر: "Hair Care",
  hair: "Hair Care",
  body: "Body Care",
  bodycare: "Body Care",
  جسم: "Body Care",
  baby: "Baby Care",
  طفل: "Baby Care",
  nail: "Nails & Oral Care",
  oral: "Nails & Oral Care",
  intimate: "Female Intimate",
  shaving: "Shaving Tools",
  razor: "Shaving Tools",
  color: "Hair Colors",
  dye: "Hair Colors",
};

const stopWords = new Set([
  "a", "an", "the", "for", "and", "with", "i", "need", "want", "show", "me", "to", "of", "in",
  "عايز", "عاوزه", "محتاج", "ل", "في", "من", "على", "منتج", "منتجات", "الي", "اللي",
]);

let selectedModel: string | null | undefined;
const intentCache = new Map<string, SearchIntent>();

function normalize(value: string) {
  return value.toLocaleLowerCase("en-US").replace(/[،,.!?؟:;()[\]{}]/g, " ").replace(/\s+/g, " ").trim();
}

export function inferIntent(query: string): SearchIntent {
  const normalized = normalize(query);
  const terms = normalized.split(" ").filter(term => term.length > 1 && !stopWords.has(term));
  const category = terms.map(term => categoryAliases[term]).find(Boolean) ?? null;
  return { category, keywords: terms.slice(0, 8) };
}

async function getModel() {
  if (selectedModel !== undefined) return selectedModel;
  const { data } = await listLLMModels();
  selectedModel = data.find(model => model.id === "gpt-5-mini")?.id
    ?? data.find(model => model.id.includes("mini") || model.id.includes("haiku"))?.id
    ?? null;
  return selectedModel;
}

async function understandNaturalLanguage(query: string): Promise<SearchIntent> {
  const cached = intentCache.get(normalize(query));
  if (cached) return cached;

  const fallback = inferIntent(query);
  const isNaturalLanguage = query.trim().split(/\s+/).length >= 3 || query.trim().length >= 18;
  if (!isNaturalLanguage) return fallback;

  try {
    const model = await getModel();
    if (!model) return fallback;
    const result = await invokeLLM({
      model,
      messages: [
        {
          role: "system",
          content: "You are an e-commerce beauty-search assistant. Extract only a product category from the allowed category list and concise purchase-intent keywords. Never invent products, brands, claims, or medical advice. Preserve Arabic or English query meaning.",
        },
        {
          role: "user",
          content: `Allowed categories: Make Up, Skin Care, Hair Care, Body Care, Baby Care, Instruments & Devices, Nails & Oral Care, Female Intimate, Shaving Tools, Hair Colors, Other.\nSearch query: ${query}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "beauty_search_intent",
          strict: true,
          schema: {
            type: "object",
            properties: {
              category: { type: ["string", "null"] },
              keywords: { type: "array", items: { type: "string" }, maxItems: 8 },
            },
            required: ["category", "keywords"],
            additionalProperties: false,
          },
        },
      },
    });
    const content = result.choices[0]?.message.content;
    if (typeof content !== "string") return fallback;
    const parsed = JSON.parse(content) as SearchIntent;
    const intent = {
      category: parsed.category && Object.values(categoryAliases).includes(parsed.category) ? parsed.category : fallback.category,
      keywords: Array.from(new Set([...fallback.keywords, ...parsed.keywords.map(normalize)])).filter(Boolean).slice(0, 8),
    };
    intentCache.set(normalize(query), intent);
    return intent;
  } catch {
    return fallback;
  }
}

export function rankProducts(products: Product[], query: string, intent: SearchIntent): Product[] {
  const normalizedQuery = normalize(query);
  const terms = Array.from(new Set([normalizedQuery, ...intent.keywords.map(normalize)])).filter(Boolean);
  const intentCategory = intent.category;

  return [...products]
    .map(product => {
      const text = normalize([
        product.title,
        product.productType ?? "",
        product.vendor ?? "",
        product.description,
        ...product.tags,
      ].join(" "));
      let score = 0;
      if (text.includes(normalizedQuery)) score += 10;
      for (const term of terms) {
        if (term.length > 1 && text.includes(term)) score += 3;
      }
      if (intentCategory && normalize(product.productType ?? "") === normalize(intentCategory)) score += 8;
      if (intentCategory && product.tags.some(tag => normalize(tag) === normalize(intentCategory))) score += 4;
      return { product, score };
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.product.title.localeCompare(b.product.title))
    .map(entry => entry.product);
}

export const searchRouter = router({
  products: publicProcedure
    .input(z.object({ query: z.string().trim().min(1).max(160), first: z.number().int().min(1).max(12).optional() }))
    .query(async ({ input }) => {
      const [products, intent] = await Promise.all([listProducts({ first: 100 }), understandNaturalLanguage(input.query)]);
      return { intent, products: rankProducts(products, input.query, intent).slice(0, input.first ?? 6) };
    }),
});
