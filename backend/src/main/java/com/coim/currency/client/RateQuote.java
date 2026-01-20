package com.coim.currency.client;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RateQuote(BigDecimal rate, LocalDateTime fetchedAt) {
}
