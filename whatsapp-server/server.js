const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let messages = []; // In-memory storage for hackathon

// Endpoint for Twilio webhook to send incoming WhatsApp messages
app.post('/whatsapp-webhook', (req, res) => {
    const from = req.body.From;
    const body = req.body.Body;
    const timestamp = new Date().toISOString();

    console.log(`Received message from ${from}: ${body}`);

    messages.unshift({
        from,
        body,
        timestamp
    });

    // Optional auto-reply:
    // res.send('<Response><Message>Thanks for your message!</Message></Response>');

    res.status(200).send('Message received');
});

// Endpoint for React to fetch messages
app.get('/messages', (req, res) => {
    res.json(messages);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
