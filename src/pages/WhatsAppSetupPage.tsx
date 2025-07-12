// src/pages/WhatsAppSetupPage.tsx

import React, { useState } from 'react';

export default function WhatsAppSetupPage() {
    const [to, setTo] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');
    const [inbox, setInbox] = useState<string[]>([]); // Simulated inbox

    const sendWhatsAppMessage = async () => {
        const ACCOUNT_SID = 'AC693f156e099cf22a58f1ba99695449a1';
        const AUTH_TOKEN = 'e0682014a48996dd537cdcd4acbde891';
        const FROM_NUMBER = 'whatsapp:+14155238886'; // Twilio sandbox
        const TO_NUMBER = `whatsapp:${to}`;

        const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`;
        const body = new URLSearchParams({
            From: FROM_NUMBER,
            To: TO_NUMBER,
            Body: message
        });

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + btoa(`${ACCOUNT_SID}:${AUTH_TOKEN}`),
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body
            });

            if (response.ok) {
                setStatus('✅ Message sent successfully!');
                setMessage('');
            } else {
                const errorData = await response.json();
                setStatus(`❌ Failed: ${errorData.message}`);
            }
        } catch (error: any) {
            setStatus(`❌ Error: ${error.message}`);
        }
    };

    const simulateIncomingMessage = () => {
        const simulatedMessage = `Simulated message from ${to || '+0000000000'}: "${message || 'Hello!'}"`;
        setInbox([simulatedMessage, ...inbox]);
    };

    return (
        <div className="p-4 max-w-lg mx-auto">
            <h1 className="text-2xl font-bold mb-4">WhatsApp Hackathon Integration</h1>

            <input
                type="text"
                placeholder="Customer Phone (e.g., +923001234567)"
                value={to}
                onChange={e => setTo(e.target.value)}
                className="border p-2 w-full mb-2 rounded"
            />

            <textarea
                placeholder="Type your message..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="border p-2 w-full mb-2 rounded"
            ></textarea>

            <button
                onClick={sendWhatsAppMessage}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full mb-2"
            >
                Send WhatsApp Message
            </button>

            <button
                onClick={simulateIncomingMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full mb-2"
            >
                Simulate Receiving Message
            </button>

            {status && <p className="text-center mt-2 text-gray-700">{status}</p>}

            <div className="mt-4 border p-2 rounded">
                <h2 className="text-lg font-semibold mb-2">📥 Inbox (Simulated)</h2>
                {inbox.length === 0 ? (
                    <p className="text-gray-500">No messages yet.</p>
                ) : (
                    <ul className="list-disc pl-5">
                        {inbox.map((msg, idx) => (
                            <li key={idx} className="text-sm text-gray-800">{msg}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
