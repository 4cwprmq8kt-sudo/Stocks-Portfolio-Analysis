# Stocks Portfolio Analysis

Diese einfache Web-App erlaubt es dir, ein Aktien-Portfolio als CSV hochzuladen und sofort eine Analyse zu sehen:

- Kennzahlen (Gesamtwert, Top-Position, durchschnittlicher Einstand)
- Allokationsübersicht
- Abgleich mit Tagesnachrichten (optional mit NewsAPI-Key)
- Vereinfachter Zukunftsausblick (12 Monate)

## CSV-Format

```
Symbol,Stückzahl,Einstandskurs
AAPL,10,145.20
MSFT,6,312.45
```

## Lokales Starten

```
python -m http.server 8000
```

Dann im Browser `http://localhost:8000` öffnen.

## Hinweise

- Die App läuft vollständig im Browser, keine Daten werden gespeichert.
- Für Live-Nachrichten optional einen kostenlosen NewsAPI-Key angeben.
