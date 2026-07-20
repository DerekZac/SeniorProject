import os
import json
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from newspaper import Article
from tavily import TavilyClient

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

groq = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

tavily = TavilyClient(
    api_key=os.getenv("TAVILY_API_KEY")
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


class QuizAnswer(BaseModel):
    question: str
    answer: str


class QuizRequest(BaseModel):
    answers: List[QuizAnswer]


ALLOWED_COINS = [
    "Bitcoin",
    "Ethereum",
    "Solana",
    "XRP",
    "Dogecoin",
    "Cardano",
    "Avalanche",
    "Chainlink",
    "Polkadot",
    "Litecoin",
    "Binance Coin",
    "Shiba Inu",
    "Uniswap",
]


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

    response = groq.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": "Say hello."}]
    )

    return {"response": response.choices[0].message.content}


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
{body[:3000]}
"""

    if len(combined_articles) < 500 or (request.coin.lower() not in combined_articles.lower() and request.ticker.lower() not in combined_articles.lower()):

        print(f"RSS articles insufficient for {request.coin} ({len(combined_articles)} chars), falling back to Tavily")

        try:
            search = tavily.search(
                query=f"{request.coin} {request.ticker} crypto news",
                search_depth="advanced",
                max_results=3,
                include_raw_content=True
            )

            for result in search.get("results", []):

                body = result.get("raw_content") or result.get("content") or ""

                if len(body) < 100:
                    continue

                combined_articles += f"""

======================================================
Title:
{result.get("title", "")}

Source:
{result.get("url", "")}

Article:
{body[:3000]}
"""

        except Exception as e:
            print("Tavily search failed")
            print(e)

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

    response = groq.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )

    raw = clean_json(response.choices[0].message.content)

    try:
        result = json.loads(raw)

    except Exception:

        raise HTTPException(
            status_code=500,
            detail=f"Groq returned invalid JSON:\n\n{raw}"
        )

    return result


@app.post("/personality-quiz")
def personality_quiz(request: QuizRequest):

    if not request.answers:
        raise HTTPException(
            status_code=400,
            detail="No answers provided."
        )

    formatted_answers = ""

    for i, item in enumerate(request.answers, start=1):
        formatted_answers += f"""
{i}. {item.question}
   Answer: {item.answer}
"""

    allowed = "\n".join(f"- {c}" for c in ALLOWED_COINS)

    prompt = f"""
You are an expert cryptocurrency analyst and personality profiler.

A user answered a crypto personality quiz. Their answers:
{formatted_answers}

Based on these answers, determine their crypto investor personality.

Return ONLY valid JSON.

{{
    "personality_type":"",
    "description":"",
    "coin_recommendations":[
        {{"coin":"","reason":""}},
        {{"coin":"","reason":""}},
        {{"coin":"","reason":""}}
    ]
}}

Rules

personality_type:
A short, memorable label of 2-4 words.

description:
2-3 sentences describing this investor type, written directly to the user.

coin_recommendations:
Exactly 3 coins.
Each reason is 1-2 sentences explaining why it fits this personality.
Do not recommend the same coin twice.

You MUST choose coins ONLY from this list, spelled exactly as shown:
{allowed}

Do not invent coins outside this list.

This is educational content, not financial advice.
"""

    response = groq.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )

    raw = clean_json(response.choices[0].message.content)

    try:
        result = json.loads(raw)

    except Exception:

        raise HTTPException(
            status_code=500,
            detail=f"Groq returned invalid JSON:\n\n{raw}"
        )

    # The model can drift off the allowed list, so enforce it here.
    by_name = {c.lower(): c for c in ALLOWED_COINS}

    recommendations = []
    seen = set()

    for rec in result.get("coin_recommendations", []):

        if not isinstance(rec, dict):
            continue

        key = str(rec.get("coin", "")).strip().lower()

        if key not in by_name or key in seen:
            continue

        seen.add(key)

        recommendations.append({
            "coin": by_name[key],
            "reason": str(rec.get("reason", ""))
        })

    return {
        "personality_type": str(result.get("personality_type", "")),
        "description": str(result.get("description", "")),
        "coin_recommendations": recommendations[:3]
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))