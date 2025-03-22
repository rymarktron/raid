"use client";

import { useChat } from "@ai-sdk/react";
import { Container } from "@/components/Container";
import { Button } from "./Button";
import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";

// Search Results component to display search results as tiles
const SearchResults = ({ results }: { results: any[] }) => {
  // Function to truncate content to first 200 chars and add ellipsis if needed
  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="flex flex-col w-full my-4 mx-auto bg-gray-200 rounded-lg p-4 max-w-xl">
      <div className="text-sm text-gray-500 mb-2 text-center">Search results found:</div>
      <div className="space-y-2">
        {results.map((result, index) => (
          <a 
            key={index} 
            href={result.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-3 bg-white hover:bg-blue-50 rounded-lg border border-gray-200 transition-colors duration-200"
          >
            <div className="prose prose-sm max-w-none mb-2">
              <ReactMarkdown>
                {truncateContent(result.content)}
              </ReactMarkdown>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-blue-600 hover:underline">{result.url}</span>
              <span className="text-gray-500">Last scraped: {result.last_scraped}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export function ChatbotInterface() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const { messages, input, handleInputChange, handleSubmit, status } =
    useChat({
      api: "/api/chat",
      initialInput: "",
      initialMessages: [
        {
          id: "welcome-message",
          role: "assistant",
          content: "Hello! I'm your HR assistant for the University of Waterloo. How can I help you today? Feel free to ask me about HR policies, benefits, leave procedures, or any other HR-related questions you might have."
        }
      ]
    });

  // Detect tool usage by monitoring messages
  useEffect(() => {
    // Find the last message
    const lastMessage = messages[messages.length - 1];
    
    // Check if it's an assistant message that might be using tools
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.parts) {
      // Look for active tool calls (state 'call' or 'partial-call')
      const hasActiveToolCall = lastMessage.parts.some(part => 
        part.type === 'tool-invocation' && 
        (part.toolInvocation.state === 'call' || part.toolInvocation.state === 'partial-call')
      );
      
      // Set searching state based on whether there are active tool calls
      setIsSearching(hasActiveToolCall);
      
      // Check for search results
      const foundResults = lastMessage.parts
        .filter((part: any) => 
          part.type === 'tool-invocation' && 
          part.toolInvocation.state === 'result' && 
          part.toolInvocation.result?.found === true && 
          Array.isArray(part.toolInvocation.result?.results)
        )
        .map((part: any) => part.toolInvocation.result.results)
        .flat();
      
      if (foundResults.length > 0) {
        setSearchResults(foundResults);
      }
      
      // Debug info
      if (hasActiveToolCall) {
        console.log("Tool call in progress, showing searching indicator");
      } else if (lastMessage.parts.some(part => part.type === 'tool-invocation' && part.toolInvocation.state === 'result')) {
        console.log("Tool call completed, hiding searching indicator");
      }
    }
  }, [messages]);

  // Reset searching state when status changes to 'ready'
  useEffect(() => {
    if (status === 'ready' && isSearching) {
      console.log('Status changed to ready, resetting searching state');
      setIsSearching(false);
    }
  }, [status, isSearching]);

  const formatTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let formattedText = text;

    formattedText = formattedText.replace(urlRegex, (url) => {
      if (url.startsWith("https://uwaterloo.ca")) {
        return `<a href="${url}" style="color: purple; font-weight: bold; text-decoration: underline;">${url}</a>`;
      } else {
        return `<a href="${url}" target="_blank" style="color: purple; font-weight: bold; text-decoration: underline;">${url}</a>`;
      }
    });

    return formattedText;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e);
  };

  // Render message content based on part type
  const renderMessageParts = (message: any) => {
    // Don't render tool invocation result parts as they will be shown separately
    const shouldExcludeMessage = message.parts?.some((part: any) => 
      part.type === 'tool-invocation' && 
      part.toolInvocation.state === 'result' && 
      part.toolInvocation.result?.found === true && 
      part.toolInvocation.result?.results
    );

    if (shouldExcludeMessage) {
      // Get only text parts from this message
      const textParts = message.parts?.filter((part: any) => part.type === 'text');
      
      // If there are no text parts, don't render this message
      if (!textParts || textParts.length === 0) {
        return null;
      }
    }
    
    return (
      <div
        key={message.id}
        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-xl px-4 py-2 rounded-lg ${message.role === "user" ? "bg-purple-700 text-white" : "bg-gray-300 text-black"}`}
        >
          {/* Check if the message has parts property */}
          {message.parts && message.parts.length > 0 ? (
            <div>
              {message.parts.map((part: any, index: number) => {
                if (part.type === 'text') {
                  return (
                    <div key={index} className="prose prose-a:text-blue-600 prose-a:underline">
                      <ReactMarkdown
                        components={{
                          a: ({ node, ...props }) => (
                            <a 
                              {...props} 
                              className="text-blue-600 hover:text-blue-800 underline" 
                              target="_blank" 
                              rel="noopener noreferrer"
                            />
                          )
                        }}
                      >
                        {part.text}
                      </ReactMarkdown>
                    </div>
                  );
                } else if (part.type === 'file' && part.mimeType?.startsWith('image/')) {
                  return (
                    <img 
                      key={index} 
                      src={`data:${part.mimeType};base64,${part.data}`} 
                      alt="Generated image"
                      className="max-w-full h-auto rounded my-2"
                    />
                  );
                } 
                // Don't render tool-invocation parts here
                return null;
              })}
            </div>
          ) : (
            // Fallback to rendering just content if no parts
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
                  )
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Generate typing indicator animation
  const TypingIndicator = () => (
    <div className="flex justify-start mt-2">
      <div className="px-4 py-2 bg-gray-200 rounded-lg flex items-center space-x-1">
        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
      </div>
    </div>
  );

  // Searching indicator
  const SearchingIndicator = () => (
    <div className="flex justify-start mt-2">
      <div className="px-4 py-1 bg-blue-50 text-xs text-blue-700 rounded-lg flex items-center">
        <svg className="animate-spin h-3 w-3 mr-2 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Searching knowledge base...
      </div>
    </div>
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

        <div className="mt-12 bg-white p-6 rounded-lg shadow-xl max-w-4xl mx-auto">
          <div className="h-120 overflow-y-auto mb-4 p-4 bg-gray-100 rounded-lg space-y-4">
            {messages.map(renderMessageParts)}
            
            {/* Display search results separately */}
            {searchResults.length > 0 && (
              <div className="flex justify-center w-full">
                <SearchResults results={searchResults} />
              </div>
            )}

            {/* Show typing indicator when streaming response */}
            {status === 'streaming' && !isSearching && <TypingIndicator />}
            
            {/* Show searching indicator when tool is being used */}
            {isSearching && <SearchingIndicator />}
          </div>

          <form onSubmit={handleFormSubmit} className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your question..."
              value={input}
              onChange={handleInputChange}
              disabled={status !== 'ready'}
            />
            <Button type="submit" disabled={status !== 'ready'}>
              {status === 'streaming' ? 'Responding...' : 'Send'}
            </Button>
          </form>
        </div>
      </Container>
    </section>
  );
}
