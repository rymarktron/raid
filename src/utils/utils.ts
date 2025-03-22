import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SearchResult {
  id: number;
  url: string;
  content: string;
  last_scraped: string;
  score: number;
}

async function getAllScrapedContent(): Promise<
  { success: true; data: any[] } | { success: false; error: string }
> {
  try {
    const response = await fetch("https://api.joseph.ma/raid/all");
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    } else {
      return { success: false, error: "An unknown error occurred" };
    }
  }
}

/**
 * Search for similar content based on the provided query
 * @param query The search query
 * @param limit Maximum number of results to return
 * @returns Array of search results
 */
export async function searchSimilarContent(
  query: string,
  limit: number = 3,
): Promise<SearchResult[]> {
  try {
    // Get all content from the database
    const contentResponse = await getAllScrapedContent();

    if (!contentResponse.success) {
      console.error(contentResponse.error);
      return [];
    }

    const allContent = contentResponse.data;

    // Generate embedding for the query
    const queryEmbeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
      dimensions: 1536,
    });

    const queryEmbedding = queryEmbeddingResponse.data[0].embedding;

    // Cache for content embeddings to avoid redundant API calls
    const embeddings: Record<number, number[]> = {};

    // For each database item, get or create embedding and calculate similarity
    const results = await Promise.all(
      allContent.map(async (item: any) => {
        // Create embedding for the content
        const contentEmbeddingResponse = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: item.content.slice(0, 8000), // Limit input size
          dimensions: 1536,
        });

        const contentEmbedding = contentEmbeddingResponse.data[0].embedding;
        embeddings[item.id] = contentEmbedding;

        // Calculate cosine similarity
        const similarity = cosineSimilarity(queryEmbedding, contentEmbedding);

        return {
          ...item,
          score: similarity,
        };
      }),
    );

    // Sort by similarity score and take the top results
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  } catch (error) {
    console.error("Error in vector search:", error);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  return dotProduct / (magnitudeA * magnitudeB);
}
