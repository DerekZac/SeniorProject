package com.crypton.repository;

import com.crypton.model.CoinSentimentCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CoinSentimentCacheRepository extends JpaRepository<CoinSentimentCache, Long> {
    Optional<CoinSentimentCache> findByTickerIgnoreCase(String ticker);
}