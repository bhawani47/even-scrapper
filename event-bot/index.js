const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const express = require('express');
const app = express();

// bot token - remember to move to env file later!
const token = '7659582089:AAE4MfKEocY5lTHXvzN6Yi01fzf2UakNHBg'; // Your TELEGRAM_BOT_TOKEN

// Bot configuration based on environment:
// - Use polling in development
// - Use webhook in production
const bot = new TelegramBot(token, {
    webHook: process.env.NODE_ENV === 'production',
    polling: process.env.NODE_ENV !== 'production'
});

// Set webhook URL if in production
if (process.env.NODE_ENV === 'production') {
    const webhookUrl = 'https://your-render-app-url.onrender.com'; // Replace with your actual Render URL
    bot.setWebHook(`${webhookUrl}/webhook`)
        .then(() => console.log("✅ Webhook set successfully!"))
        .catch(err => console.error("❌ Error setting webhook:", err));
}

let events;

// temp solution - will implement proper DB later
const fetchEvents = () => {
    fetch('https://event-scrapper.onrender.com/events', {
        method: 'POST',
    })
        .then(res => res.json())
        .then(data => {
            events = data;
        })
        .catch(err => console.error("Error fetching events:", err));
}

// quick fix for storing user data - need to implement Redis/MongoDB
let userPrefs = new Map();
let registeredEvents = new Map();

// TODO: improve keyword matching algorithm (maybe use NLP?)
function matchEvents(searchText) {
    let keywords = searchText.toLowerCase().split(' ');
    return events.filter(evt => {
        let fullText = `${evt.name} ${evt.description} ${evt.location}`.toLowerCase();
        return keywords.some(kw => fullText.includes(kw));
    });
}

// bot commands
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 
        'Hey there! 🎉\n\n' +
        'I\'m your Sydney events buddy!\n' +
        'Just tell me what you\'re into and I\'ll find some cool events.\n\n' +
        'Like: "indie music" or "food festivals" or whatever you\'re feeling!'
    );
});

// handle user messages
bot.on('message', (msg) => {
    console.log('Received:', msg.text);
    if (msg.text.startsWith('/')) return; // skip commands

    const chatId = msg.chat.id;
    const txt = msg.text;
    userPrefs.set(chatId, txt);
    
    let matches = matchEvents(txt);

    if (!matches.length) {
        bot.sendMessage(chatId, 'Hmm, not finding anything right now... Try something else?');
        return;
    }

    // Build response (consider limiting results if needed)
    let resp = 'Check these out:\n\n';
    matches.forEach((e, i) => {
        resp += `${i + 1}. ${e.name}\n`;
        resp += `📅 ${new Date(e.date).toLocaleDateString()}\n`;
        resp += `📍 ${e.location}\n\n`;
    });
    resp += 'Want updates? Just send the number (like "1" or "2")';

    bot.sendMessage(chatId, resp);
});

// handle event signup
bot.onText(/^[0-9]+$/, (msg) => {
    let chatId = msg.chat.id;
    let idx = parseInt(msg.text) - 1;
    let prefs = userPrefs.get(chatId);
    
    if (!prefs) {
        bot.sendMessage(chatId, 'Hold up - tell me what you\'re interested in first!');
        return;
    }

    let matches = matchEvents(prefs);
    if (idx >= 0 && idx < matches.length) {
        let picked = matches[idx];
        registeredEvents.set(chatId, picked);
        
        bot.sendMessage(chatId, 
            `Sweet! I'll keep you posted about:\n` +
            `"${picked.name}"\n\n` +
            `You'll get a heads up before it starts! 🔔`
        );
    }
});

// check upcoming events hourly (adjust timezone handling as needed)
cron.schedule('0 * * * *', () => {
    let now = new Date();
    let tmrw = new Date(now.setDate(now.getDate() + 1));

    registeredEvents.forEach((evt, chatId) => {
        let eventDate = new Date(evt.date);
        if (eventDate.toDateString() === tmrw.toDateString()) {
            bot.sendMessage(chatId,
                `Yo! Don't forget: "${evt.name}" is tomorrow!\n\n` +
                `📅 ${eventDate.toLocaleDateString()}\n` +
                `📍 ${evt.location}\n` +
                `🎫 ${evt.url}`
            );
        }
    });
});

// Temp debug logs
console.log('Bot started - ctrl+c to exit');
fetchEvents();

// Use express.json() middleware so JSON bodies are parsed
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Webhook endpoint (no token in URL) and using processUpdate
app.post('/webhook', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
