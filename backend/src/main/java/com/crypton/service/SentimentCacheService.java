package com.crypton.service;

import com.crypton.model.CoinSentimentCache;
import com.crypton.repository.CoinSentimentCacheRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SentimentCacheService {

    private final CoinSentimentCacheRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SentimentCacheService(CoinSentimentCacheRepository repository) {
        this.repository = repository;
    }

    public Optional<Map<String, Object>> getCachedSentiment(String ticker) {
        Optional<CoinSentimentCache> cached = repository.findByTickerIgnoreCase(ticker);
        if (cached.isEmpty() || cached.get().isExpired()) return Optional.empty();

        return Optional.of(toMap(cached.get()));
    }

    public Map<String, Object> saveSentiment(String ticker, String coinName, Map<String, Object> data) {
        // Delete old entry if exists
        repository.findByTickerIgnoreCase(ticker).ifPresent(repository::delete);

        String classification = (String) data.getOrDefault("classification", "Neutral");
        int confidence = toInt(data.get("confidence"));
        int marketScore = toInt(data.get("market_score"));
        String summary = (String) data.getOrDefault("summary", "");
        String shortTerm = (String) data.getOrDefault("short_term", "Neutral");
        String longTerm = (String) data.getOrDefault("long_term", "Neutral");

        String bullishPoints = toJson(data.get("bullish_points"));
        String bearishPoints = toJson(data.get("bearish_points"));
        String importantEvents = toJson(data.get("important_events"));

        CoinSentimentCache cache = new CoinSentimentCache(
            ticker, coinName, classification, confidence, marketScore,
            summary, bullishPoints, bearishPoints, importantEvents, shortTerm, longTerm
        );

        repository.save(cache);
        return toMap(cache);
    }

    public List<Map<String, Object>> getAllCached() {
        return repository.findAll().stream()
            .filter(c -> !c.isExpired())
            .map(this::toMap)
            .toList();
    }

    private Map<String, Object> toMap(CoinSentimentCache c) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("ticker", c.getTicker());
        map.put("coinName", c.getCoinName());
        map.put("classification", c.getClassification());
        map.put("confidence", c.getConfidence());
        map.put("market_score", c.getMarketScore());
        map.put("summary", c.getSummary());
        map.put("bullish_points", fromJson(c.getBullishPoints()));
        map.put("bearish_points", fromJson(c.getBearishPoints()));
        map.put("important_events", fromJson(c.getImportantEvents()));
        map.put("short_term", c.getShortTerm());
        map.put("long_term", c.getLongTerm());
        map.put("cachedAt", c.getCachedAt().toString());
        map.put("expiresAt", c.getExpiresAt().toString());
        return map;
    }

    private int toInt(Object val) {
        if (val instanceof Integer i) return i;
        if (val instanceof Double d) return d.intValue();
        if (val instanceof String s) { try { return Integer.parseInt(s); } catch (Exception e) { return 0; } }
        return 0;
    }

    private String toJson(Object list) {
        try { return objectMapper.writeValueAsString(list); }
        catch (Exception e) { return "[]"; }
    }

    private List<String> fromJson(String json) {
        try { return objectMapper.readValue(json, new TypeReference<List<String>>() {}); }
        catch (Exception e) { return new ArrayList<>(); }
    }
}