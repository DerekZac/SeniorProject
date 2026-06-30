package com.crypton.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coin_sentiment_cache")
public class CoinSentimentCache {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "ticker", nullable = false)
    private String ticker;

    @Column(name = "coin_name", nullable = false)
    private String coinName;

    @Column(name = "classification", nullable = false)
    private String classification;

    @Column(name = "confidence")
    private int confidence;

    @Column(name = "market_score")
    private int marketScore;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "bullish_points", columnDefinition = "TEXT")
    private String bullishPoints;

    @Column(name = "bearish_points", columnDefinition = "TEXT")
    private String bearishPoints;

    @Column(name = "important_events", columnDefinition = "TEXT")
    private String importantEvents;

    @Column(name = "short_term")
    private String shortTerm;

    @Column(name = "long_term")
    private String longTerm;

    @Column(name = "cached_at")
    private LocalDateTime cachedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    public CoinSentimentCache() {}

    public CoinSentimentCache(String ticker, String coinName, String classification,
                               int confidence, int marketScore, String summary,
                               String bullishPoints, String bearishPoints,
                               String importantEvents, String shortTerm, String longTerm) {
        this.ticker = ticker;
        this.coinName = coinName;
        this.classification = classification;
        this.confidence = confidence;
        this.marketScore = marketScore;
        this.summary = summary;
        this.bullishPoints = bullishPoints;
        this.bearishPoints = bearishPoints;
        this.importantEvents = importantEvents;
        this.shortTerm = shortTerm;
        this.longTerm = longTerm;
        this.cachedAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusHours(1);
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    // Getters
    public Long getId() { return id; }
    public String getTicker() { return ticker; }
    public String getCoinName() { return coinName; }
    public String getClassification() { return classification; }
    public int getConfidence() { return confidence; }
    public int getMarketScore() { return marketScore; }
    public String getSummary() { return summary; }
    public String getBullishPoints() { return bullishPoints; }
    public String getBearishPoints() { return bearishPoints; }
    public String getImportantEvents() { return importantEvents; }
    public String getShortTerm() { return shortTerm; }
    public String getLongTerm() { return longTerm; }
    public LocalDateTime getCachedAt() { return cachedAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setTicker(String ticker) { this.ticker = ticker; }
    public void setCoinName(String coinName) { this.coinName = coinName; }
    public void setClassification(String classification) { this.classification = classification; }
    public void setConfidence(int confidence) { this.confidence = confidence; }
    public void setMarketScore(int marketScore) { this.marketScore = marketScore; }
    public void setSummary(String summary) { this.summary = summary; }
    public void setBullishPoints(String bullishPoints) { this.bullishPoints = bullishPoints; }
    public void setBearishPoints(String bearishPoints) { this.bearishPoints = bearishPoints; }
    public void setImportantEvents(String importantEvents) { this.importantEvents = importantEvents; }
    public void setShortTerm(String shortTerm) { this.shortTerm = shortTerm; }
    public void setLongTerm(String longTerm) { this.longTerm = longTerm; }
    public void setCachedAt(LocalDateTime cachedAt) { this.cachedAt = cachedAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}