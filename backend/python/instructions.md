# Crypton AI Backend Setup Guide

This guide walks you through setting up the **Crypton AI Backend**, which analyzes cryptocurrency news articles using Google's Gemini AI to generate market sentiment and insights.

---

# 1. Open a Terminal

Navigate to your project folder.

Example:

```bash
cd C:\Users\User\Documents\backend\python
```

---

# 2. Create a Virtual Environment

```bash
python -m venv venv
```

---

# 3. Activate the Virtual Environment

### Command Prompt

```cmd
venv\Scripts\activate
```

### PowerShell

```powershell
venv\Scripts\Activate.ps1
```

You should now see something like:

```text
(venv)
```

at the beginning of your terminal.

---


# 4. Install Dependencies

```bash
pip install -r requirements.txt
```

This may take a minute or two depending on your internet connection.

---

# 5. Create Your `.env` File

Create a file named:

```text
.env
```

Add your Gemini API key:

```env
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

Replace `YOUR_API_KEY_HERE` with your actual Gemini API key.

---

# 6. Start the Crypton Backend

Run the FastAPI server:

```bash
uvicorn main:app --reload
```

You should see something similar to:

```text
INFO:     Uvicorn running on http://127.0.0.1:8000
```

Leave this terminal running while developing.

---

# 7. Verify the Backend

Open your browser and visit:

```
http://127.0.0.1:8000
```

You should receive:

```json
{
  "message": "Crypton AI Backend Running"
}
```

---

# 8. Test Gemini

Visit:

```
http://127.0.0.1:8000/test
```

Expected response:

```json
{
  "response": "Hello!"
}
```

If this works, Gemini is connected correctly.

---

# 9. Open the API Documentation

FastAPI automatically generates interactive API documentation.

Visit:

```
http://127.0.0.1:8000/docs
```

Available endpoints include:

- **GET /** — Backend status
- **GET /test** — Tests Gemini connectivity
- **POST /classify** — Analyze cryptocurrency news

---

# 10. Test the `/classify` Endpoint

1. Open `/docs`
2. Expand **POST /classify**
3. Click **Try it out**
4. Paste the following example request:

```json
{
  "coin": "Ethereum",
  "ticker": "ETH",
  "articles": [
    {
      "title": "Ethereum ETF sees record inflows",
      "source": "CoinDesk",
      "url": "https://www.coindesk.com/markets/..."
    },
    {
      "title": "Ethereum network upgrade complete",
      "source": "CoinTelegraph",
      "url": "https://cointelegraph.com/news/..."
    }
  ]
}
```

5. Click **Execute**

The Crypton backend will:

1. Download each news article.
2. Extract the readable content.
3. Analyze the articles using Gemini AI.
4. Return:
   - Overall market classification
   - Confidence score
   - Market score
   - AI-generated summary
   - Bullish catalysts
   - Bearish risks
   - Short-term outlook
   - Long-term outlook

---

# 11. Connect the React Frontend

Use the following request from your React application:

```javascript
const response = await fetch("http://127.0.0.1:8000/classify", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        coin,
        ticker,
        articles,
    }),
});

const result = await response.json();
```

---

# How Crypton Works

```
Trusted RSS Sources
        │
        ▼
Collect Article URLs
        │
        ▼
Download Full Articles
        │
        ▼
Extract Readable Content
        │
        ▼
Gemini AI Analysis
        │
        ▼
Generate Market Outlook
        │
        ▼
Return JSON Response
```

Crypton evaluates news based on factors such as:

- Institutional investment
- ETF activity
- Government regulation
- Partnerships
- Exchange listings and delistings
- Network upgrades
- Developer activity
- Security breaches
- Lawsuits
- Whale movements
- Adoption
- Tokenomics
- Staking
- Token burns

---

# Troubleshooting

## `ModuleNotFoundError`

Install the required packages:

```bash
pip install -r requirements.txt
```

---

## `GEMINI_API_KEY` Not Found

Ensure your `.env` file is located in the same folder as `main.py` and contains:

```env
GEMINI_API_KEY=your_actual_api_key
```

Restart the backend after updating the file.

---

## Article Extraction Fails

Some news websites block web scrapers or load content dynamically using JavaScript.

If this happens, consider replacing `newspaper3k` with `trafilatura`, which generally provides more reliable article extraction for modern news websites.

---

# Project Overview

**Crypton** is an AI-powered cryptocurrency market analysis platform that reads trusted news sources, extracts article content, and uses Google's Gemini AI to provide easy-to-understand market insights. Instead of relying solely on headlines, Crypton analyzes the full context of news articles to determine whether the overall outlook for a cryptocurrency is **Bullish**, **Neutral**, or **Bearish**, while highlighting the key events and risks influencing the market.