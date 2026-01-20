package com.coim.currency.service;

import com.coim.currency.client.CurrencyBeaconClient;
import com.coim.currency.client.RateQuote;
import com.coim.currency.dto.ConvertRequest;
import com.coim.currency.dto.ConvertResponse;
import com.coim.currency.entity.ConversionRateEntity;
import com.coim.currency.repository.ConversionRateRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class ConversionService {

    private static final long CACHE_TTL_MINUTES = 60;

    private final ConversionRateRepository repository;
    private final CurrencyBeaconClient client;
    private final CurrencyCodeService currencyCodeService;

    public ConversionService(
            ConversionRateRepository repository,
            CurrencyBeaconClient client,
            CurrencyCodeService currencyCodeService
    ) {
        this.repository = repository;
        this.client = client;
        this.currencyCodeService = currencyCodeService;
    }

    public ConvertResponse convert(ConvertRequest request) {
        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new IllegalArgumentException("Amount must be a positive whole number");
        }

        String source = normalizeCode(request.getSourceCurrency());
        String target = normalizeCode(request.getTargetCurrency());

        if (!currencyCodeService.isSupported(source) || !currencyCodeService.isSupported(target)) {
            throw new IllegalArgumentException("Unsupported currency code");
        }

        LocalDateTime now = LocalDateTime.now();
        Optional<ConversionRateEntity> existing = repository.findBySourceCurrencyAndTargetCurrency(source, target);

        boolean fromCache = false;
        BigDecimal rate;
        LocalDateTime fetchedAt;

        if (existing.isPresent() && isFresh(existing.get().getFetchedAt(), now)) {
            ConversionRateEntity entity = existing.get();
            rate = entity.getRate();
            fetchedAt = entity.getFetchedAt();
            fromCache = true;
        } else {
            RateQuote quote = client.fetchRate(source, target);
            rate = quote.rate();
            fetchedAt = quote.fetchedAt();
            ConversionRateEntity entity = existing.orElseGet(ConversionRateEntity::new);
            entity.setSourceCurrency(source);
            entity.setTargetCurrency(target);
            entity.setRate(rate);
            entity.setFetchedAt(fetchedAt);
            repository.save(entity);
        }

        BigDecimal amount = BigDecimal.valueOf(request.getAmount());
        BigDecimal convertedAmount = rate.multiply(amount).setScale(2, RoundingMode.HALF_UP);

        return new ConvertResponse(
                source,
                target,
                request.getAmount(),
                rate,
                convertedAmount,
                fromCache,
                fetchedAt
        );
    }

    private boolean isFresh(LocalDateTime fetchedAt, LocalDateTime now) {
        if (fetchedAt == null) {
            return false;
        }
        return Duration.between(fetchedAt, now).toMinutes() < CACHE_TTL_MINUTES;
    }

    private String normalizeCode(String code) {
        if (code == null) {
            return "";
        }
        return code.trim().toUpperCase();
    }
}
