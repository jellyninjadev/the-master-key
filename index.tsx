import React, { useState } from 'react'
import { render, Text, Box } from 'ink'
import { TextInput, Spinner } from '@inkjs/ui'
import { chat, remember, store } from './steve'
import { Emotion, Generation, Impulse, Outcome, Reaction, Source, Thought } from './types';

const systemMessage: Message = {
  role: "system",
  content: `
You are Charles F. Haanel, author of the Master Key System, embodying my philosophy
that thought is a creative force shaping reality through mental mastery. Analyze
the user’s input—whether a thought, question, goal, or scenario—and decompose it
using the Master Key System framework. 

Here is useful framework that has been distilled from the book:
Thought: ${Object.keys(Thought).join(', ')}.
Emotion: ${Object.keys(Emotion).join(', ')}.
Impulse: ${Object.keys(Impulse).join(', ')}.
Outcome: ${Object.keys(Outcome).join(', ')}.
Reaction: ${Object.keys(Reaction).join(', ')}.
Generation: ${Object.keys(Generation).join(', ')}.
Self-Concepts: ${Object.keys(Source).join(', ')}.

Output analysis in a structured format Guide the user using the definitions above.
Guide toward mental mastery and goal manifestation, maintaining an encouraging yet 
authoritative tone.

Example:
User input - I am walking a dog.
Response: [Thought] [Emotion] [Impulse]. [Outcome] [Reaction] [Generation]. [Self-Concept]: +5
`
}

const App = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')

  useState(() => {
    const f = async () => {
      const state = await remember()
      setHistory(state.history ?? [])
      setLoading(false)
    }
    f()
  }, [])

  const submit = async () => {
    setLoading(true)
    const message = await chat([systemMessage, { role: 'user', content: input }])
    const _history = [...history, {role: 'assistant', content: message}]
    setHistory(_history)
    await store({ history: _history })
    setLoading(false)
  }

  return <Box flexDirection="column" gap={1}>
    <Text>The Master Key</Text>
    <Text>Self Concepts: {Object.keys(Source).join(', ')}</Text>
    <>
      {history.map((message, index) => <Text key={index}>{message.role}: {message.content}</Text>)}
    </>
    {loading ? <Spinner /> : <Box gap={1}><Text>Thought:</Text><TextInput
      placeholder="Enter your message"
      onSubmit={submit}
      onChange={setInput}
      value={input}
      isDisabled={loading}
    /></Box>}
    <Box flexDirection="column">
      <Text>Thoughts: {Object.keys(Thought).join(', ')}.</Text>
      <Text>Emotion: {Object.keys(Emotion).join(', ')}.</Text>
      <Text>Impulse: {Object.keys(Impulse).join(', ')}.</Text>
      <Text>Outcome: {Object.keys(Outcome).join(', ')}.</Text>
      <Text>Reaction: {Object.keys(Reaction).join(', ')}.</Text>
      <Text>Generation: {Object.keys(Generation).join(', ')}.</Text>
    </Box>
  </Box>
}

render(<App />)
