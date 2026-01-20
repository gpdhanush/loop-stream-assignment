package com.coim.currency.dto;

public class CurrencyInfo {

    private final String code;
    private final String name;
    private final String flag;

    public CurrencyInfo(String code, String name, String flag) {
        this.code = code;
        this.name = name;
        this.flag = flag;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getFlag() {
        return flag;
    }
}
