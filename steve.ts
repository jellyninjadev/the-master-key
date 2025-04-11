import { Message, State } from "./types"

const url = process.env.LLM

export const extract_thinking = (response: string) => {
  const thinking = response.match(/<think>([\s\S]*?)<\/think>\s*/s)
  return thinking ? thinking[1] : null
}

export const extract_code = (response: string) => {
  const res = response.match(/```\s*([\s\S]*?)\s*```/s)
  return res ? res[1] : null
}

export const chat = async (messages: Message[], options: any = null) => {
  const payload = await fetch(`${url}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama3',
      messages,
      stream: false,
      ...options
    })
  })
  let fullResponse = ''

  const decoder = new TextDecoder()
  const reader = payload.body!.getReader()

  while (true) {
    const { done, value } = await reader?.read()
    if (!reader) continue
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    try {
      const jsonChunk = JSON.parse(chunk)
      fullResponse += jsonChunk.message.content
    } catch (e) {
      console.log('\nexited abruptly: ', chunk)
    }
  }

  return fullResponse
}

export const ask = async (prompt: string, options: any = {}) => {
  console.time('Steve is asking LLM')
  const body = {
    model: 'deepSeek-R1',
    prompt,
    stream: true,
    ...options
  }
  const payload = await fetch(`${url}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  let fullResponse = ''

  const decoder = new TextDecoder()
  const reader = payload.body!.getReader()

  while (true) {
    const { done, value } = await reader?.read()
    if (!reader) continue
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    try {
      const jsonChunk = JSON.parse(chunk)
      if (body.stream) {
        process.stdout.write(jsonChunk.response)
      }
      fullResponse += jsonChunk.response
    } catch (e) {
      // console.log('\nexited abruptly: ', chunk)
    }
  }

  console.timeEnd('Steve is asking LLM')
  return fullResponse
}

export const remember = async () => {
  // console.time('Steve is remembering')
  const blob = Bun.file('state.json', { type: 'application/json' })
  let state = {}
  try {
    state = JSON.parse(await blob.text()) as State
  } catch (e) {
    // console.log('Steve has no memory')
  }

  // console.timeEnd('Steve is remembering')
  return state
}

export const store = async (state: State) => {
  // console.time('Steve is storing')
  await Bun.write('state.json', JSON.stringify(state, null, 2))
  // console.timeEnd('Steve is storing')
}
