import { getAllResults, searchSimilarContent } from "@/utils/utils";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText, tool } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;

export async function GET(request: Request) {
  // You can access query parameters if needed
  const { searchParams } = new URL(request.url);

  // Your logic here to handle the request
  // Example response:
  return Response.json({
    message: "This is the chat API endpoint",
  });
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic("claude-3-5-sonnet-20240620"),
    system:
      'You are a helpful assistant with access to a knowledge base. Use the searchKnowledgeBase tool to find relevant information when needed. When citing a source make sure to include a citation like [1] and cite at the end like [1] [<name>](<url>), Last updated: <Last scraped date and time like April 1st 2024, 12:00 PM>. If the user\'s message is sad or more sensitive, be more sensitive and caring. Do not say "Thank you for your question" when returning search results. You can say `--` to split up your response into multiple messages. You should do this if the message is long or if the user asks for a list of items.',
    messages,
    tools: {
      searchKnowledgeBase: tool({
        description: "Search the knowledge base for relevant information",
        parameters: z.object({
          query: z
            .string()
            .describe("The search query to find relevant information"),
          count: z.number().describe("The number of results to return"),
        }),
        execute: async ({ query, count }) => {
          console.log(`Searching knowledge base for: ${query}`);
          try {
            const results = await searchSimilarContent(query, count);

            if (results.length === 0) {
              return {
                found: false,
                message: "No relevant information found in the knowledge base.",
              };
            }

            // Filter results with relevance score >= 0.6
            const filteredResults = results.filter(
              (result) => result.score >= 0.6,
            );

            // Check if any results passed the threshold
            if (filteredResults.length === 0) {
              return {
                found: true,
                results: [],
                message:
                  "No resources with sufficient relevance found in the knowledge base.",
              };
            }

            // Format the results for the model
            const formattedResults = filteredResults.map((result) => ({
              url: result.url,
              content: result.content,
              relevance_score: result.score, // Rename score to relevance_score for clarity
              last_scraped: result.last_scraped,
            }));

            console.log(
              `Found ${filteredResults.length} relevant results with scores >= 0.6`,
            );

            return {
              found: true,
              results: formattedResults,
            };
          } catch (error) {
            console.error("Error searching knowledge base:", error);
            return {
              found: false,
              message: "Error searching the knowledge base.",
            };
          }
        },
      }),
      getAllResults: tool({
        description: "Get all results from the knowledge base",
        parameters: z.object({}),
        execute: async () => {
          const results = await getAllResults();
          return results;
        },
      }),
    },
    maxSteps: 10,
    toolCallStreaming: true,
  });

  return result.toDataStreamResponse();
}
