package com.crypton.service;

import dev.samstevens.totp.code.*;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class MfaService {

    private final DefaultSecretGenerator secretGenerator = new DefaultSecretGenerator();

    // Generate a new MFA secret
    public String generateSecret() {
        return secretGenerator.generate();
    }

    // Generate QR code data URI for authenticator app
    public Map<String, String> generateSetup(String username, String secret) {
        QrData data = new QrData.Builder()
            .label(username)
            .secret(secret)
            .issuer("Crypton")
            .algorithm(HashingAlgorithm.SHA1)
            .digits(6)
            .period(30)
            .build();

        Map<String, String> result = new LinkedHashMap<>();
        result.put("secret", secret);
        result.put("uri", data.getUri());

        try {
            ZxingPngQrGenerator generator = new ZxingPngQrGenerator();
            byte[] imageData = generator.generate(data);
            String qrCodeBase64 = "data:image/png;base64," + Base64.getEncoder().encodeToString(imageData);
            result.put("qrCode", qrCodeBase64);
        } catch (QrGenerationException e) {
            result.put("qrCode", "");
        }

        return result;
    }

    // Verify a TOTP code
    public boolean verifyCode(String secret, String code) {
        if (secret == null || code == null || code.length() != 6) return false;
        try {
            CodeVerifier verifier = new DefaultCodeVerifier(
                new DefaultCodeGenerator(HashingAlgorithm.SHA1),
                new SystemTimeProvider()
            );
            return verifier.isValidCode(secret, code);
        } catch (Exception e) {
            return false;
        }
    }
}
