package com.coim.currency.controller;

import com.coim.currency.service.CurrencyCodeService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    private final CurrencyCodeService currencyCodeService;

    public PageController(CurrencyCodeService currencyCodeService) {
        this.currencyCodeService = currencyCodeService;
    }

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("currencyCodes", currencyCodeService.getCurrencyCodes());
        return "index";
    }
}
