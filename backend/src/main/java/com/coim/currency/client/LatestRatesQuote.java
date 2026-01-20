package com.coim.currency.client;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

public record LatestRatesQuote(String base, Map<String, BigDecimal> rates, LocalDateTime fetchedAt) {
}
