# Sydney Events Project

This project consists of two parts:

## Assignment 1: Web Page with Scraped Event Data
- **Description:** A website that lists events in Sydney, automatically scraped from event websites.
- **Features:**
  - Daily scraping (using Axios and Cheerio) with a Node.js cron job.
  - Express-based server and EJS templating to display events.
  - “GET TICKETS” button captures user email and redirects to the original event page.
- **Setup:**
  1. Install dependencies: `npm install`
  2. Run the scraper: `npm run scrape`
  3. Start the web server: `npm start`
  4. Open your browser at `http://localhost:3000`

## Assignment 2: Telegram Bot for Event Notifications
- **Description:** A Telegram bot (MVP) that uses a simulated LLM (via keyword matching) to help users select an event and sends notifications when it’s happening.
- **Setup:**
  1. Replace `YOUR_TELEGRAM_BOT_TOKEN_HERE` in `index.js` with your Telegram Bot Token.
  2. Install dependencies: `npm install`
  3. Start the bot: `node index.js`
  4. Interact with your bot on Telegram.
