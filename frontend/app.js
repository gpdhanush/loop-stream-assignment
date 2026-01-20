const { createApp } = Vue;

createApp({
  data() {
    return {
      API_KEY: "1SMxQumaAcC996SUXGsnlBPW44t2RR82",
      BASE_URL: "https://api.currencybeacon.com/v1",

      // Section 1
      amount: 100,
      fromCurrency: "GBP",
      toCurrency: "INR",
      convertedAmount: 0,
      exchangeRate: 0,
      convertLoading: false,
      convertError: "",

      // currencies dropdown list
      currencyList: [],
      fromSearch: "",
      toSearch: "",
      showFromDropdown: false,
      showToDropdown: false,

      // Section 2
      latestRates: [],
      latestBase: "",
      latestLoading: false,
      latestError: "",
      sortBy: "currency",
      sortOrder: "asc",
      latestSearch: "",
      showPopularOnly: false,
      popularCodes: [
        "USD",
        "EUR",
        "GBP",
        "AUD",
        "CAD",
        "NZD",
        "JPY",
        "CNY",
        "INR",
        "KRW",
        "SGD",
        "HKD",
        "CHF",
        "SEK",
        "NOK",
        "DKK",
        "AED",
        "SAR",
        "ZAR",
        "BRL",
      ],

      // debounce timer
      debounceTimer: null,
      reverseDebounceTimer: null,
      latestIntervalId: null,
      convertedInput: "",
      activeInput: "amount",
    };
  },

  computed: {
    isGlobalLoading() {
      return this.currencyList.length === 0;
    },
    amountErrorMessage() {
      if (this.amount === "" || this.amount === null || this.amount === undefined) {
        return "Amount is required.";
      }
      return "";
    },

    convertedErrorMessage() {
      if (
        this.convertedInput === "" ||
        this.convertedInput === null ||
        this.convertedInput === undefined
      ) {
        return "Converted amount is required.";
      }
      return "";
    },
    pageTitle() {
      const amountValue =
        this.amount && Number(this.amount) > 0 ? Number(this.amount) : 1;
      const from = this.currencyList.find((c) => c.code === this.fromCurrency);
      const to = this.currencyList.find((c) => c.code === this.toCurrency);
      const fromName = from?.name || this.fromCurrency;
      const toName = to?.name || this.toCurrency;
      const amountLabel = amountValue.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });
      return `${amountLabel} ${fromName} to ${toName} Exchange Rate. Convert ${this.fromCurrency}/${this.toCurrency}`;
    },
    formattedConvertedAmount() {
      if (!this.convertedAmount && this.convertedAmount !== 0) return "-";
      return Number(this.convertedAmount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },

    formattedRate() {
      if (!this.exchangeRate) return "-";
      return Number(this.exchangeRate).toLocaleString(undefined, {
        minimumFractionDigits: 4,
        maximumFractionDigits: 6,
      });
    },

    selectedFromCurrency() {
      return this.currencyList.find((c) => c.code === this.fromCurrency) || {};
    },

    selectedToCurrency() {
      return this.currencyList.find((c) => c.code === this.toCurrency) || {};
    },

    filteredLatestRates() {
      const text = this.latestSearch.trim().toLowerCase();
      let rows = text
        ? this.latestRates.filter((r) => {
            const code = (r.code || "").toLowerCase();
            const name = (r.name || "").toLowerCase();
            return code.includes(text) || name.includes(text);
          })
        : this.latestRates;

      if (this.showPopularOnly) {
        const popularSet = new Set(this.popularCodes);
        rows = rows.filter((r) => popularSet.has(r.code));
      }

      return this.sortRates(rows);
    },

    filteredCurrencyListFrom() {
      const text = this.fromSearch.trim().toLowerCase();
      if (!text) return this.currencyList;
      return this.currencyList.filter((c) => {
        const code = (c.code || "").toLowerCase();
        const name = (c.name || "").toLowerCase();
        return code.includes(text) || name.includes(text);
      });
    },

    filteredCurrencyListTo() {
      const text = this.toSearch.trim().toLowerCase();
      if (!text) return this.currencyList;
      return this.currencyList.filter((c) => {
        const code = (c.code || "").toLowerCase();
        const name = (c.name || "").toLowerCase();
        return code.includes(text) || name.includes(text);
      });
    },

  },

  methods: {
    updatePageTitle() {
      document.title = this.pageTitle;
    },
    sanitizeAmountInput(value) {
      let sanitized = value || "";
      sanitized = sanitized.replace(/[^0-9.]/g, "");

      const firstDot = sanitized.indexOf(".");
      if (firstDot !== -1) {
        const before = sanitized.slice(0, firstDot + 1);
        const after = sanitized.slice(firstDot + 1).replace(/\./g, "");
        sanitized = before + after;
      }

      if (sanitized.startsWith(".")) {
        sanitized = `0${sanitized}`;
      }

      const parts = sanitized.split(".");
      if (parts.length === 2) {
        parts[1] = parts[1].slice(0, 2);
        sanitized = `${parts[0]}.${parts[1]}`;
      }

      return sanitized;
    },

    formatInputValue(value) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return "";
      const rounded = Math.round(numeric * 100) / 100;
      return String(rounded).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
    },

    handleAmountInput(event) {
      let value = this.sanitizeAmountInput(event.target.value || "");

      if (value.startsWith("0") && !value.startsWith("0.") && value.length > 1) {
        value = value.replace(/^0+/, "");
        if (value === "") value = "0";
      }

      this.activeInput = "amount";
      this.amount = value;
      if (this.exchangeRate) {
        const converted = Number(value) * Number(this.exchangeRate);
        this.convertedAmount = Number.isFinite(converted) ? converted : 0;
        this.convertedInput = this.formatInputValue(this.convertedAmount);
        this.convertLoading = false;
      } else {
        this.debouncedConvert();
      }
    },

    handleConvertedInput(event) {
      let value = this.sanitizeAmountInput(event.target.value || "");

      if (value.startsWith("0") && !value.startsWith("0.") && value.length > 1) {
        value = value.replace(/^0+/, "");
        if (value === "") value = "0";
      }

      this.activeInput = "converted";
      this.convertedInput = value;
      if (this.exchangeRate) {
        const amountValue = Number(value) / Number(this.exchangeRate);
        this.amount = Number.isFinite(amountValue) ? this.formatInputValue(amountValue) : "";
        this.convertedAmount = Number(value) || 0;
        this.convertLoading = false;
      } else {
        this.debouncedReverseConvert();
      }
    },

    formatThousands(value) {
      if (value === "" || value === null || value === undefined) return "";
      const raw = String(value);
      if (raw === "-") return raw;
      const parts = raw.split(".");
      const integerPart = parts[0].replace(/\D/g, "");
      if (!integerPart) return raw;
      const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.length > 1 ? `${formatted}.${parts[1]}` : formatted;
    },

    debouncedReverseConvert() {
      clearTimeout(this.reverseDebounceTimer);
      this.reverseDebounceTimer = setTimeout(() => {
        this.convertReverse();
      }, 400);
    },
    sortRates(rows) {
      const items = [...rows];
      items.sort((a, b) => {
        let valA;
        let valB;
        if (this.sortBy === "rate") {
          valA = Number(a.rate);
          valB = Number(b.rate);
        } else {
          valA = (a.name || a.code || "").toUpperCase();
          valB = (b.name || b.code || "").toUpperCase();
        }

        if (valA < valB) return this.sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return this.sortOrder === "asc" ? 1 : -1;
        return 0;
      });
      return items;
    },
    getCurrencyFlagUrl(code) {
      const map = {
        USD: "us",
        EUR: "eu",
        GBP: "gb",
        AUD: "au",
        CAD: "ca",
        NZD: "nz",
        JPY: "jp",
        CNY: "cn",
        INR: "in",
        KRW: "kr",
        SGD: "sg",
        HKD: "hk",
        CHF: "ch",
        SEK: "se",
        NOK: "no",
        DKK: "dk",
        PLN: "pl",
        CZK: "cz",
        HUF: "hu",
        MXN: "mx",
        BRL: "br",
        ZAR: "za",
        AED: "ae",
        SAR: "sa",
        QAR: "qa",
        KWD: "kw",
        BHD: "bh",
        OMR: "om",
        THB: "th",
        MYR: "my",
        IDR: "id",
        PHP: "ph",
        VND: "vn",
        PKR: "pk",
        BDT: "bd",
        LKR: "lk",
        NGN: "ng",
        EGP: "eg",
        ILS: "il",
        TRY: "tr",
        RUB: "ru",
        ARS: "ar",
        CLP: "cl",
        COP: "co",
        PEN: "pe",
      };

      const normalized = (code || "").toUpperCase();
      if (map[normalized]) {
        return `https://flagcdn.com/24x18/${map[normalized]}.png`;
      }

      if (/^[A-Z]{3}$/.test(normalized) && !normalized.startsWith("X")) {
        const fallback = normalized.slice(0, 2).toLowerCase();
        return `https://flagcdn.com/24x18/${fallback}.png`;
      }

      return "https://flagcdn.com/24x18/un.png";
    },

    formatRate(rate) {
      if (rate === null || rate === undefined || rate === "") return "-";
      const value = Number(rate);
      if (Number.isNaN(value)) return String(rate);
      return value.toLocaleString(undefined, {
        minimumFractionDigits: 4,
        maximumFractionDigits: 6,
      });
    },

    toggleDropdown(side) {
      if (side === "from") {
        this.showFromDropdown = !this.showFromDropdown;
        if (this.showFromDropdown) {
          this.showToDropdown = false;
          this.$nextTick(() => {
            if (this.$refs.fromSearchInput) {
              this.$refs.fromSearchInput.focus();
            }
          });
        }
      } else {
        this.showToDropdown = !this.showToDropdown;
        if (this.showToDropdown) {
          this.showFromDropdown = false;
          this.$nextTick(() => {
            if (this.$refs.toSearchInput) {
              this.$refs.toSearchInput.focus();
            }
          });
        }
      }
    },

    selectCurrency(side, code) {
      if (side === "from") {
        if (code === this.toCurrency) {
          this.swapCurrencies();
          this.fromSearch = "";
          this.showFromDropdown = false;
          return;
        }
        this.fromCurrency = code;
        this.fromSearch = "";
        this.showFromDropdown = false;
      } else {
        if (code === this.fromCurrency) {
          this.swapCurrencies();
          this.toSearch = "";
          this.showToDropdown = false;
          return;
        }
        this.toCurrency = code;
        this.toSearch = "";
        this.showToDropdown = false;
      }
      this.convertCurrency(true);
    },

    toggleSort(column) {
      if (this.sortBy === column) {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      } else {
        this.sortBy = column;
        this.sortOrder = column === "rate" ? "desc" : "asc";
      }
    },

    getSortIcon(column) {
      if (this.sortBy !== column) return "↕";
      return this.sortOrder === "asc" ? "↑" : "↓";
    },
    // ✅ Section 1 conversion API
    async convertCurrency(force = false) {
      if (!this.amount || Number(this.amount) <= 0) {
        this.convertedAmount = 0;
        this.exchangeRate = 0;
        this.convertError = "";
        this.convertLoading = false;
        return;
      }

      if (!force && this.exchangeRate && this.activeInput !== "converted") {
        const converted = Number(this.amount) * Number(this.exchangeRate);
        this.convertedAmount = Number.isFinite(converted) ? converted : 0;
        this.convertedInput = this.formatInputValue(this.convertedAmount);
        this.convertLoading = false;
        return;
      }

      this.convertLoading = true;
      this.convertError = "";

      try {
        const url = `${this.BASE_URL}/convert?api_key=${this.API_KEY}&from=${this.fromCurrency}&to=${this.toCurrency}&amount=${this.amount}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || data?.meta?.code >= 400) {
          throw new Error(data?.message || "Failed to convert currency");
        }

        // Expected response:
        // data.response.value or data.response.amount? depends on API schema
        // We'll safely handle both
        const value =
          data?.response?.value ??
          data?.response?.amount ??
          data?.value ??
          null;

        const rate =
          data?.response?.rate ??
          data?.rate ??
          (value ? value / this.amount : 0);

        this.convertedAmount = value ?? 0;
        this.exchangeRate = rate ?? 0;
        if (this.activeInput !== "converted") {
          this.convertedInput = this.formatInputValue(this.convertedAmount);
        }
      } catch (err) {
        this.convertError = err.message || "Something went wrong";
      } finally {
        this.convertLoading = false;
      }
    },

    async convertReverse() {
      if (!this.convertedInput || Number(this.convertedInput) <= 0) {
        this.amount = "";
        this.exchangeRate = 0;
        this.convertError = "";
        this.convertLoading = false;
        return;
      }

      if (this.exchangeRate && this.activeInput === "converted") {
        const amountValue = Number(this.convertedInput) / Number(this.exchangeRate);
        this.amount = Number.isFinite(amountValue) ? this.formatInputValue(amountValue) : "";
        this.convertedAmount = Number(this.convertedInput) || 0;
        this.convertLoading = false;
        return;
      }

      this.convertLoading = true;
      this.convertError = "";

      try {
        const url = `${this.BASE_URL}/convert?api_key=${this.API_KEY}&from=${this.toCurrency}&to=${this.fromCurrency}&amount=${this.convertedInput}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || data?.meta?.code >= 400) {
          throw new Error(data?.message || "Failed to convert currency");
        }

        const value =
          data?.response?.value ??
          data?.response?.amount ??
          data?.value ??
          null;

        const reverseRate =
          data?.response?.rate ?? data?.rate ?? (value ? value / this.convertedInput : 0);

        this.amount = value ?? "";
        this.convertedAmount = Number(this.convertedInput) || 0;
        this.exchangeRate =
          reverseRate ? 1 / reverseRate : this.convertedAmount / Number(value || 1);
      } catch (err) {
        this.convertError = err.message || "Something went wrong";
      } finally {
        this.convertLoading = false;
      }
    },

    // ✅ Debounce typing in amount box (nice UX)
    debouncedConvert() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.convertCurrency();
      }, 400);
    },

    swapCurrencies() {
      const temp = this.fromCurrency;
      this.fromCurrency = this.toCurrency;
      this.toCurrency = temp;
      this.convertCurrency(true);
    },

    // ✅ Load Currency Codes for dropdown
    async fetchCurrencies() {
      try {
        const url = `${this.BASE_URL}/currencies?api_key=${this.API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || data?.meta?.code >= 400) {
          throw new Error(data?.message || "Failed to load currencies");
        }

        const response = data?.response || [];
        let list = [];

        if (Array.isArray(response)) {
          list = response.map((item) => {
            const code = item?.short_code || item?.code || "";
            return {
              code,
              name: item?.name || code,
              symbol: item?.symbol || "",
              symbolFirst: item?.symbol_first ?? true,
              flagUrl: this.getCurrencyFlagUrl(code),
            };
          });
        } else {
          const values = Object.values(response);
          list = values.map((item) => {
            const code = item?.short_code || item?.code || "";
            return {
              code,
              name: item?.name || code,
              symbol: item?.symbol || "",
              symbolFirst: item?.symbol_first ?? true,
              flagUrl: this.getCurrencyFlagUrl(code),
            };
          });
        }

        list = list.filter((item) => /^[A-Z]{3}$/.test(item.code));

        // sort by currency code
        list.sort((a, b) => a.code.localeCompare(b.code));

        this.currencyList = list;
      } catch (err) {
        console.error("fetchCurrencies error:", err);
      }
    },

    // ✅ Section 2 Latest Rates API
    async fetchLatestRates() {
      if (this.latestLoading) return;
      this.latestLoading = true;
      this.latestError = "";

      try {
        const url = `${this.BASE_URL}/latest?api_key=${this.API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || data?.meta?.code >= 400) {
          throw new Error(data?.message || "Failed to load latest rates");
        }

        // Expected: data.response.rates (object)
        const base = data?.response?.base || data?.base || "";
        const ratesObj = data?.response?.rates || data?.rates || {};

        this.latestBase = base;

        // Merge with currencyList name lookup
        const nameMap = {};
        const flagMap = {};
        this.currencyList.forEach((c) => {
          nameMap[c.code] = c.name;
          flagMap[c.code] = c.flagUrl;
        });

        const rows = Object.keys(ratesObj)
          .filter((code) => Boolean(nameMap[code]))
          .map((code) => ({
            code,
            name: nameMap[code],
            flag: flagMap[code] || this.getCurrencyFlagUrl(code),
            rate: ratesObj[code],
          }));

        this.latestRates = rows;
      } catch (err) {
        this.latestError = err.message || "Something went wrong";
      } finally {
        this.latestLoading = false;
      }
    },
  },

  async mounted() {
    this.handleOutsideClick = (event) => {
      if (!event.target.closest(".currency-dropdown")) {
        this.showFromDropdown = false;
        this.showToDropdown = false;
      }
    };
    document.addEventListener("click", this.handleOutsideClick);

    // Load dropdown currencies first
    await this.fetchCurrencies();

    // Load converter result
    await this.convertCurrency();
    this.convertedInput = this.formatInputValue(this.convertedAmount);

    this.updatePageTitle();

    // Load latest rates table
    await this.fetchLatestRates();

    // Auto-refresh latest rates every 30s
    this.latestIntervalId = setInterval(() => {
      this.fetchLatestRates();
    }, 30000);
  },
  beforeUnmount() {
    if (this.handleOutsideClick) {
      document.removeEventListener("click", this.handleOutsideClick);
    }
    if (this.latestIntervalId) {
      clearInterval(this.latestIntervalId);
      this.latestIntervalId = null;
    }
  },
  watch: {
    amount() {
      this.updatePageTitle();
    },
    fromCurrency() {
      this.updatePageTitle();
    },
    toCurrency() {
      this.updatePageTitle();
    },
    currencyList() {
      this.updatePageTitle();
    },
  },
}).mount("#app");