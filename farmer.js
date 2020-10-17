const puppeteer = require('puppeteer-extra')
const stealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(stealthPlugin())

/**
 * @param {boolean} debugMode
 * 
 * @returns {Promise}
 */
async function startFarming(debugMode = false) {

    return new Promise(async () => {
        debugMode && console.log('Launch !')
        const browser = await puppeteer.launch({
            headless: false,
            args: [
                '--window-size=800,500',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36 OPR/71.0.3770.271'
            ]
        })
        
        ! debugMode && args.push('--window-position=0,-600')
        debugMode && console.log('Launched')
        const page = await browser.newPage()
        await page.goto('https://adbtc.top/index/enter')

        const captchaSelector = '.select-dropdown.dropdown-trigger'
        await page.waitForSelector(captchaSelector)
        await page.click(captchaSelector)

        const reCaptchaSelector = 'li[tabindex="0"]:nth-of-type(2)'
        await page.waitForSelector(reCaptchaSelector)
        await page.click(reCaptchaSelector)

        //browser.close()
    })
}

module.exports = startFarming
