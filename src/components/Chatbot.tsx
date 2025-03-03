"use client"

import { useState } from 'react';
import { Container } from '@/components/Container';
import { Button } from './Button';

export function ChatbotInterface() {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([]);
  const [loading, setLoading] = useState(false);

  const formatTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let formattedText = text;

    formattedText = formattedText.replace(urlRegex, (url) => {
      if (url.startsWith('https://uwaterloo.ca')) {
        return `<a href="${url}" style="color: purple; font-weight: bold; text-decoration: underline;">${url}</a>`;
      } else {
        return `<a href="${url}" target="_blank" style="color: purple; font-weight: bold; text-decoration: underline;">${url}</a>`;
      }
    });

    return formattedText;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (userInput.trim()) {
      console.log('User input submitted:', userInput);

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: userInput, sender: 'user' },
      ]);
      setUserInput('');
      setLoading(true);

      try {
        console.log('Sending request to API...');

        const response = await fetch('https://api.joseph.ma/raid/chat', {
          method: 'POST',
          headers: {
            Authentication: 'RYMARK',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: [{ role: 'user', content: userInput }] }),
        });

        console.log('API response status:', response.status);

        if (!response.ok) {
          throw new Error('Failed to fetch response from API');
        }

        const contentType = response.headers.get('Content-Type') || '';
        let responseBody: unknown;

        if (contentType.includes('application/json')) {
          responseBody = await response.json();
          console.log('Received data from API:', responseBody);

          if (typeof responseBody === 'object' && responseBody !== null && 'message' in responseBody) {
            const responseMessage = (responseBody as { message: string }).message;
            const botMessages = responseMessage
              .split('.')
              .map((sentence: string) => sentence.trim())
              .filter(Boolean);

            for (let i = 0; i < botMessages.length; i++) {
              setTimeout(() => {
                setMessages((prevMessages) => [
                  ...prevMessages,
                  { text: botMessages[i], sender: 'bot' },
                ]);
              }, 1000 * i);
            }

            setTimeout(() => {
              const formattedMessage = formatTextWithLinks(responseMessage);
              setMessages((prevMessages) => [
                ...prevMessages,
                { text: formattedMessage, sender: 'bot' },
              ]);
            }, 1000 * botMessages.length);
          } else {
            setMessages((prevMessages) => [
              ...prevMessages,
              { text: 'Error: No valid message received.', sender: 'bot' },
            ]);
          }
        } else {
          responseBody = await response.text();
          console.log('Received text from API:', responseBody);

          const responseText = String(responseBody); // Explicitly cast to string
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: responseText, sender: 'bot' },
          ]);
        }
      } catch (error) {
        console.error('Error sending message to API:', error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: 'An error occurred while processing your request.', sender: 'bot' },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <section id="chatbot" aria-label="chatbot" className="pt-20 pb-14 sm:pt-32 sm:pb-20 lg:pb-32 bg-gray-50">
      <Container>
        <div className="mx-auto max-w-5xl md:text-center">
          <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
            Chat with Us
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            Ask anything, and our chatbot will help you out! Please try to ask questions related to HR department so we can help you the best we can. If that does not work, please email:
            <Button href="mailto:hrhelp@uwaterloo.ca" className='ml-2'>hrhelp@uwaterloo.ca</Button>
          </p>
        </div>
        
        <div className="mt-12 bg-white p-6 rounded-lg shadow-xl max-w-4xl mx-auto">
        <div className="h-102 overflow-y-auto mb-4 p-4 bg-gray-100 rounded-lg space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${message.sender === 'user' ? 'bg-purple-500 text-white' : 'bg-gray-300 text-black'}`}
                dangerouslySetInnerHTML={{ __html: formatTextWithLinks(message.text) }} // Apply link formatting
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
              placeholder="Type your question..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <Button type="submit">Send</Button>
          </form>
        </div>
      </Container>
    </section>
  );
}
