import ollama from 'ollama'
import OpenAI from 'openai'
import { throttle } from 'lodash'
import { ContextChatEngine } from 'llamaindex'
import { generateSpacesDataStructure, getData } from './query'
import { Document, Groq, Settings, VectorStoreIndex } from 'llamaindex'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
})

interface StreamResponsePart {
  message: {
    content: string
  }
  endOfStream?: boolean
}

type StreamCallback = (data: StreamResponsePart) => void

export const streamChatResponse = async (provider: 'ollama' | 'openai' | 'groq' | string, messages: any, callback: StreamCallback) => {
  let fullResponse: string[] = []
  const throttledCallback = throttle(callback, 16.67)

  try {
    switch (provider) {
      case 'ollama': {
        const stream = await ollama.chat({
          model: 'llama3',
          messages,
          stream: true
        })
        for await (const part of stream) {
          fullResponse.push(part.message.content)
          throttledCallback({
            message: {
              content: fullResponse.join('')
            }
          })
        }
        break
      }

      case 'openai': {
        const stream = await openai.chat.completions.create({
          model: 'gpt-4',
          messages,
          stream: true
        })
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || ''
          fullResponse.push(content)
          throttledCallback({
            message: {
              content: fullResponse.join('')
            }
          })
        }
        break
      }

      case 'groq': {
        const stream = await groq.chat.completions.create({
          model: 'llama3-70b-8192',
          messages,
          stream: true
        })
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || ''
          fullResponse.push(content)
          throttledCallback({
            message: {
              content: fullResponse.join('')
            }
          })
        }
        break
      }

      case 'llamaindex': {
        const data = await getData()
        const dataStructure = await generateSpacesDataStructure()
        const spaces = new Document({ text: JSON.stringify({ spaces: data.spaces }), id_: 'spaces' })
        const groups = new Document({ text: JSON.stringify({ groups: data.groups }), id_: 'groups' })
        const channels = new Document({ text: JSON.stringify({ channels: data.channels }), id_: 'channels' })
        const threads = new Document({ text: JSON.stringify({ threads: data.threads }), id_: 'threads' })
        const messages2 = new Document({ text: JSON.stringify({ messages: data.messages }), id_: 'messages' })
        const hirearchy = new Document({ text: JSON.stringify({ structure: dataStructure }), id_: 'hirearchy' })
        const index = await VectorStoreIndex.fromDocuments([
          spaces,
          groups,
          channels,
          threads,
          messages2,
          hirearchy
        ])

        const chatHistory = [
          {
            role: 'system',
            content: `
              You answer queries about the Harmony platform. It is organized into a hirearchy of:
              Spaces -> Groups -> Channels -> Threads -> Messages, which each belonging only to their parent.
            `
          },
          ...messages
        ]

        const retriever = index.asRetriever();
        const chatEngine = new ContextChatEngine({ retriever });
        const stream = await chatEngine.chat({ message: messages[messages.length - 1]?.content, chatHistory, stream: true })

        for await (const chunk of stream) {
          fullResponse.push(chunk.response)
          throttledCallback({
            message: {
              content: fullResponse.join('')
            }
          })
        }
        break
      }
        
    }

    throttledCallback({ message: { content: fullResponse.join('') }, endOfStream: true })
  } 
  catch (error) {
    console.error('Error streaming response:', error)
  }
}
