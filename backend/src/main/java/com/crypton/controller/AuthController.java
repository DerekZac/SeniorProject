package com.crypton.controller;

import com.crypton.service.AuthService;
import com.crypton.service.MfaService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final MfaService mfaService;

    public AuthController(AuthService authService, MfaService mfaService) {
        this.authService = authService;
        this.mfaService = mfaService;
    }

    // GET /api/auth/health
    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("status", "ok", "service", "auth");
    }

    // GET /api/auth/mfa/setup/{username}
    // Generates a new MFA secret and QR code for setup
    @GetMapping("/mfa/setup/{username}")
    public Map<String, String> getMfaSetup(@PathVariable String username) {
        return authService.generateMfaSetup(username);
    }

    // POST /api/auth/register
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, String> body) {
        return authService.register(
            body.get("username"),
            body.get("email"),
            body.get("password"),
            body.get("mfaSecret"),
            body.get("mfaToken")
        );
    }

    // POST /api/auth/login/step1 — verify username and password
    @PostMapping("/login/step1")
    public Map<String, Object> loginStep1(@RequestBody Map<String, String> body) {
        return authService.loginStep1(
            body.get("username"),
            body.get("password")
        );
    }

    // POST /api/auth/login/step2 — verify MFA code
    @PostMapping("/login/step2")
    public Map<String, Object> loginStep2(@RequestBody Map<String, String> body) {
        return authService.loginStep2(
            body.get("username"),
            body.get("mfaToken")
        );
    }

    // POST /api/auth/reset-password
    @PostMapping("/reset-password")
    public Map<String, Object> resetPassword(@RequestBody Map<String, String> body) {
        return authService.resetPassword(
            body.get("username"),
            body.get("newPassword"),
            body.get("mfaToken")
        );
    }

    // GET /api/auth/watchlist/{username}
    @GetMapping("/watchlist/{username}")
    public Map<String, Object> getWatchlist(@PathVariable String username) {
        return authService.getWatchlist(username);
    }

    // POST /api/auth/watchlist/{username}
    @PostMapping("/watchlist/{username}")
    public Map<String, Object> updateWatchlist(
        @PathVariable String username,
        @RequestBody Map<String, List<String>> body
    ) {
        return authService.updateWatchlist(username, body.get("coins"));
    }
}
