import { useState } from "react";
import { ENTRIES } from "./entries.js";
import "./styles.css";

const ENTRIES_PER_PAGE = 7;

export default function App() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const entries = [...ENTRIES].sort((a, b) =>
    a.word.localeCompare(b.word, "es")
  );

  const filtered = entries.filter(
    (e) =>
      e.word.toLowerCase().includes(search.toLowerCase()) ||
      e.definition.toLowerCase().includes(search.toLowerCase())
  );

  // Resetea a página 1 cuando se busca
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // Cálculo de páginas
  const totalPages = Math.ceil(filtered.length / ENTRIES_PER_PAGE);
  const startIndex = (currentPage - 1) * ENTRIES_PER_PAGE;
  const currentEntries = filtered.slice(startIndex, startIndex + ENTRIES_PER_PAGE);

  // Scroll al tope al cambiar de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
            onChange={handleSearch}
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
          currentEntries.map((entry, i) => {
            const isOpen = open === entry.id;
            // Número real en el diccionario completo ordenado
            const realIndex = entries.findIndex((e) => e.id === entry.id);
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
                      {String(realIndex + 1).padStart(2, "0")}
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

      {/* PAGINACIÓN — solo aparece si hay más de una página */}
      {totalPages > 1 && (
        <div className="pagination">
          {/* Botón anterior */}
          <button
            className={`pagination__btn ${currentPage === 1 ? "pagination__btn--disabled" : ""}`}
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            aria-label="Página anterior"
          >
            ‹
          </button>

          {/* Números de página */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`pagination__btn ${currentPage === page ? "pagination__btn--active" : ""}`}
              onClick={() => handlePageChange(page)}
              aria-label={`Página ${page}`}
            >
              {page}
            </button>
          ))}

          {/* Botón siguiente */}
          <button
            className={`pagination__btn ${currentPage === totalPages ? "pagination__btn--disabled" : ""}`}
            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
            aria-label="Página siguiente"
          >
            ›
          </button>
        </div>
      )}

      {/* PIE DE PÁGINA */}
      <footer className="footer">
        <div className="footer__divider" />
        <p className="footer__text">Compilado con amor ✦</p>
      </footer>
    </>
  );
}