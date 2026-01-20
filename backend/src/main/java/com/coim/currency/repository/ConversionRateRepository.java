package com.coim.currency.repository;

import com.coim.currency.entity.ConversionRateEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConversionRateRepository extends JpaRepository<ConversionRateEntity, Long> {
    Optional<ConversionRateEntity> findBySourceCurrencyAndTargetCurrency(String sourceCurrency, String targetCurrency);
}
