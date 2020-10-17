/**
 * @typedef {Object} Ids 
 * @property {string} login 
 * @property {string} password
 * @property {string} twoCaptchaToken
 */

/** @type {Ids} ids */
const ids = require('./ids.json')
const timeout = require('@pierreminiggio/timeout')

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

        debugMode && console.log('Logged in ! Going to ads watching page...')
        const adWatcherMenuItemSelector = '.collection.menu:nth-of-type(3)>a:nth-of-type(3)'
        await page.waitForSelector(adWatcherMenuItemSelector)
        await page.click(adWatcherMenuItemSelector)

        debugMode && console.log('Went ! Waiting for captcha...')
        const reCaptchaIFrameSelector2 = reCaptchaIFrameSelector
        await page.waitForSelector(reCaptchaIFrameSelector2)

        debugMode && console.log('Waited ! Solving ReCaptcha...')
        await page.solveRecaptchas()

        debugMode && console.log('Solved ! Start watching ads...')

        await watchAds(browser, page, debugMode)

        browser.close()

        resolve()
    })
}

/**
 * @param {import('puppeteer').Browser} browser 
 * @param {import('puppeteer').Page} page 
 * @param {boolean} debugMode
 */
async function watchAds(browser, page, debugMode) {
    return new Promise(async (resolve) => {
        let running = true
        let mainPage = page
        let pages
        const startButtonSelector = '.pulse.animated'
        while (running) {
            debugMode && console.log('Clicking start...')
            await page.waitForSelector(startButtonSelector)
            await page.click(startButtonSelector)
            debugMode && console.log('Clicked ! Watching ad...')
            await timeout(30000)
            pages = await browser.pages() 
            for (let i = 0; i < pages.length; i += 1) {
                if (! (await pages[i].title()).includes('You earned ')) {
                    await pages[i].close()
                } else {
                    mainPage = pages[i]
                }
            }
            debugMode && console.log('Watched !')
            module.exports.page = mainPage
        }
        resolve()
    })
}

module.exports = startFarming
