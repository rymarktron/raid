'use client'

import { useState } from 'react'
import { Container } from '@/components/Container'
import { Button } from './Button'

export function ChatbotInterface() {
  const [userInput, setUserInput] = useState('')
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (userInput.trim()) {
      // Add user message to the conversation
      setMessages([...messages, { text: userInput, sender: 'user' }])

      // Clear the input field
      setUserInput('')

      try {
        // Send the message to the API with the Authentication header and API key
        const response = await fetch('https://api.joseph.ma/raid/chat?api_key=RYMARK', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: [{ role: 'user', content: userInput }] }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch response from API')
        }

        const data = await response.json()

        // Append the response message from the bot
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: data.message, sender: 'bot' },
        ])
      } catch (error) {
        console.error('Error sending message to API:', error)
        // Optionally handle errors in the UI (e.g., show an error message)
      }
    }
  }

  return (
    <section id="chatbot" aria-label="chatbot" className="pt-20 pb-14 sm:pt-32 sm:pb-20 lg:pb-32 bg-gray-50">
      <Container>
        <div className="mx-auto max-w-2xl md:text-center">
          <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
            Chat with Us
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            Ask anything, and our chatbot will help you out!
          </p>
        </div>
        
        {/* Chatbox container */}
        <div className="mt-12 bg-white p-6 rounded-lg shadow-xl max-w-xl mx-auto">
          <div className="h-72 overflow-y-auto mb-4 p-4 bg-gray-100 rounded-lg space-y-4">
            {/* Display chat messages */}
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${message.sender === 'user' ? 'bg-purple-500 text-white' : 'bg-gray-300 text-black'}`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          
          {/* Input form */}
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
