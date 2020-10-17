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
        /** @type {import('puppeteer').Browser} browser */
        const browser = await puppeteer.launch({
            headless: false,
            args: [
                '--window-size=1280,720',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36 OPR/71.0.3770.271'
            ]
        })
        
        try {
            ! debugMode && args.push('--window-position=0,-800')
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

            await timeout(3000)

            await watchAds(browser, page, debugMode)

            await browser.close()
            resolve()

        } catch (error) {
            console.log(error)
            await browser.close()
            await startFarming(debugMode)
            resolve()
        }
    })
}

/**
 * @param {import('puppeteer').Browser} browser 
 * @param {import('puppeteer').Page} page 
 * @param {boolean} debugMode
 */
async function watchAds(browser, page, debugMode) {
    return new Promise(async (resolve, reject) => {
        try {
            let running = true
            let mainPage = page
            let pages
            let pageTitle
            let explodedTitle
            let timeoutTime = 30
            const startButtonSelector = '.pulse.animated, .open.btn.green'
            while (running) {
                debugMode && console.log('Clicking start...')
                await mainPage.waitForSelector(startButtonSelector)
                await mainPage.click(startButtonSelector)
                debugMode && console.log('Clicked ! Watching ad...')
                await timeout(3000)
                pages = await browser.pages()
                for (let i = 0; i < pages.length; i += 1) {
                    pageTitle = await pages[i].evaluate(() => document.title)
                    explodedTitle = pageTitle.split(' ')
                    if (explodedTitle.length && parseInt(explodedTitle[0])) {
                        timeoutTime = parseInt(pageTitle.split(' ')[0]) + 3
                        mainPage = pages[i]
                    }
                }
                console.log('Watching for ' + timeoutTime + ' seconds...')
                await timeout(timeoutTime * 1000)
                debugMode && console.log('Watched !')
                for (let i = 0; i < pages.length; i += 1) {
                    pageTitle = await pages[i].evaluate(() => document.title)
                    if (! pageTitle.includes('You earned ') && ! pageTitle.includes('Get Bitcoin for viewing websites')) {
                        await pages[i].close()
                    }
                }
                module.exports.page = mainPage

                await timeout(3000)
            }
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = startFarming
