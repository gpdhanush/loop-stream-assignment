package com.coim.currency.service;

import com.coim.currency.dto.CurrencyInfo;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.Currency;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

@Component
public class CurrencyCodeService {

    private final ObjectMapper objectMapper;
    private final ResourceLoader resourceLoader;
    private List<CurrencyInfo> currencyCodes;
    private Set<String> supportedCodes;

    public CurrencyCodeService(ObjectMapper objectMapper, ResourceLoader resourceLoader) {
        this.objectMapper = objectMapper;
        this.resourceLoader = resourceLoader;
    }

    @PostConstruct
    public void load() {
        Resource resource = resourceLoader.getResource("classpath:currency_codes.json");
        try (InputStream inputStream = resource.getInputStream()) {
            List<String> rawCodes = objectMapper.readValue(inputStream, new TypeReference<>() {});
            Set<String> filtered = rawCodes.stream()
                    .filter(code -> code != null && !code.isBlank())
                    .map(code -> code.trim().toUpperCase())
                    .filter(code -> code.matches("^[A-Z]{3}$"))
                    .collect(Collectors.toCollection(TreeSet::new));
            supportedCodes = Set.copyOf(filtered);
            currencyCodes = filtered.stream()
                    .map(code -> new CurrencyInfo(code, resolveName(code), resolveFlag(code)))
                    .toList();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load currency_codes.json", e);
        }
    }

    public List<CurrencyInfo> getCurrencyCodes() {
        return currencyCodes;
    }

    public boolean isSupported(String code) {
        if (code == null) {
            return false;
        }
        return supportedCodes.contains(code.trim().toUpperCase());
    }

    private String resolveName(String code) {
        try {
            Currency currency = Currency.getInstance(code);
            return currency.getDisplayName(Locale.ENGLISH);
        } catch (IllegalArgumentException ex) {
            return code;
        }
    }

    private String resolveFlag(String code) {
        if ("EUR".equals(code)) {
            return "🇪🇺";
        }
        if (code.startsWith("X")) {
            return "🏳️";
        }
        String country = code.substring(0, 2);
        if (!country.matches("^[A-Z]{2}$")) {
            return "🏳️";
        }
        return flagFromCountryCode(country);
    }

    private String flagFromCountryCode(String countryCode) {
        int base = 0x1F1E6;
        int first = base + (countryCode.charAt(0) - 'A');
        int second = base + (countryCode.charAt(1) - 'A');
        return new String(Character.toChars(first)) + new String(Character.toChars(second));
    }
}
