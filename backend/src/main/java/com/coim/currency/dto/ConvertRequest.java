package com.coim.currency.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public class ConvertRequest {

    @NotBlank
    @Pattern(regexp = "^[A-Z]{3}$", message = "sourceCurrency must be a 3-letter code")
    private String sourceCurrency;

    @NotBlank
    @Pattern(regexp = "^[A-Z]{3}$", message = "targetCurrency must be a 3-letter code")
    private String targetCurrency;

    @NotNull
    @Positive(message = "amount must be a positive whole number")
    private Integer amount;

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
}
