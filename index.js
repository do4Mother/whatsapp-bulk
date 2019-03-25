const puppeteer = require('puppeteer');
const config = require('./config')
const fs = require('fs')

const start = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: './user_data'
  })
  const page = await browser.newPage()
  const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
  'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
  await page.setUserAgent(userAgent);
  await page.goto('http://web.whatsapp.com')
  await page.waitForSelector('._2Uo0Z', {timeout: 60000})
  
  console.log('logged in')

  let contactlist = getContact(config.contact)
  contactlist = contactlist.split(/\r?\n/)

  for (const contact of contactlist) {
    const precontent = getContent(config.content)
    let content = encodeURI(precontent)
    await page.goto('https://web.whatsapp.com/send?phone='+contact+'&text='+content)
    await page.on('dialog', async dialog => {
      await dialog.accept()
    }) 
    try {
      await page.waitForSelector('._2S1VP', {timeout: 10000})
    } catch (error) {
      console.log('invalid phone number ' +contact+' in line-'+eval(i+1))
      return;
    }
    await page.focus('._2S1VP.copyable-text.selectable-text')
    await page.keyboard.press(String.fromCharCode(13))
    console.log('success send message to '+contact)
  }

  console.log('done')
  await page.waitFor(1000)
  browser.close()
}

start()

const getContact = (path) => {
  const contact = fs.readFileSync(path, {encoding: 'utf-8'})
  return contact;
}

const getContent = (path) => {
  const content = fs.readFileSync(path, {encoding: 'utf-8'})
  return content;
}
