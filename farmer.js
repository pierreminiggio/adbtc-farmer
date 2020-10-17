const puppeteer = require('puppeteer')

/**
 * @param {boolean} debugMode 
 */
function startFarming(debugMode = false) {
    console.log('Launch !')
    const browser = await puppeteer.launch({
        headless: ! show,
        args: [
            '--window-size=800,500'
        ]
    })
    
    ! debugMode && args.push('--window-position=0,-600')
    debugMode && console.log('Launched')
    const page = await browser.newPage()
    await page.goto('https://adbtc.top/index/enter')

    //browser.close()
}

