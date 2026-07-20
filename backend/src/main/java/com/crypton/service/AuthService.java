package com.crypton.service;

import com.crypton.model.User;
import com.crypton.repository.UserRepository;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final MfaService mfaService;

    private static final int ITERATIONS   = 100_000;
    private static final int KEY_LENGTH   = 256;
    private static final int SALT_BYTES   = 16;
    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCKOUT_MINS = 15;

    public AuthService(UserRepository userRepository, MfaService mfaService) {
        this.userRepository = userRepository;
        this.mfaService = mfaService;
    }

    // ── PBKDF2 password hashing ──────────────────────────────────────────────

    private String generateSalt() {
        byte[] salt = new byte[SALT_BYTES];
        new SecureRandom().nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    private String hashPassword(String password, String saltBase64) {
        try {
            byte[] salt = Base64.getDecoder().decode(saltBase64);
            PBEKeySpec spec = new PBEKeySpec(
                password.toCharArray(), salt, ITERATIONS, KEY_LENGTH
            );
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] hash = factory.generateSecret(spec).getEncoded();
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Password hashing failed", e);
        }
    }

    private boolean verifyPassword(String password, String hash, String salt) {
        return hashPassword(password, salt).equals(hash);
    }

    // ── MFA Setup ────────────────────────────────────────────────────────────

    public Map<String, String> generateMfaSetup(String username) {
        String secret = mfaService.generateSecret();
        return mfaService.generateSetup(username, secret);
    }

    // ── Register ─────────────────────────────────────────────────────────────

    public Map<String, Object> register(String username, String email, String password, String mfaSecret, String mfaToken) {
        Map<String, Object> response = new LinkedHashMap<>();

        // Validate
        if (username == null || !username.matches("^[a-zA-Z0-9_]{3,20}$")) {
            response.put("success", false);
            response.put("message", "Username must be 3-20 characters (letters, numbers, underscores)");
            return response;
        }
        if (password == null || password.length() < 8) {
            response.put("success", false);
            response.put("message", "Password must be at least 8 characters");
            return response;
        }
        if (userRepository.existsByUsername(username)) {
            response.put("success", false);
            response.put("message", "Username already taken");
            return response;
        }
        if (email != null && !email.isEmpty() && userRepository.existsByEmail(email)) {
            response.put("success", false);
            response.put("message", "Email already in use");
            return response;
        }

        // Verify MFA token
        if (!mfaService.verifyCode(mfaSecret, mfaToken)) {
            response.put("success", false);
            response.put("message", "Invalid authenticator code. Make sure your app clock is synced.");
            return response;
        }

        // Hash password
        String salt = generateSalt();
        String hash = hashPassword(password, salt);

        User user = new User(username, hash, salt, email, mfaSecret);
        userRepository.save(user);

        response.put("success", true);
        response.put("message", "Account created successfully");
        response.put("user", Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "email", user.getEmail() != null ? user.getEmail() : "",
            "mfaEnabled", user.isMfaEnabled(),
            "createdAt", user.getCreatedAt().toString()
        ));
        return response;
    }

    // ── Login Step 1 — credentials ───────────────────────────────────────────

    public Map<String, Object> loginStep1(String username, String password) {
        Map<String, Object> response = new LinkedHashMap<>();
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Invalid username or password");
            return response;
        }

        User user = userOpt.get();

        // Check rate limit
        if (user.getLockedUntil() != null && LocalDateTime.now().isBefore(user.getLockedUntil())) {
            long minutesLeft = java.time.Duration.between(LocalDateTime.now(), user.getLockedUntil()).toMinutes() + 1;
            response.put("success", false);
            response.put("message", "Account locked. Try again in " + minutesLeft + " minute(s).");
            return response;
        }

        if (!verifyPassword(password, user.getPasswordHash(), user.getPasswordSalt())) {
            user.setFailedAttempts(user.getFailedAttempts() + 1);
            int remaining = MAX_ATTEMPTS - user.getFailedAttempts();

            if (user.getFailedAttempts() >= MAX_ATTEMPTS) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCKOUT_MINS));
                user.setFailedAttempts(0);
                userRepository.save(user);
                response.put("success", false);
                response.put("message", "Account locked for 15 minutes due to too many failed attempts.");
                return response;
            }

            userRepository.save(user);
            response.put("success", false);
            response.put("message", remaining > 0
                ? "Invalid credentials. " + remaining + " attempt(s) remaining."
                : "Invalid username or password");
            return response;
        }

        // Reset failed attempts on success
        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        response.put("success", true);
        response.put("message", "Credentials verified");
        response.put("requiresMfa", user.isMfaEnabled());
        response.put("username", user.getUsername());
        return response;
    }

    // ── Login Step 2 — MFA ───────────────────────────────────────────────────

    public Map<String, Object> loginStep2(String username, String mfaToken) {
        Map<String, Object> response = new LinkedHashMap<>();
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "User not found");
            return response;
        }

        User user = userOpt.get();

        // Brute-force protection: the MFA code is only 6 digits, so throttle
        // attempts with the same lockout used for passwords in step 1.
        if (user.getLockedUntil() != null && LocalDateTime.now().isBefore(user.getLockedUntil())) {
            long minutesLeft = java.time.Duration.between(LocalDateTime.now(), user.getLockedUntil()).toMinutes() + 1;
            response.put("success", false);
            response.put("message", "Account locked. Try again in " + minutesLeft + " minute(s).");
            return response;
        }

        if (!mfaService.verifyCode(user.getMfaSecret(), mfaToken)) {
            user.setFailedAttempts(user.getFailedAttempts() + 1);
            if (user.getFailedAttempts() >= MAX_ATTEMPTS) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCKOUT_MINS));
                user.setFailedAttempts(0);
                userRepository.save(user);
                response.put("success", false);
                response.put("message", "Account locked for 15 minutes due to too many invalid codes.");
                return response;
            }
            userRepository.save(user);
            int remaining = MAX_ATTEMPTS - user.getFailedAttempts();
            response.put("success", false);
            response.put("message", remaining > 0
                ? "Invalid authenticator code. " + remaining + " attempt(s) remaining."
                : "Invalid authenticator code. Check your app and try again.");
            return response;
        }

        // Reset the counter on a successful code.
        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        response.put("success", true);
        response.put("message", "Login successful");
        response.put("user", Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "email", user.getEmail() != null ? user.getEmail() : "",
            "mfaEnabled", user.isMfaEnabled(),
            "watchlist", user.getWatchlist() != null ? user.getWatchlist() : "",
            "createdAt", user.getCreatedAt().toString()
        ));
        return response;
    }

    // ── Reset Password ───────────────────────────────────────────────────────

    public Map<String, Object> resetPassword(String username, String newPassword, String mfaToken) {
        Map<String, Object> response = new LinkedHashMap<>();
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "No account found for that username");
            return response;
        }

        User user = userOpt.get();

        if (newPassword == null || newPassword.length() < 8) {
            response.put("success", false);
            response.put("message", "Password must be at least 8 characters");
            return response;
        }

        // Reset requires a valid MFA code — throttle it like login step 2 so the
        // 6-digit code can't be brute-forced into an account takeover.
        if (user.isMfaEnabled()) {
            if (user.getLockedUntil() != null && LocalDateTime.now().isBefore(user.getLockedUntil())) {
                long minutesLeft = java.time.Duration.between(LocalDateTime.now(), user.getLockedUntil()).toMinutes() + 1;
                response.put("success", false);
                response.put("message", "Account locked. Try again in " + minutesLeft + " minute(s).");
                return response;
            }
            if (!mfaService.verifyCode(user.getMfaSecret(), mfaToken)) {
                user.setFailedAttempts(user.getFailedAttempts() + 1);
                if (user.getFailedAttempts() >= MAX_ATTEMPTS) {
                    user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCKOUT_MINS));
                    user.setFailedAttempts(0);
                }
                userRepository.save(user);
                response.put("success", false);
                response.put("message", "Invalid authenticator code");
                return response;
            }
            user.setFailedAttempts(0);
            user.setLockedUntil(null);
        }

        String salt = generateSalt();
        String hash = hashPassword(newPassword, salt);
        user.setPasswordHash(hash);
        user.setPasswordSalt(salt);
        userRepository.save(user);

        response.put("success", true);
        response.put("message", "Password updated successfully");
        return response;
    }

    // ── Watchlist ────────────────────────────────────────────────────────────

    public Map<String, Object> getWatchlist(String username) {
        Map<String, Object> response = new LinkedHashMap<>();
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "User not found");
            return response;
        }

        String watchlist = userOpt.get().getWatchlist();
        List<String> coins = watchlist == null || watchlist.isEmpty()
            ? new ArrayList<>()
            : Arrays.asList(watchlist.split(","));

        response.put("success", true);
        response.put("watchlist", coins);
        return response;
    }

    public Map<String, Object> updateWatchlist(String username, List<String> coins) {
        Map<String, Object> response = new LinkedHashMap<>();
        Optional<User> userOpt = userRepository.findByUsername(username);

        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "User not found");
            return response;
        }

        User user = userOpt.get();
        user.setWatchlist(coins == null ? "" : String.join(",", coins));
        userRepository.save(user);

        response.put("success", true);
        response.put("watchlist", coins);
        return response;
    }
}
