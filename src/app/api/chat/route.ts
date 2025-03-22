import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { searchSimilarContent } from '@/utils/utils';

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;

export async function GET(request: Request) {
  // You can access query parameters if needed
  const { searchParams } = new URL(request.url);
  
  // Your logic here to handle the request
  // Example response:
  return Response.json({ 
    message: "This is the chat API endpoint" 
  });
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20240620'),
    system: "You are a helpful assistant with access to a knowledge base. Use the searchKnowledgeBase tool to find relevant information when needed. When citing a source make sure to include a citation like [1] and cite at the end like [1] [<name>](<url>), Last updated: <Last scraped date and time like April 1st 2024, 12:00 PM>. If the user's message is sad or more sensitive, be more sensitive and caring.",
    messages,
    tools: {
      searchKnowledgeBase: tool({
        description: "Search the knowledge base for relevant information",
        parameters: z.object({
          query: z
            .string()
            .describe("The search query to find relevant information"),
        }),
        execute: async ({ query }) => {
          console.log(`Searching knowledge base for: ${query}`);
          try {
            const results = await searchSimilarContent(query, 3);

            if (results.length === 0) {
              return {
                found: false,
                message: "No relevant information found in the knowledge base.",
              };
            }

            // Format the results for the model
            const formattedResults = results.map((result) => ({
              url: result.url,
              content: result.content,
              score: result.score,
              last_scraped: result.last_scraped,
            }));

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
    },
    maxSteps: 10,
    toolCallStreaming: true,
  });

  return result.toDataStreamResponse();
}
