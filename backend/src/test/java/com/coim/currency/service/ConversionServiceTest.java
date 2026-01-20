package com.coim.currency.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.coim.currency.client.CurrencyBeaconClient;
import com.coim.currency.client.RateQuote;
import com.coim.currency.dto.ConvertRequest;
import com.coim.currency.dto.ConvertResponse;
import com.coim.currency.entity.ConversionRateEntity;
import com.coim.currency.repository.ConversionRateRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ConversionServiceTest {

    @Mock
    private ConversionRateRepository repository;

    @Mock
    private CurrencyBeaconClient client;

    @Mock
    private CurrencyCodeService currencyCodeService;

    @InjectMocks
    private ConversionService service;

    @Test
    void usesCachedRateWhenFresh() {
        ConvertRequest request = new ConvertRequest();
        request.setSourceCurrency("USD");
        request.setTargetCurrency("INR");
        request.setAmount(10);

        ConversionRateEntity entity = new ConversionRateEntity();
        entity.setSourceCurrency("USD");
        entity.setTargetCurrency("INR");
        entity.setRate(new BigDecimal("83.12"));
        entity.setFetchedAt(LocalDateTime.now().minusMinutes(30));

        when(currencyCodeService.isSupported("USD")).thenReturn(true);
        when(currencyCodeService.isSupported("INR")).thenReturn(true);
        when(repository.findBySourceCurrencyAndTargetCurrency("USD", "INR")).thenReturn(Optional.of(entity));

        ConvertResponse response = service.convert(request);

        assertEquals(true, response.isFromCache());
        assertEquals(new BigDecimal("83.12"), response.getRate());
        verify(client, never()).fetchRate(any(), any());
    }

    @Test
    void callsApiWhenCacheIsStale() {
        ConvertRequest request = new ConvertRequest();
        request.setSourceCurrency("USD");
        request.setTargetCurrency("INR");
        request.setAmount(10);

        ConversionRateEntity entity = new ConversionRateEntity();
        entity.setSourceCurrency("USD");
        entity.setTargetCurrency("INR");
        entity.setRate(new BigDecimal("83.12"));
        entity.setFetchedAt(LocalDateTime.now().minusMinutes(90));

        RateQuote quote = new RateQuote(new BigDecimal("84.55"), LocalDateTime.now());

        when(currencyCodeService.isSupported("USD")).thenReturn(true);
        when(currencyCodeService.isSupported("INR")).thenReturn(true);
        when(repository.findBySourceCurrencyAndTargetCurrency("USD", "INR")).thenReturn(Optional.of(entity));
        when(client.fetchRate("USD", "INR")).thenReturn(quote);

        ConvertResponse response = service.convert(request);

        assertEquals(false, response.isFromCache());
        assertEquals(new BigDecimal("84.55"), response.getRate());
        verify(repository).save(entity);
    }

    @Test
    void negativeAmountThrowsError() {
        ConvertRequest request = new ConvertRequest();
        request.setSourceCurrency("USD");
        request.setTargetCurrency("INR");
        request.setAmount(-5);

        assertThrows(IllegalArgumentException.class, () -> service.convert(request));
        verify(repository, never()).findBySourceCurrencyAndTargetCurrency(any(), any());
        verify(client, never()).fetchRate(any(), any());
    }
}
