package com.coim.currency.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

public class LatestRatesResponse {

    private String base;
    private Map<String, BigDecimal> rates;
    private LocalDateTime fetchedAt;

    public LatestRatesResponse() {
    }

    public LatestRatesResponse(String base, Map<String, BigDecimal> rates, LocalDateTime fetchedAt) {
        this.base = base;
        this.rates = rates;
        this.fetchedAt = fetchedAt;
    }

    public String getBase() {
        return base;
    }

    public void setBase(String base) {
        this.base = base;
    }

    public Map<String, BigDecimal> getRates() {
        return rates;
    }

    public void setRates(Map<String, BigDecimal> rates) {
        this.rates = rates;
    }

    public LocalDateTime getFetchedAt() {
        return fetchedAt;
    }

    public void setFetchedAt(LocalDateTime fetchedAt) {
        this.fetchedAt = fetchedAt;
    }
}
