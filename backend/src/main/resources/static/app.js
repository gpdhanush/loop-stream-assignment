document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("convert-form");
    const result = document.getElementById("result");
    const resultText = document.querySelector(".result-text");
    const resultNote = document.querySelector(".result-note");
    const errorBox = document.getElementById("error");
    const loader = document.getElementById("loader");
    const convertButton = document.getElementById("convert-btn");

    const showError = (message) => {
        errorBox.textContent = message;
        errorBox.classList.remove("hidden");
        result.classList.add("hidden");
    };

    const showResult = (text, note) => {
        resultText.textContent = text;
        resultNote.textContent = note;
        result.classList.remove("hidden");
        errorBox.classList.add("hidden");
    };

    const normalizeCode = (value) => (value || "").trim().toUpperCase();

    const formatThousands = (value) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    const formatFetchedAt = (value) => {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value.replace("T", " ");
        }
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const day = String(date.getDate()).padStart(2, "0");
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        let hours = date.getHours();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        const hh = String(hours).padStart(2, "0");
        const mm = String(date.getMinutes()).padStart(2, "0");
        const ss = String(date.getSeconds()).padStart(2, "0");
        return `${day}-${month}-${year} ${hh}:${mm}:${ss} ${ampm}`;
    };

    const amountInputField = document.getElementById("amount");
    amountInputField.addEventListener("input", () => {
        const digits = amountInputField.value.replace(/\D/g, "");
        amountInputField.value = formatThousands(digits);
    });

    const closeAllDropdowns = () => {
        document.querySelectorAll(".currency-dropdown.open").forEach((dropdown) => {
            dropdown.classList.remove("open");
        });
    };

    const setupDropdown = (dropdown) => {
        const trigger = dropdown.querySelector(".currency-trigger");
        const searchInput = dropdown.querySelector(".dropdown-search");
        const items = Array.from(dropdown.querySelectorAll(".dropdown-item"));
        const displayFlag = trigger.querySelector(".flag");
        const displayCode = trigger.querySelector(".code");
        const displayName = trigger.querySelector(".name");
        const hiddenInputId = dropdown.dataset.input;
        const hiddenInput = document.getElementById(hiddenInputId);

        const selectItem = (item) => {
            const code = normalizeCode(item.dataset.code);
            const name = item.dataset.name || code;
            const flag = item.dataset.flag || "🏳️";
            displayFlag.textContent = flag;
            displayCode.textContent = code;
            displayName.textContent = name;
            hiddenInput.value = code;
            dropdown.classList.remove("open");
        };

        if (items.length > 0) {
            selectItem(items[0]);
        }

        trigger.addEventListener("click", (event) => {
            event.stopPropagation();
            const isOpen = dropdown.classList.contains("open");
            closeAllDropdowns();
            dropdown.classList.toggle("open", !isOpen);
            if (!isOpen) {
                searchInput.value = "";
                items.forEach((item) => {
                    item.style.display = "";
                });
                setTimeout(() => searchInput.focus(), 0);
            }
        });

        searchInput.addEventListener("input", () => {
            const term = searchInput.value.trim().toLowerCase();
            items.forEach((item) => {
                const haystack = `${item.dataset.code} ${item.dataset.name}`.toLowerCase();
                item.style.display = haystack.includes(term) ? "" : "none";
            });
        });

        items.forEach((item) => {
            item.addEventListener("click", () => selectItem(item));
        });
    };

    document.querySelectorAll(".currency-dropdown").forEach(setupDropdown);
    document.addEventListener("click", closeAllDropdowns);

    const setLoading = (isLoading) => {
        if (isLoading) {
            loader.classList.remove("hidden");
            convertButton.setAttribute("disabled", "disabled");
            convertButton.classList.add("opacity-70", "cursor-not-allowed");
        } else {
            loader.classList.add("hidden");
            convertButton.removeAttribute("disabled");
            convertButton.classList.remove("opacity-70", "cursor-not-allowed");
        }
    };

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const sourceCurrency = normalizeCode(document.getElementById("sourceCurrency").value);
        const targetCurrency = normalizeCode(document.getElementById("targetCurrency").value);
        const amountInput = amountInputField.value.replace(/,/g, "").trim();
        const amount = Number(amountInput);

        if (!sourceCurrency || !targetCurrency) {
            showError("Please select both currencies.");
            return;
        }

        if (!amountInput) {
            showError("Please enter an amount.");
            return;
        }

        if (!Number.isInteger(amount) || amount <= 0) {
            showError("Amount must be a positive whole number.");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch("/api/convert", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sourceCurrency, targetCurrency, amount })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Conversion failed.");
            }

            const formattedAmount = formatThousands(String(data.amount));
            const formattedConverted = Number(data.convertedAmount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            const text = `The ${data.targetCurrency} amount for ${data.sourceCurrency} ${formattedAmount} is ${data.targetCurrency} ${formattedConverted}`;
            const fetchedLabel = data.fetchedAt ? ` (fetched at ${formatFetchedAt(data.fetchedAt)})` : "";
            const note = data.fromCache
                ? `Rate used: cached${fetchedLabel}`
                : `Rate used: fresh API call${fetchedLabel}`;
            showResult(text, note);
        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    });
});
