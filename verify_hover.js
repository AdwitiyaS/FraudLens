const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173/login');
  await page.fill('input[type="email"]', 'admin@neuralguard.com');
  await page.fill('input[type="password"]', 'admin');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
  
  await page.click('a[href="/analytics"]');
  await page.waitForURL('**/analytics');
  
  // Wait for the chart title
  const title = await page.waitForSelector('h3:has-text("Average Transaction Value")');
  const box = await title.boundingBox();
  
  if (box) {
    // Hover over a bar relative to the title. 
    // The bars are below the title. 
    // Looking at the screenshot, the Legit bar (green) is around x: box.x + 100, y: box.y + 150
    console.log('Hovering over estimated bar position...');
    await page.mouse.move(box.x + 100, box.y + 200);
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: path.resolve(__dirname, 'hover_verification_final.png') });
    console.log('Final verification screenshot taken.');
  }
  
  await browser.close();
})();
