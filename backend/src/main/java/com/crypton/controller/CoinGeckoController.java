package com.crypton.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.concurrent.ConcurrentHashMap;

/**
 * Server-side proxy for the public CoinGecko API.
 *
 * The browser cannot call https://api.coingecko.com directly from the GitHub
 * Pages site because CoinGecko does not send CORS headers for that origin.
 * These endpoints forward the requests server-to-server and relay the JSON
 * response back, so the frontend only ever talks to our own (CORS-allowed) API.
 *
 * Responses are cached in memory for 60 seconds, keyed by the full upstream
 * URL (which includes all query params). This cuts repeated calls to
 * CoinGecko's rate-limited free tier when many clients request the same data.
 */
@RestController
@RequestMapping("/api/coingecko")
public class CoinGeckoController {

    private static final String GECKO_BASE = "https://api.coingecko.com/api/v3";
    private static final long CACHE_TTL_MS = 60_000L;

    private final RestTemplate restTemplate = new RestTemplate();

    /** A cached upstream response together with the time it was stored. */
    private record CachedResponse(ResponseEntity<String> response, long storedAt) {
        boolean isFresh(long now) {
            return now - storedAt < CACHE_TTL_MS;
        }
    }

    private final ConcurrentHashMap<String, CachedResponse> cache = new ConcurrentHashMap<>();

    // GET /api/coingecko/markets -> /coins/markets (all query params forwarded)
    @GetMapping("/markets")
    public ResponseEntity<String> markets(HttpServletRequest request) {
        return forward(GECKO_BASE + "/coins/markets", request.getQueryString());
    }

    // GET /api/coingecko/market_chart/{id} -> /coins/{id}/market_chart (all query params forwarded)
    @GetMapping("/market_chart/{id}")
    public ResponseEntity<String> marketChart(@PathVariable String id, HttpServletRequest request) {
        return forward(GECKO_BASE + "/coins/" + id + "/market_chart", request.getQueryString());
    }

    // GET /api/coingecko/search -> /search (all query params forwarded)
    @GetMapping("/search")
    public ResponseEntity<String> search(HttpServletRequest request) {
        return forward(GECKO_BASE + "/search", request.getQueryString());
    }

    private ResponseEntity<String> forward(String baseUrl, String queryString) {
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .query(queryString)
                .build(true)
                .toUriString();

        // Serve from cache if we fetched this exact URL less than 60 seconds ago.
        long now = System.currentTimeMillis();
        CachedResponse cached = cache.get(url);
        if (cached != null && cached.isFresh(now)) {
            return cached.response();
        }

        try {
            ResponseEntity<String> upstream = restTemplate.getForEntity(url, String.class);
            ResponseEntity<String> response = ResponseEntity.status(upstream.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(upstream.getBody());
            // Only cache successful responses so errors (429, 5xx) can retry immediately.
            cache.put(url, new CachedResponse(response, now));
            return response;
        } catch (RestClientResponseException e) {
            // Relay CoinGecko's own error status/body (e.g. 404, 429 rate limit).
            return ResponseEntity.status(e.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(e.getResponseBodyAsString());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"Failed to reach CoinGecko\"}");
        }
    }
}
