/**
 * @typedef {Object} Ids 
 * @property {string} login 
 * @property {string} password
 * @property {string} twoCaptchaToken
 */

/** @type {Ids} ids */
const ids = require('./ids.json')
const puppeteer = require('puppeteer-extra')
const stealthPlugin = require('puppeteer-extra-plugin-stealth')
const recaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
puppeteer.use(stealthPlugin())
puppeteer.use(
    recaptchaPlugin({
      provider: {
        id: '2captcha',
        token: ids.twoCaptchaToken
      },
      visualFeedback: true
    })
)

/**
 * @param {boolean} debugMode
 * 
 * @returns {Promise}
 */
async function startFarming(debugMode = false) {
    return new Promise(async (resolve) => {
        debugMode && console.log('Launch !')
        const browser = await puppeteer.launch({
            headless: false,
            args: [
                '--window-size=1280,720',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36 OPR/71.0.3770.271'
            ]
        })
        
        ! debugMode && args.push('--window-position=0,-600')
        debugMode && console.log('Launched')
        const page = await browser.newPage()
        await page.goto('https://adbtc.top/index/enter')

        debugMode && console.log('Selecting ReCaptcha...')
        const captchaSelector = '.select-dropdown.dropdown-trigger'
        await page.waitForSelector(captchaSelector)
        await page.click(captchaSelector)

        const reCaptchaSelector = 'li[tabindex="0"]:nth-of-type(2)'
        await page.waitForSelector(reCaptchaSelector)
        await page.click(reCaptchaSelector)

        debugMode && console.log('Selected ! Entering username and password...')
        const usernameInputSelector = '#pochka'
        await page.waitForSelector(usernameInputSelector)
        const passwordInputSelector = '#paszwort'
        await page.waitForSelector(passwordInputSelector)
        await page.evaluate((usernameInputSelector, passwordInputSelector, login, password) => {
            document.querySelector(usernameInputSelector).value = login
            document.querySelector(passwordInputSelector).value = password
        }, usernameInputSelector, passwordInputSelector, ids.login, ids.password)

        debugMode && console.log('Entered ! Waiting for ReCaptcha...')
        const reCaptchaIFrameSelector = 'iframe'
        await page.waitForSelector(reCaptchaIFrameSelector)

        debugMode && console.log('Waited ! Solving ReCaptcha...')
        await page.solveRecaptchas()
        debugMode && console.log('Solved ! Loging in...')

        const submitButton = 'input[type="submit"]'
        await page.waitForSelector(submitButton)
        await page.click(submitButton)

        debugMode && console.log('Logged in !')
        //browser.close()
    })
}

module.exports = startFarming
