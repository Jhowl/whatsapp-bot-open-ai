import { create } from 'venom-bot'
import * as dotenv from 'dotenv'
import { Configuration, OpenAIApi } from 'openai'

dotenv.config()

const configuration = new Configuration({
    apiKey: process.env.OPEN_AI_KEY,
    organization: process.env.ORG
})

const openai = new OpenAIApi(configuration)

const handleError = (e) => {
  console.log("errorrr", e)
  return `👷🏻‍♂️ OpenAI Response Error: ${e.response.data.error.message}`
}

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
      return handleError(e)
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
      return handleError(e)
  }
}

const handleCommand = async (client, message) => {
  const commands = {
      "gpt": handleDavinciCommand,
      "image": handleDalleCommand
  }

  const [command, ...args] = message.text.split(" ")
  const handler = commands[command.substr(1)]

  if (!handler) {
      return
  }

  const response = await handler(args.join(" "))
  const from = message.from === process.env.WHAST_BOT_NUMBER ? message.to : message.from

  client.sendText(from, response)
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
