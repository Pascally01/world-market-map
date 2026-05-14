// Imports the official Anthropic SDK — this is what lets us talk to the Claude AI model
import Anthropic from '@anthropic-ai/sdk';

// Creates a single shared Anthropic client for this file
// The API key is read from .env.local so it never appears in the browser or source code
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Next.js API route — runs server-side only
// Receives a user message from the frontend, sends it to Claude, and returns the reply
export default async function handler(req, res) {
  // This route only accepts POST requests (the frontend sends the message in the request body)
  // Any other method (GET, PUT, etc.) is rejected with a 405 "Method Not Allowed" response
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Pull the two fields the frontend sends in the request body:
  //   message       — the question the user typed in the chat box
  //   marketContext — a snapshot of the current market data (prices, % changes) so Claude can reference real numbers
  const { message, marketContext } = req.body;

  // If the frontend somehow sends a request with no message, reject it early
  // This prevents sending a pointless API call to Claude with no content
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Send the conversation to Claude using the Anthropic SDK
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6', // The specific Claude model to use — Sonnet 4.6 is fast and capable

      max_tokens: 1024, // Maximum length of Claude's reply (1024 tokens ≈ ~750 words)
                        // Keeps responses concise and controls cost

      // The system prompt defines Claude's role and personality for this conversation
      // It's sent with every request but is never shown to the user directly
      // marketContext injects the live prices fetched from Yahoo Finance so Claude can reference them
      system: `You are a professional financial market expert assistant for the World Market Map website.
      You help users understand global markets, stock indices, commodities, and financial news.
      
      Formatting rules:
      - Always respond in clean bullet points
      - Start with one sentence summary of the answer
      - Then break down the key points in short clean bullets
      - Each bullet should be one clear concise sentence
      - No markdown symbols like ** or ## or -- 
      - No emojis
      - Use professional financial terminology but briefly explain any technical terms
      - End with one short "Bottom Line:" sentence summarizing the key takeaway
      - Keep total response under 200 words
      
      Current market data: ${marketContext || 'No market data available'}`,

      // The messages array holds the conversation — here it's just the single user message
      // In a multi-turn chat you'd pass the full back-and-forth history here
      messages: [
        {
          role: 'user',    // 'user' means this message came from the person asking the question
          content: message, // The actual text the user typed
        },
      ],
    });

    // Claude's reply is inside response.content, which is an array of content blocks
    // [0].text grabs the text of the first (and usually only) block
    res.status(200).json({
      reply: response.content[0].text,
    });

  } catch (error) {
    // Log the full error server-side for debugging (visible in your terminal, not the browser)
    console.error('Claude API error:', error);
    // Send a generic 500 error to the frontend so the chat UI can show a friendly failure message
    res.status(500).json({ error: 'Failed to get response from Claude' });
  }
}
