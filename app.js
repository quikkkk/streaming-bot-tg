require('dotenv').config()

const { Telegraf } = require('telegraf')
const validator = require('validator')
const axios = require('axios')
const jsdom = require('jsdom')

const bot = new Telegraf(process.env.BOT_APIKEY)

const getData = async ({ link }) => {
 try {
  const request = await axios(`https://song.link/${link}`, {
   maxRedirects: 20,
   timeout: 100000,
   maxContentLength: 50000000
  })

  const dom = new jsdom.JSDOM(request.data)
  const jsonData = dom.window.document.querySelector('initialState').innerHTML

  return JSON.parse(jsonData)
 } catch (e) {
  return
 }
}

bot.start(ctx => ctx.reply('👋 Привет!\n\nПоделись со мной ссылкой на трек или альбом из любого приложения, а я в ответ пришлю ссылки, на все музыкальные сервисы где можно найти этот альбом или композицию.'))

bot.on('message', async ctx => {
 const message = ctx.message.text

 if (message) {
  try {
   if (validator.isURL(message)) {
    const sendLinks = async () => {
     ctx.reply('🚬 Подождите немного, пока я ищу ссылки...')

     const data = await getData({ link: message })

     if (data) {
      let links = ''

      data.songLink.links.listen.forEach(item => links = `${links}\n${item.name}\n${item.data.listenUrl}\n`)

      ctx.reply(links)
      ctx.reply('👋 Готово!')
     } else ctx.reply('😣 Кажется у меня нет данных по этой ссылке. Убедись, что адрес верный.')
    }

    sendLinks()
   } else ctx.reply('🤔 Я думаю, что это не ссылка...')
  } catch (e) {
   throw e
  }
 }
})

bot.launch()