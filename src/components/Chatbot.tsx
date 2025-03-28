"use client";

import { Container } from "@/components/Container";
import { useChat } from "@ai-sdk/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "./Button";

// Search Results component to display search results as tiles
const SearchResults = ({ results }: { results: any[] }) => {
  // Function to truncate content to first 200 chars and add ellipsis if needed
  const truncateContent = (content: string, maxLength = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="flex flex-col w-3/4 text-sm mx-auto">
      <div className="text-xs text-gray-500">Search results found:</div>
      <div className="space-y-1.5">
        {results.map((result, index) => (
          <a
            key={index}
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200"
          >
            <div className="prose prose-xs max-w-none mb-1.5 text-xs">
              <ReactMarkdown>{truncateContent(result.content)}</ReactMarkdown>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-blue-600 hover:underline">
                {result.url}
              </span>
              <span className="text-gray-500">
                Last scraped: {new Date(result.last_scraped).toLocaleString()}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

// Custom hook to create ordered chat elements with search results in correct position
function useOrderedChatElements(originalMessages: any[]) {
  type ChatItemType = {
    type: "message" | "search-results";
    id: string;
    content: any;
  };

  const [chatElements, setChatElements] = useState<ChatItemType[]>([]);

  useEffect(() => {
    // Process messages to create ordered elements
    const newChatElements: ChatItemType[] = [];

    originalMessages.forEach((message: any) => {
      // If it's an assistant message with parts, look for search results
      if (message.role === "assistant" && message.parts) {
        // Find tool invocation parts
        const toolParts = message.parts.filter(
          (part: any) => part.type === "tool-invocation",
        );

        // Find text parts
        const textParts = message.parts.filter(
          (part: any) => part.type === "text",
        );

        // If there are tool invocation parts, we need to split the message
        if (toolParts.length > 0) {
          // Extract search results from tool result parts
          const searchResults = toolParts
            .filter(
              (part: any) =>
                part.toolInvocation.state === "result" &&
                part.toolInvocation.result?.found === true,
            )
            .flatMap((part: any) => part.toolInvocation.result.results || []);

          // Split text parts into before-tool and after-tool
          // We'll consider the position of parts in the array to determine order
          if (textParts.length > 0) {
            // Find indices of all parts
            const allPartsWithIndices = message.parts.map(
              (part: any, idx: number) => ({ part, idx }),
            );

            // Find first tool part index
            const firstToolIndex =
              allPartsWithIndices.find(
                (p: any) => p.part.type === "tool-invocation",
              )?.idx || 0;

            // Find text parts before tool invocation
            const textPartsBeforeTool = textParts.filter((part: any) => {
              const partIndex =
                allPartsWithIndices.find((p: any) => p.part === part)?.idx || 0;
              return partIndex < firstToolIndex;
            });

            // Find text parts after tool invocation and results
            const lastToolIndex = allPartsWithIndices
              .filter((p: any) => p.part.type === "tool-invocation")
              .reduce((max: number, p: any) => Math.max(max, p.idx), 0);

            const textPartsAfterTool = textParts.filter((part: any) => {
              const partIndex =
                allPartsWithIndices.find((p: any) => p.part === part)?.idx || 0;
              return partIndex > lastToolIndex;
            });

            // 1. Add the "before tool" message
            if (textPartsBeforeTool.length > 0) {
              newChatElements.push({
                type: "message",
                id: `${message.id}-before`,
                content: {
                  ...message,
                  parts: textPartsBeforeTool,
                  _processed: true,
                },
              });
            }

            // 2. Add search results in the middle
            if (searchResults.length > 0) {
              newChatElements.push({
                type: "search-results",
                id: `${message.id}-results`,
                content: searchResults,
              });
            }

            // 3. Add the "after tool" message
            if (textPartsAfterTool.length > 0) {
              newChatElements.push({
                type: "message",
                id: `${message.id}-after`,
                content: {
                  ...message,
                  parts: textPartsAfterTool,
                  _processed: true,
                },
              });
            }
          } else if (searchResults.length > 0) {
            // Just add search results if there are no text parts
            newChatElements.push({
              type: "search-results",
              id: `${message.id}-results`,
              content: searchResults,
            });
          }
        } else {
          // No tool parts, add message as is
          newChatElements.push({
            type: "message",
            id: message.id,
            content: message,
          });
        }
      } else {
        // Non-assistant messages or those without parts just pass through
        newChatElements.push({
          type: "message",
          id: message.id,
          content: message,
        });
      }
    });

    setChatElements(newChatElements);
  }, [originalMessages]);

  return chatElements;
}

export function ChatbotInterface() {
  const [isSearching, setIsSearching] = useState(false);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: "/api/chat",
    initialInput: "",
    initialMessages: [
      {
        id: "welcome-message",
        role: "assistant",
        content:
          "Hello! I'm your HR assistant for the University of Waterloo. How can I help you today? Feel free to ask me about HR policies, benefits, leave procedures, or any other HR-related questions you might have.",
      },
    ],
  });

  // Process messages to create ordered elements
  const chatElements = useOrderedChatElements(messages);

  // Auto-scroll to bottom when new messages come in
  useEffect(() => {
    if (!chatContainerRef.current) return;

    const container = chatContainerRef.current;

    // If the user hasn't manually scrolled up, scroll to bottom
    if (!userHasScrolled) {
      scrollToBottom();
    }

    // Function to scroll to bottom smoothly
    function scrollToBottom() {
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [chatElements, userHasScrolled]);

  // Track scroll position to determine if user has manually scrolled up
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;

    const container = chatContainerRef.current;
    const isScrolledToBottom =
      Math.abs(
        container.scrollHeight - container.clientHeight - container.scrollTop,
      ) < 20;

    // If user scrolled to bottom, reset the userHasScrolled flag
    if (isScrolledToBottom) {
      setUserHasScrolled(false);
    }
    // If user scrolled up, set the flag
    else if (!userHasScrolled) {
      setUserHasScrolled(true);
    }
  }, [userHasScrolled]);

  // Detect tool usage by monitoring messages
  useEffect(() => {
    // Find the last message
    const lastMessage = messages[messages.length - 1];

    // Check if it's an assistant message that might be using tools
    if (lastMessage && lastMessage.role === "assistant" && lastMessage.parts) {
      // Look for active tool calls (state 'call' or 'partial-call')
      const hasActiveToolCall = lastMessage.parts.some(
        (part) =>
          part.type === "tool-invocation" &&
          (part.toolInvocation.state === "call" ||
            part.toolInvocation.state === "partial-call"),
      );

      // Set searching state based on whether there are active tool calls
      setIsSearching(hasActiveToolCall);

      // Check for search results
      const foundResults = lastMessage.parts
        .filter(
          (part: any) =>
            part.type === "tool-invocation" &&
            part.toolInvocation.state === "result" &&
            part.toolInvocation.result?.found === true &&
            Array.isArray(part.toolInvocation.result?.results),
        )
        .flatMap((part: any) => part.toolInvocation.result.results);

      if (foundResults.length > 0) {
        // Set search results
        // Note: This is handled by the useOrderedChatElements hook
      }

      // Debug info
      if (hasActiveToolCall) {
        console.log("Tool call in progress, showing searching indicator");
      } else if (
        lastMessage.parts.some(
          (part) =>
            part.type === "tool-invocation" &&
            part.toolInvocation.state === "result",
        )
      ) {
        console.log("Tool call completed, hiding searching indicator");
      }
    }
  }, [messages]);

  // Reset searching state when status changes to 'ready'
  useEffect(() => {
    if (status === "ready" && isSearching) {
      console.log("Status changed to ready, resetting searching state");
      setIsSearching(false);
    }
  }, [status, isSearching]);

  const formatTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let formattedText = text;

    formattedText = formattedText.replace(urlRegex, (url) => {
      if (url.startsWith("https://uwaterloo.ca")) {
        return `<a href="${url}" style="color: purple; font-weight: bold; text-decoration: underline;">${url}</a>`;
      }
      return `<a href="${url}" target="_blank" style="color: purple; font-weight: bold; text-decoration: underline;">${url}</a>`;
    });

    return formattedText;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e);
  };

  // Render message content based on part type
  const renderMessageContent = (message: any) => {
    // Check if the message has parts property
    if (message.parts && message.parts.length > 0) {
      return (
        <div>
          {message.parts.map((part: any, index: number) => {
            if (part.type === "text") {
              return (
                <div
                  key={index}
                  className="prose prose-a:text-blue-600 prose-a:underline"
                >
                  <ReactMarkdown
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="text-blue-600 hover:text-blue-800 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                    }}
                  >
                    {part.text}
                  </ReactMarkdown>
                </div>
              );
            } else if (
              part.type === "file" &&
              part.mimeType?.startsWith("image/")
            ) {
              return (
                <img
                  key={index}
                  src={`data:${part.mimeType};base64,${part.data}`}
                  alt="Generated image"
                  className="max-w-full h-auto rounded my-2"
                />
              );
            }
            // Don't render tool-invocation parts
            return null;
          })}
        </div>
      );
    }

    // Fallback to rendering just content if no parts
    return (
      <div className="prose prose-a:text-blue-600 prose-a:underline">
        <ReactMarkdown
          components={{
            a: ({ node, ...props }) => (
              <a
                {...props}
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              />
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    );
  };

  // Render a chat message bubble
  const renderMessage = (message: any) => {
    return (
      <div
        key={message.id}
        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-3xl px-4 py-2 rounded-lg ${message.role === "user" ? "bg-purple-900 text-white rounded-br-none" : "bg-gray-300 text-black rounded-bl-none"}`}
        >
          {renderMessageContent(message)}
        </div>
      </div>
    );
  };

  // Generate typing indicator animation - memoized to prevent re-renders
  const typingIndicator = useMemo(
    () => (
      <div className="flex justify-start mt-2">
        <div className="px-4 py-2 bg-gray-200 rounded-lg flex items-center space-x-1">
          <div
            className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
            style={{ animationDelay: "200ms" }}
          />
          <div
            className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
            style={{ animationDelay: "400ms" }}
          />
        </div>
      </div>
    ),
    [],
  );

  // Searching indicator - memoized to prevent re-renders
  const searchingIndicator = useMemo(
    () => (
      <div className="flex justify-start mt-2">
        <div className="px-4 py-1 bg-blue-50 text-xs text-blue-700 rounded-lg flex items-center">
          <svg
            className="animate-spin h-3 w-3 mr-2 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Searching knowledge base...
        </div>
      </div>
    ),
    [],
  );

  return (
    <section
      id="chatbot"
      aria-label="chatbot"
      className="pt-20 pb-14 sm:pt-32 sm:pb-20 lg:pb-32 bg-gray-50"
    >
      <Container>
        <div className="mx-auto max-w-5xl md:text-center">
          <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
            Chat with Us
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            Ask anything, and our chatbot will help you out! Please try to ask
            questions related to HR department so we can help you the best we
            can. If that does not work, please email:
            <Button href="mailto:hrhelp@uwaterloo.ca" className="ml-2">
              hrhelp@uwaterloo.ca
            </Button>
          </p>
        </div>

        <div className="mt-12 bg-white p-6 rounded-lg shadow-xl">
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="h-160 overflow-y-auto mb-4 p-4 bg-gray-100 rounded-lg space-y-4"
          >
            {/* Render chat elements in order */}
            {chatElements.map((element) => {
              if (element.type === "message") {
                return renderMessage(element.content);
              } else if (element.type === "search-results") {
                return (
                  <SearchResults key={element.id} results={element.content} />
                );
              }
              return null;
            })}

            {/* Show typing indicator when streaming response */}
            {status === "streaming" && !isSearching && typingIndicator}

            {/* Show searching indicator when tool is being used */}
            {isSearching && searchingIndicator}
          </div>

          <form onSubmit={handleFormSubmit} className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your question..."
              value={input}
              onChange={handleInputChange}
              disabled={status !== "ready"}
            />
            <Button type="submit" disabled={status !== "ready"}>
              {status === "streaming" ? "Responding..." : "Send"}
            </Button>
          </form>
        </div>
      </Container>
    </section>
  );
}
