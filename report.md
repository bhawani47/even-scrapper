# Event Bot Project Report
By: [Your Name]
Date: Feb 15, 2024

## Project Overview
I built an events discovery system consisting of two main components:
1. A web scraper that collects event data from popular sites
2. A Telegram bot that helps users find relevant events

## Technical Approach

### Web Scraper
Started with a basic Puppeteer setup but ran into several challenges. The scraper grabs events from Eventbrite and Timeout Sydney (tried a few other sites but they blocked scraping).

The tricky parts were:
- Dealing with different HTML structures across sites
- Getting blocked as a bot (fixed by rotating user agents)
- Date formats were a mess! Each site uses different formats
- Some events had missing/incomplete data

Current solution isn't perfect but works ok for now. Dumps everything into a JSON file which the bot reads from.

### Telegram Bot 
Built using node-telegram-bot-api. Pretty straightforward implementation:
- Users tell bot what they're interested in
- Bot matches keywords against event descriptions
- Shows matching events and lets users "subscribe" for reminders
- Sends notifications day before event

Data storage is super basic (just using Maps) - definitely needs a proper DB if this were going into production.

## Main Challenges

1. **Scraping Reliability**
   - Sites frequently change their layouts
   - Bot detection is getting better
   - Need better error handling and retries

2. **Data Quality**
   - Inconsistent date formats
   - Missing locations/descriptions
   - Duplicate events across sites
   - HTML parsing is fragile

3. **Search/Matching**
   - Current keyword matching is very basic
   - No natural language understanding
   - Can't handle typos or synonyms
   - Relevance ranking needed

## Potential Improvements

If I had more time, I'd add:
- PostgreSQL for proper data storage
- Elasticsearch for better search
- NLP for understanding user interests
- Multiple scraper sources + better error handling
- User preferences & recommendation system
- Event deduplication
- Better date parsing
- Rate limiting & caching
- Proper monitoring & logging

## Lessons Learned
1. Web scraping is unreliable as a primary data source - better to use APIs where possible
2. Start with proper data storage from the beginning
3. Simple keyword matching isn't enough for good search
4. Error handling is critical for production scrapers
5. Need better testing, especially for edge cases

## Conclusion
The current implementation works as a proof of concept but would need significant improvements for production use. The bot provides basic functionality but could be much smarter about understanding user interests and finding relevant events.

Main priorities for improvement would be:
1. More reliable data collection
2. Better search/matching
3. Proper data storage
4. Enhanced user experience

Despite its limitations, this was a fun project that taught me a lot about scraping, bots, and search functionality.

---
PS: Some of the debug console.logs and TODO comments are still in the code - would clean those up before deploying!
