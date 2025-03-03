'use client'

import { useState } from 'react'
import { Container } from '@/components/Container'
import { Button } from './Button'

export function ChatbotInterface() {
  const [userInput, setUserInput] = useState('')
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([])
  const [loading, setLoading] = useState(false)

  // Function to extract links and format them
  const formatTextWithLinks = (text: string) => {
    // Regex to match URLs in the text
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const links = [];

    // Find all URLs in the text
    let match;
    while ((match = urlRegex.exec(text)) !== null) {
      // For each URL found, replace it with a clickable link
      const url = match[0];
      const linkText = `**${url}**`; // Bold the link text
      links.push({ url, text: linkText });
    }

    // Replace the links in the text with the actual formatted link
    let formattedText = text;
    links.forEach(link => {
      const linkHTML = `<strong><a href="${link.url}" target="_blank">${link.text}</a></strong>`;
      formattedText = formattedText.replace(link.text, linkHTML);
    });

    return formattedText;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (userInput.trim()) {
      // Log the user input before sending
      console.log("User input submitted:", userInput);

      // Add user message to the conversation
      setMessages(prevMessages => [...prevMessages, { text: userInput, sender: 'user' }])
      setUserInput('')
      setLoading(true)

      try {
        // Log the start of the fetch request
        console.log("Sending request to API...");

        // Send the message to the API with the Authentication header and API key
        const response = await fetch('https://api.joseph.ma/raid/chat', {
          method: 'POST',
          headers: {
            'Authentication': 'RYMARK', // Ensure this matches the value expected by the server
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: [{ role: 'user', content: userInput }] }),
        })

        // Log the response status
        console.log("API response status:", response.status);

        if (!response.ok) {
          throw new Error('Failed to fetch response from API')
        }

        // Check if the response is JSON
        const contentType = response.headers.get("Content-Type") || "";
        let responseBody;

        if (contentType.includes("application/json")) {
          // If the response is JSON, parse it
          responseBody = await response.json();
          console.log("Received data from API:", responseBody);
        } else {
          // If the response is not JSON, treat it as text
          responseBody = await response.text();
          console.log("Received text from API:", responseBody);
        }

        // Check if we received the expected message property
        if (responseBody && typeof responseBody.message === 'string') {
          // Break the message into chunks (for example, by splitting sentences)
          const botMessages = responseBody.message.split('.').map((sentence: string) => sentence.trim()).filter(Boolean);

          // Render the messages slowly
          for (let i = 0; i < botMessages.length; i++) {
            setTimeout(() => {
              setMessages((prevMessages) => [
                ...prevMessages,
                { text: botMessages[i], sender: 'bot' },
              ])
            }, 1000 * i); // Add a delay of 1 second between each sentence
          }

          // Include the links in the message
          setTimeout(() => {
            // Format the response with the links and bold them
            const formattedMessage = formatTextWithLinks(responseBody.message);
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                text: formattedMessage,
                sender: 'bot',
              },
            ]);
          }, 1000 * botMessages.length); // Add delay to ensure the last chunk is displayed before adding the links
        } else {
          // In case the response is not in the expected format, show as raw text
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: responseBody, sender: 'bot' },
          ]);
        }
      } catch (error) {
        console.error('Error sending message to API:', error)
      } finally {
        setLoading(false) // Stop loading after processing is done
      }
    }
  }

  return (
    <section id="chatbot" aria-label="chatbot" className="pt-20 pb-14 sm:pt-32 sm:pb-20 lg:pb-32 bg-gray-50">
      <Container>
        <div className="mx-auto max-w-5xl md:text-center">
          <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
            Chat with Us
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            Ask anything, and our chatbot will help you out!
          </p>
        </div>
        
        <div className="mt-12 bg-white p-6 rounded-lg shadow-xl max-w-4xl mx-auto">
          <div className="h-102 overflow-y-auto mb-4 p-4 bg-gray-100 rounded-lg space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${message.sender === 'user' ? 'bg-purple-500 text-white' : 'bg-gray-300 text-black'}`}
                  dangerouslySetInnerHTML={{ __html: message.text }} // Use `dangerouslySetInnerHTML` to render HTML links
                />
              </div>
            ))}

            {loading && (
              <div className="flex justify-center">
                {/* CSS Spinner */}
                <div className="w-16 h-16 border-4 border-t-4 border-gray-300 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <Button type="submit">Send</Button>
          </form>
        </div>
      </Container>
    </section>
  )
}
