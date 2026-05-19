import { useState } from "react";
import { ENTRIES } from "./entries.js";
import "./styles.css";

export default function App() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(null);

  const entries = [...ENTRIES].sort((a, b) =>
    a.word.localeCompare(b.word, "es")
  );

  const filtered = entries.filter(
    (e) =>
      e.word.toLowerCase().includes(search.toLowerCase()) ||
      e.definition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* ENCABEZADO */}
      <header className="header">
        <div className="header__top-bar" />
        <div className="header__bottom-bar" />
        <p className="header__subtitle">Vocabulario personal de</p>
        <h1 className="header__title">Natalia</h1>
        <div className="header__divider" />
        <p className="header__count">
          {ENTRIES.length} {ENTRIES.length === 1 ? "entrada" : "entradas"}
        </p>
      </header>

      {/* BUSCADOR */}
      <div className="search-wrapper">
        <div className="search-inner">
          <span className="search-icon">✦</span>
          <input
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en el diccionario..."
            type="search"
          />
        </div>
      </div>

      {/* LISTA DE ENTRADAS */}
      <div className="entries-wrapper">
        {filtered.length === 0 ? (
          <p className="entries-empty">No se encontró ninguna entrada.</p>
        ) : (
          filtered.map((entry, i) => {
            const isOpen = open === entry.id;
            return (
              <div
                key={entry.id}
                className={`card ${isOpen ? "card--open" : ""}`}
                onClick={() => setOpen(isOpen ? null : entry.id)}
              >
                {/* Número y palabra */}
                <div className="card__header">
                  <div>
                    <span className="card__number">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="card__word">{entry.word}</h2>
                  </div>
                  <span className={`card__toggle ${isOpen ? "card__toggle--open" : ""}`}>
                    +
                  </span>
                </div>

                {/* Definición — siempre visible */}
                <p className="card__definition">{entry.definition}</p>

                {/* Ejemplo — solo visible al abrir la card */}
                {isOpen && entry.example && (
                  <div className="card__example">
                    <span className="card__example-label">Ejemplo</span>
                    <p className="card__example-text">"{entry.example}"</p>
                  </div>
                )}

                {/* Fecha de registro */}
                <p className="card__date">{entry.date}</p>
              </div>
            );
          })
        )}
      </div>

      {/* PIE DE PÁGINA */}
      <footer className="footer">
        <div className="footer__divider" />
        <p className="footer__text">Compilado con amor ✦</p>
      </footer>
    </>
  );
}