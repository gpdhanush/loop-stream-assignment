package com.coim.currency.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ConvertResponse {

    private String sourceCurrency;
    private String targetCurrency;
    private Integer amount;
    private BigDecimal rate;
    private BigDecimal convertedAmount;
    private boolean fromCache;
    private LocalDateTime fetchedAt;

    public ConvertResponse() {
    }

    public ConvertResponse(
            String sourceCurrency,
            String targetCurrency,
            Integer amount,
            BigDecimal rate,
            BigDecimal convertedAmount,
            boolean fromCache,
            LocalDateTime fetchedAt
    ) {
        this.sourceCurrency = sourceCurrency;
        this.targetCurrency = targetCurrency;
        this.amount = amount;
        this.rate = rate;
        this.convertedAmount = convertedAmount;
        this.fromCache = fromCache;
        this.fetchedAt = fetchedAt;
    }

    public String getSourceCurrency() {
        return sourceCurrency;
    }

    public void setSourceCurrency(String sourceCurrency) {
        this.sourceCurrency = sourceCurrency;
    }

    public String getTargetCurrency() {
        return targetCurrency;
    }

    public void setTargetCurrency(String targetCurrency) {
        this.targetCurrency = targetCurrency;
    }

    public Integer getAmount() {
        return amount;
    }

    public void setAmount(Integer amount) {
        this.amount = amount;
    }

    public BigDecimal getRate() {
        return rate;
    }

    public void setRate(BigDecimal rate) {
        this.rate = rate;
    }

    public BigDecimal getConvertedAmount() {
        return convertedAmount;
    }

    public void setConvertedAmount(BigDecimal convertedAmount) {
        this.convertedAmount = convertedAmount;
    }

    public boolean isFromCache() {
        return fromCache;
    }

    public void setFromCache(boolean fromCache) {
        this.fromCache = fromCache;
    }

    public LocalDateTime getFetchedAt() {
        return fetchedAt;
    }

    public void setFetchedAt(LocalDateTime fetchedAt) {
        this.fetchedAt = fetchedAt;
    }
}
