const fileInput = document.getElementById("portfolio-file");
const loadSampleButton = document.getElementById("load-sample");
const fileStatus = document.getElementById("file-status");
const totalValueEl = document.getElementById("total-value");
const positionCountEl = document.getElementById("position-count");
const topHoldingEl = document.getElementById("top-holding");
const avgCostEl = document.getElementById("avg-cost");
const portfolioRows = document.getElementById("portfolio-rows");
const newsList = document.getElementById("news-list");
const newsApiKeyInput = document.getElementById("news-api-key");
const loadNewsButton = document.getElementById("load-news");
const forecastExpectedEl = document.getElementById("forecast-expected");
const forecastHighEl = document.getElementById("forecast-high");
const forecastLowEl = document.getElementById("forecast-low");
const outlookText = document.getElementById("outlook-text");

let portfolio = [];

const samplePortfolio = [
  { symbol: "AAPL", shares: 10, cost: 145.2 },
  { symbol: "MSFT", shares: 6, cost: 312.45 },
  { symbol: "SAP", shares: 12, cost: 116.8 },
  { symbol: "NVDA", shares: 4, cost: 780.5 },
];

const sampleNews = [
  {
    title: "Technologie-Aktien reagieren auf neue KI-Investitionen",
    summary: "Mehrere Portfolio-Unternehmen profitieren von steigenden KI-Ausgaben im Unternehmenssektor.",
    source: "Beispiel-News",
  },
  {
    title: "Zinsausblick bleibt stabil",
    summary: "Die Zentralbank signalisiert eine abwartende Haltung, was Wachstumswerte stützt.",
    source: "Beispiel-News",
  },
  {
    title: "Halbleiter-Lieferketten entspannen sich",
    summary: "Analysten erwarten eine Normalisierung der Lagerbestände im zweiten Halbjahr.",
    source: "Beispiel-News",
  },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);

const parseCSV = (text) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines
    .map((line) => {
      const [symbol, shares, cost] = line.split(",").map((item) => item.trim());
      if (!symbol || !shares || !cost) return null;
      const parsedShares = Number(shares);
      const parsedCost = Number(cost);
      if (Number.isNaN(parsedShares) || Number.isNaN(parsedCost)) return null;
      return {
        symbol: symbol.toUpperCase(),
        shares: parsedShares,
        cost: parsedCost,
      };
    })
    .filter(Boolean);
};

const updatePortfolio = (data) => {
  portfolio = data;
  const totalValue = portfolio.reduce(
    (sum, holding) => sum + holding.shares * holding.cost,
    0,
  );
  const totalShares = portfolio.reduce((sum, holding) => sum + holding.shares, 0);
  const avgCost = totalShares ? totalValue / totalShares : 0;

  totalValueEl.textContent = formatCurrency(totalValue);
  positionCountEl.textContent = portfolio.length.toString();

  const topHolding = portfolio
    .slice()
    .sort((a, b) => b.shares * b.cost - a.shares * a.cost)[0];
  topHoldingEl.textContent = topHolding
    ? `${topHolding.symbol} (${formatCurrency(topHolding.shares * topHolding.cost)})`
    : "–";

  avgCostEl.textContent = formatCurrency(avgCost);

  portfolioRows.innerHTML = "";
  portfolio.forEach((holding) => {
    const row = document.createElement("tr");
    const value = holding.shares * holding.cost;
    const allocation = totalValue ? (value / totalValue) * 100 : 0;
    row.innerHTML = `
      <td>${holding.symbol}</td>
      <td>${holding.shares.toLocaleString("de-DE")}</td>
      <td>${formatCurrency(holding.cost)}</td>
      <td>${formatCurrency(value)}</td>
      <td>${allocation.toFixed(1)}%</td>
    `;
    portfolioRows.appendChild(row);
  });

  updateForecast(totalValue);
  renderOutlook(totalValue, topHolding);
};

const updateForecast = (totalValue) => {
  const expected = totalValue * 1.05;
  const high = expected * 1.15;
  const low = expected * 0.85;
  forecastExpectedEl.textContent = formatCurrency(expected);
  forecastHighEl.textContent = formatCurrency(high);
  forecastLowEl.textContent = formatCurrency(low);
};

const renderOutlook = (totalValue, topHolding) => {
  if (!totalValue) {
    outlookText.textContent = "Lade dein Portfolio hoch, um einen Zukunftsausblick zu sehen.";
    return;
  }

  const concentration = topHolding
    ? ((topHolding.shares * topHolding.cost) / totalValue) * 100
    : 0;
  const message = [
    `Dein Portfolio umfasst ${portfolio.length} Positionen mit einem Gesamtwert von ${formatCurrency(
      totalValue,
    )}.`,
    topHolding
      ? `Die größte Position ist ${topHolding.symbol} und macht rund ${concentration.toFixed(
          1,
        )}% aus.`
      : "Es gibt aktuell keine dominante Position.",
    concentration > 35
      ? "Die Konzentration ist relativ hoch. Eventuell lohnt sich eine breitere Streuung."
      : "Die Allokation wirkt ausgewogen, prüfe dennoch regelmäßig deine Gewichtungen.",
  ];

  outlookText.textContent = message.join(" ");
};

const renderNews = (articles) => {
  newsList.innerHTML = "";
  if (!articles.length) {
    newsList.innerHTML = "<p class=\"muted\">Keine Nachrichten verfügbar.</p>";
    return;
  }

  articles.forEach((article) => {
    const item = document.createElement("article");
    item.className = "news-item";
    item.innerHTML = `
      <h3>${article.title}</h3>
      <p>${article.summary}</p>
      <span class="muted">${article.source}</span>
    `;
    newsList.appendChild(item);
  });
};

const loadNews = async () => {
  if (!portfolio.length) {
    renderNews(sampleNews);
    return;
  }

  const apiKey = newsApiKeyInput.value.trim();
  if (!apiKey) {
    renderNews(sampleNews);
    return;
  }

  const query = portfolio.map((holding) => holding.symbol).join(" OR ");
  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=de&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`,
    );
    if (!response.ok) {
      throw new Error("NewsAPI error");
    }
    const data = await response.json();
    const articles = (data.articles || []).map((article) => ({
      title: article.title,
      summary: article.description || "Keine Zusammenfassung verfügbar.",
      source: article.source?.name || "NewsAPI",
    }));
    renderNews(articles.length ? articles : sampleNews);
  } catch (error) {
    renderNews(sampleNews);
  }
};

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    const data = parseCSV(loadEvent.target.result);
    if (!data.length) {
      fileStatus.textContent = "CSV konnte nicht gelesen werden. Bitte Format prüfen.";
      return;
    }
    fileStatus.textContent = `Datei geladen: ${file.name}`;
    updatePortfolio(data);
    loadNews();
  };
  reader.readAsText(file);
});

loadSampleButton.addEventListener("click", () => {
  fileStatus.textContent = "Beispieldaten geladen.";
  updatePortfolio(samplePortfolio);
  loadNews();
});

loadNewsButton.addEventListener("click", () => {
  loadNews();
});

renderOutlook(0, null);
renderNews(sampleNews);
