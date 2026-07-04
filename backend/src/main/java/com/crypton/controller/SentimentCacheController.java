package com.crypton.controller;

import com.crypton.service.SentimentCacheService;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/sentiment")
public class SentimentCacheController {

    private final SentimentCacheService cacheService;

    public SentimentCacheController(SentimentCacheService cacheService) {
        this.cacheService = cacheService;
    }

    // GET /api/sentiment/{ticker} — get cached AI sentiment for a coin
    @GetMapping("/{ticker}")
    public Map<String, Object> getSentiment(@PathVariable String ticker) {
        Optional<Map<String, Object>> cached = cacheService.getCachedSentiment(ticker);
        if (cached.isPresent()) {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", true);
            response.put("cached", true);
            response.put("data", cached.get());
            return response;
        }
        return Map.of("success", false, "cached", false);
    }

    // POST /api/sentiment/{ticker} — save AI sentiment result to database
    @PostMapping("/{ticker}")
    public Map<String, Object> saveSentiment(
        @PathVariable String ticker,
        @RequestBody Map<String, Object> body
    ) {
        String coinName = (String) body.getOrDefault("coinName", ticker);
        Map<String, Object> saved = cacheService.saveSentiment(ticker, coinName, body);
        return Map.of("success", true, "data", saved);
    }

    // GET /api/sentiment — get all cached sentiments
    @GetMapping
    public Map<String, Object> getAllSentiments() {
        return Map.of("success", true, "data", cacheService.getAllCached());
    }
}