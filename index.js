import { create } from 'venom-bot'
import * as dotenv from 'dotenv'
import { Configuration, OpenAIApi } from 'openai'

dotenv.config()

const configuration = new Configuration({
    apiKey: process.env.OPEN_AI_KEY,
    organization: process.env.ORG
})

const openai = new OpenAIApi(configuration)

const handleDavinciCommand = async (text) => {
  const options = {
    model: "text-davinci-003",
    prompt: text,
    temperature: 1,
    max_tokens: 4000
  }

  try {
    const response = await openai.createCompletion(options)
    let botResponse = ""
    response.data.choices.forEach(({ text }) => {
        botResponse += text
    })
    return `Chat GPT 🤖\n\n ${botResponse.trim()}`
  } catch (e) {
      return `👷🏻‍♂️ OpenAI Response Error: ${e.response.data.error.message}`
  }
}

const handleDalleCommand = async (text) => {
  const options = {
    prompt: text,
    n: 1,
    size: "1024x1024",
  }

  try {
    const response = await openai.createImage(options)
    return response.data.data[0].url
  } catch (e) {
      return `👷🏻‍♂️ OpenAI Response Error: ${e.response.data.error.message}`
  }
}

const handleCommand = async (client, message) => {
  const iaCommands = {
      davinci3: "/bot",
      dalle: "/img"
  }

  const firstWord = message.text.substring(0, message.text.indexOf(" "))
  const text = message.text.substring(message.text.indexOf(" "))
  const from = message.from === process.env.WHAST_BOT_NUMBER ? message.to : message.from

  switch (firstWord) {
    case iaCommands.davinci3:
      const response = await handleDavinciCommand(text)
      client.sendText(from, response)
      break

    case iaCommands.dalle:
      const imgUrl = await handleDalleCommand(text)
      client.sendImage(
          from,
          imgUrl,
          text,
          'IA DALL-E IMAGE 👨🏼‍🎨 '
      )
      break
  }
}

create({
    session: 'chat-gpt',
    multidevice: true
})
.then((client) => {
    client.onAnyMessage((message) => handleCommand(client, message))
})
.catch((error) => {
    console.log(error)
})
