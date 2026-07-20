package com.crypton.controller;

import com.crypton.service.SentimentCacheService;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/sentiment-cache")
public class SentimentCacheTopController {

    private final SentimentCacheService cacheService;

    public SentimentCacheTopController(SentimentCacheService cacheService) {
        this.cacheService = cacheService;
    }

    // GET /api/sentiment-cache/top — cached coin with the highest market_score
    @GetMapping("/top")
    public Map<String, Object> getTopCoin() {
        Optional<Map<String, Object>> top = cacheService.getTopByMarketScore();

        if (top.isPresent()) {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", true);
            response.put("data", top.get());
            return response;
        }

        return Map.of("success", false);
    }
}
