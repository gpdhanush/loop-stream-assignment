package com.coim.currency.client;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class CurrencyBeaconClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String apiKey;

    public CurrencyBeaconClient(
            RestTemplate restTemplate,
            @Value("${currencybeacon.api.base-url}") String baseUrl,
            @Value("${currencybeacon.api.key}") String apiKey
    ) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    public RateQuote fetchRate(String baseCurrency, String targetCurrency) {
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .path("/latest")
                .queryParam("api_key", apiKey)
                .queryParam("base", baseCurrency)
                .queryParam("symbols", targetCurrency)
                .toUriString();

        CurrencyBeaconResponse response = restTemplate.getForObject(url, CurrencyBeaconResponse.class);
        if (response == null || response.getResponse() == null) {
            throw new IllegalStateException("CurrencyBeacon response is empty");
        }

        Map<String, BigDecimal> rates = response.getResponse().getRates();
        if (rates == null || !rates.containsKey(targetCurrency)) {
            throw new IllegalStateException("CurrencyBeacon response missing rate for " + targetCurrency);
        }

        BigDecimal rate = rates.get(targetCurrency);
        LocalDateTime fetchedAt = LocalDateTime.now();
        return new RateQuote(rate, fetchedAt);
    }
}
