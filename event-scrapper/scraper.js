const puppeteer = require('puppeteer');
const fs = require('fs');

// FIXME: Maybe switch to playwright? Puppeteer's been flaky lately
async function scrapeEvents() {
    console.log('Starting scraper... 🕷️');
    
    const browser = await puppeteer.launch({
        headless: "new",  // old headless mode is deprecated
        // devtools: true, // uncomment for debugging
    });

    try {
        const page = await browser.newPage();
        // trying to avoid bot detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        
        // TODO: add more sources, these are just test sites for now
        const eventSites = [
            'https://www.eventbrite.com.au/d/australia--sydney/all-events/',
            'https://www.timeout.com/sydney/events',
            // 'https://whatson.cityofsydney.nsw.gov.au/', // site blocked scraping :(
        ];

        let allEvents = [];  // dump everything here for now

        for(let site of eventSites) {
            console.log(`\nScraping ${site}`);
            await page.goto(site, {waitUntil: 'networkidle0', timeout: 30000});
            
            // quick n dirty event extraction - needs cleanup
            const events = await page.evaluate(() => {
                // just grabbing what we can find...
                const eventElements = document.querySelectorAll('article, .event-card, .event-listing');
                return Array.from(eventElements).map(el => ({
                    name: el.querySelector('h2, h3, .title')?.innerText?.trim() || 'No title',
                    date: el.querySelector('.date, time, .event-date')?.innerText?.trim() || 'TBD',
                    location: el.querySelector('.location, .venue, .event-location')?.innerText?.trim() || 'Sydney',
                    description: el.querySelector('.description, .summary, .event-description')?.innerText?.trim() || '',
                    // sometimes this fails - need better error handling
                    url: el.querySelector('a')?.href || '',
                })).filter(e => e.name !== 'No title'); // skip empty ones
            });

            // console.log('Debug - Found events:', events.length); // debugging
            allEvents = [...allEvents, ...events];
        }

        // clean up the data a bit - lots of junk coming through
        const cleanEvents = allEvents
            .filter(e => e.name && e.date)  // basic validation
            .map(e => ({
                ...e,
                date: new Date(e.date).toISOString(),  // trying to standardize dates
                // should probably sanitize these better
                name: e.name.replace(/[\n\r]+/g, ' ').trim(),
                description: e.description.slice(0, 200) + '...',  // keep it brief
            }));

        // dump to file - maybe use a proper DB later?
        fs.writeFileSync('events.json', JSON.stringify(cleanEvents, null, 2));
        console.log(`\nSaved ${cleanEvents.length} events! 🎉`);

    } catch(err) {
        console.error('Ugh, something broke:', err);
        // TODO: add proper error handling & retries
    } finally {
        await browser.close();
    }
}

// run it!
scrapeEvents();
// setInterval(scrapeEvents, 1000 * 60 * 60); // auto-update hourly?
