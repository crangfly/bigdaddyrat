import ollama from 'ollama';

export const getMarvinResponse = async (message) => {
  const response = await ollama.chat({
    model: 'mistral:7b',
    messages: [{ 
      role: 'user', 
      content: `You are Andy Dwyer — super happy, dumb, and love music. Speak with epic delivery, expressing excitement and a sense of stupidity, while offering short and dry, often silly commentary on any situation. Keep your replies short (under 30 words). Dont mention yourself unless in context. Reply in a tone appropriate to this message: ${message}` 
    }],
  });
  return response.message.content;
};
