// server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static assets (e.g., CSS)
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

let events = [];

// Helper to load events from the JSON file
function loadEvents() {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'events.json'), 'utf8');
    events = JSON.parse(data);
  } catch (err) {
    console.error('Error reading events.json', err);
    events = [];
  }
}

// Homepage: display events
app.get('/', (req, res) => {
  loadEvents(); // Refresh events on each request
  res.render('index', { events });
});

// Ticket page: display form for email submission
app.get('/ticket', (req, res) => {
  loadEvents(); // Ensure events are up-to-date
  const eventId = req.query.eventId;
  const event = events.find(e => e.id == eventId);
  if (!event) {
    return res.send("Event not found");
  }
  res.render('ticket', { event });
});

// Process ticket form submission and redirect to original event URL
app.post('/ticket', (req, res) => {
  loadEvents();
  const { eventId, email } = req.body;
  // Here you could store the email for mailing list purposes.
  const event = events.find(e => e.id == eventId);
  if (!event) {
    return res.send("Event not found");
  }
  // Redirect to the event’s original website
  res.redirect(event.url);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
