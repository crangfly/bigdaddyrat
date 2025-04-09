import express from 'express'
import ollama from 'ollama';

const app = express()
const PORT = 3457

app.use(express.json())

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message

  if (!userMessage) {
    return res.status(400).json({ error: 'Missing message' })
  }

  try {
    const response = await ollama.chat({
      model: 'smollm2',
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    })

    res.json({ response: response.message.content })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to get response from model' })
  }
})

app.listen(PORT, () => {
  console.log(`Big Daddy Rat server running on http://localhost:${PORT}`)
})