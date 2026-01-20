package main.java.com.coim.currency.controller;

import com.coim.currency.client.CurrencyBeaconClient;
import com.coim.currency.client.LatestRatesQuote;
import com.coim.currency.dto.CurrencyInfo;
import com.coim.currency.dto.LatestRatesResponse;
import com.coim.currency.service.CurrencyCodeService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CurrencyDataController {

    private final CurrencyCodeService currencyCodeService;
    private final CurrencyBeaconClient currencyBeaconClient;

    public CurrencyDataController(
            CurrencyCodeService currencyCodeService,
            CurrencyBeaconClient currencyBeaconClient
    ) {
        this.currencyCodeService = currencyCodeService;
        this.currencyBeaconClient = currencyBeaconClient;
    }

    @GetMapping("/currencies")
    public ResponseEntity<List<CurrencyInfo>> currencies() {
        return ResponseEntity.ok(currencyCodeService.getCurrencyCodes());
    }

    @GetMapping("/latest")
    public ResponseEntity<LatestRatesResponse> latest(@RequestParam(defaultValue = "USD") String base) {
        LatestRatesQuote quote = currencyBeaconClient.fetchLatest(base.trim().toUpperCase());
        return ResponseEntity.ok(new LatestRatesResponse(quote.base(), quote.rates(), quote.fetchedAt()));
    }
}