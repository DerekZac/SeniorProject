import os
import json
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from newspaper import Article

# ------------------------------------------------------------------------------
# Load environment variables
# ------------------------------------------------------------------------------

load_dotenv(Path(__file__).resolve().parent / ".env")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "https://ryguy0601.github.io", "https://seniorproject-production-2520.up.railway.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

gemini = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

# ------------------------------------------------------------------------------
# Models
# ------------------------------------------------------------------------------

class NewsArticle(BaseModel):
    title: str
    source: str
    url: str


class CoinRequest(BaseModel):
    coin: str
    ticker: str
    articles: List[NewsArticle]


# ------------------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------------------

def download_article(url: str) -> str:
    """
    Downloads and extracts the readable article text.
    """

    try:
        article = Article(url)

        article.download()
        article.parse()

        return article.text

    except Exception as e:
        print(f"Failed to download {url}")
        print(e)
        return ""


def clean_json(text: str):

    text = text.strip()

    if text.startswith("```json"):
        text = text.replace("```json", "").replace("```", "").strip()

    elif text.startswith("```"):
        text = text.replace("```", "").strip()

    return text


# ------------------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------------------

@app.get("/")
def root():
    return {"message": "Crypto AI Backend Running"}


@app.get("/test")
def test():

    response = gemini.models.generate_content(
        model="gemini-2.5-flash",
        contents="Say hello."
    )

    return {"response": response.text}


@app.post("/classify")
def classify_coin(request: CoinRequest):

    combined_articles = ""

    for article in request.articles:

        print(f"Downloading {article.url}")

        body = download_article(article.url)

        if len(body) < 100:
            continue

        combined_articles += f"""

======================================================
Title:
{article.title}

Source:
{article.source}

Article:
{body[:6000]}
"""

    if combined_articles == "":
        raise HTTPException(
            status_code=400,
            detail="Could not extract article text."
        )

    prompt = f"""
You are an expert cryptocurrency analyst.

Analyze all of the following news articles regarding:

Coin:
{request.coin}

Ticker:
{request.ticker}

Determine the overall outlook.

Return ONLY valid JSON.

{{
    "coin":"{request.coin}",
    "ticker":"{request.ticker}",
    "classification":"",
    "confidence":0,
    "market_score":0,
    "summary":"",
    "bullish_points":[],
    "bearish_points":[],
    "important_events":[],
    "short_term":"",
    "long_term":""
}}

Rules

classification:
Bullish
Neutral
Bearish

confidence:
0-100

market_score:
-100 to 100

short_term:
Bullish
Neutral
Bearish

long_term:
Bullish
Neutral
Bearish

Focus on:

- ETF activity
- Institutional buying
- Government regulation
- Partnerships
- Security breaches
- Exchange listings
- Delistings
- Developer activity
- Network upgrades
- Whale movements
- Adoption
- Lawsuits
- Tokenomics
- Burning
- Inflation
- Staking

Ignore duplicate stories.

Only use the supplied articles.

Articles:

{combined_articles}
"""

    response = gemini.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    raw = clean_json(response.text)

    try:
        result = json.loads(raw)

    except Exception:

        raise HTTPException(
            status_code=500,
            detail=f"Gemini returned invalid JSON:\n\n{raw}"
        )

    return result


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))