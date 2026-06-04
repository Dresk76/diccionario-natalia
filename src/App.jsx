import { useState } from "react";
import { ENTRIES } from "./entries.js";
import "./styles.css";

const ENTRIES_PER_PAGE = 7;

// Extrae la letra inicial ignorando signos de puntuación al inicio
// Ej: "¡A peresha..." → "A", "Aonde" → "A"
const getInitialLetter = (word) => {
  return word.replace(/^[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ]+/, "")[0]?.toUpperCase() ?? "?";
};

export default function App() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeLetter, setActiveLetter] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null); // Controla qué card mostró el mensaje de copiado

  // Entradas ordenadas alfabéticamente
  const entries = [...ENTRIES].sort((a, b) =>
    a.word.localeCompare(b.word, "es")
  );

  // Letras únicas disponibles en el diccionario
  const activeLetters = [...new Set(
    entries.map((e) => getInitialLetter(e.word))
  )].sort();

  // Resetea a página 1 al buscar
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // Alterna el filtro por letra — si ya está activa la desactiva y vuelve a All
  // Si se toca All directamente, limpia el filtro
  const handleLetterClick = (letter) => {
    if (letter === null) {
      setActiveLetter(null);
    } else {
      setActiveLetter(activeLetter === letter ? null : letter);
    }
    setActiveCategory(null);
    setCurrentPage(1);
  };

  // Cambia la categoría activa — si tocás la misma la desactiva, si tocás otra cambia directo
  const handleCategoryClick = (category) => {
    if (activeCategory === category) {
      setActiveCategory(null); // ← toca la misma = desactiva
    } else {
      setActiveCategory(category);
    }
    setCurrentPage(1);
  };

  // Entradas filtradas solo por búsqueda y letra — sin categoría
  // Se usa para calcular qué categorías mostrar sin que desaparezcan al seleccionar una
  const filteredByLetterAndSearch = entries.filter((e) => {
    const matchesSearch =
      e.word.toLowerCase().includes(search.toLowerCase()) ||
      e.definition.toLowerCase().includes(search.toLowerCase());
    const matchesLetter = activeLetter
      ? getInitialLetter(e.word) === activeLetter
      : true;
    return matchesSearch && matchesLetter;
  });

  // Categorías únicas disponibles según letra y búsqueda — sin filtro de categoría
  // Así las otras categorías no desaparecen al seleccionar una
  const activeCategories = [...new Set(
    filteredByLetterAndSearch.map((e) => e.category)
  )].sort();

  // Aplica filtro completo — búsqueda, letra y categoría
  const filtered = filteredByLetterAndSearch.filter((e) => {
    const matchesCategory = activeCategory
      ? e.category === activeCategory
      : true;
    return matchesCategory;
  });

  // Cálculo de páginas
  const totalPages = Math.ceil(filtered.length / ENTRIES_PER_PAGE);
  const startIndex = (currentPage - 1) * ENTRIES_PER_PAGE;
  const currentEntries = filtered.slice(startIndex, startIndex + ENTRIES_PER_PAGE);

  // Scroll al tope al cambiar de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Arma el texto para compartir
  const buildShareText = (entry) => {
    return `📖 *${entry.word}*\n\n${entry.definition}\n\n_Ejemplo: ${entry.example}_\n\n— Diccionario de Natalia`;
  };

  // Comparte por WhatsApp
  const handleWhatsApp = (e, entry) => {
    e.stopPropagation(); // Evita abrir/cerrar la card al tocar el botón
    const text = encodeURIComponent(buildShareText(entry));
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  // Copia al portapapeles y muestra confirmación por 2 segundos
  const handleCopy = (e, entry) => {
    e.stopPropagation(); // Evita abrir/cerrar la card al tocar el botón
    navigator.clipboard.writeText(buildShareText(entry)).then(() => {
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <>
      {/* ENCABEZADO */}
      <header className="header">
        <div className="header__top-bar" />
        <div className="header__bottom-bar" />

        {/* Foto de perfil — abre el lightbox al hacer click */}
        <div
          className="header__avatar-wrapper"
          onClick={() => setPhotoOpen(true)}
          aria-label="Ver foto de perfil"
        >
          <img
            src="./images/profile/natalia.jpeg"
            alt="Natalia"
            className="header__avatar"
          />
        </div>

        <p className="header__subtitle">Vocabulario personal de</p>
        <h1 className="header__title">Natalia</h1>
        <div className="header__divider" />
        <p className="header__count">
          {ENTRIES.length} palabras que la definen
        </p>

        {/* Letras activas — filtro por inicial */}
        <div className="header__letters">
          {/* Botón Todas — muestra todas las entradas, activo por defecto */}
          <button
            className={`header__letter ${activeLetter === null ? "header__letter--active" : ""}`}
            onClick={() => handleLetterClick(null)}
            aria-label="Mostrar todas las entradas"
          >
            Todas
          </button>

          {/* Botones de letra — filtran por inicial */}
          {activeLetters.map((letter) => (
            <button
              key={letter}
              className={`header__letter ${activeLetter === letter ? "header__letter--active" : ""}`}
              onClick={() => handleLetterClick(letter)}
              aria-label={`Filtrar por letra ${letter}`}
            >
              {letter}
            </button>
          ))}
        </div>
      </header>

      {/* LIGHTBOX — previsualización de la foto de perfil */}
      {photoOpen && (
        <div
          className="lightbox"
          onClick={() => setPhotoOpen(false)}
          aria-label="Cerrar foto"
        >
          <button className="lightbox__close" onClick={() => setPhotoOpen(false)}>
            ×
          </button>
          <img
            src="./images/profile/natalia.jpeg"
            alt="Natalia"
            className="lightbox__img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

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

      {/* FILTRO POR CATEGORÍA — chips horizontales debajo del buscador */}
      <div className="categories-wrapper">

        {/* Botón Todas — muestra todas las categorías, activo por defecto */}
        <button
          className={`category-btn ${activeCategory === null ? "category-btn--active" : ""}`}
          onClick={() => setActiveCategory(null)}
          aria-label="Mostrar todas las categorías"
        >
          Todas
        </button>

        {/* Chips de categoría — filtran por categoría */}
        {activeCategories.map((category) => (
          <button
            key={category}
            className={`category-btn ${activeCategory === category ? "category-btn--active" : ""}`}
            onClick={() => handleCategoryClick(category)}
            aria-label={`Filtrar por categoría ${category}`}
          >
            {category}
          </button>
        ))}

      </div>

      {/* LISTA DE ENTRADAS */}
      <div className="entries-wrapper">
        {filtered.length === 0 ? (
          <p className="entries-empty">No se encontró ninguna entrada.</p>
        ) : (
          currentEntries.map((entry, index) => {
            const isOpen = open === entry.id;
            const realIndex = entries.findIndex((e) => e.id === entry.id);

            // Muestra separador de letra solo cuando no hay filtro de letra activo
            // Compara la letra inicial de la entrada actual con la anterior
            const currentLetter = getInitialLetter(entry.word);
            const prevEntry = currentEntries[index - 1];
            const prevLetter = prevEntry ? getInitialLetter(prevEntry.word) : null;
            const showSeparator = !activeLetter && currentLetter !== prevLetter;

            return (
              <div key={entry.id}>

                {/* Separador de letra — aparece cuando cambia la inicial */}
                {showSeparator && (
                  <div className="letter-separator">
                    <span className="letter-separator__letter">{currentLetter}</span>
                    <div className="letter-separator__line" />
                  </div>
                )}

                <div
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

                  {/* Botones de compartir — visibles siempre */}
                  <div className="card__share">

                    {/* Botón WhatsApp */}
                    <button
                      className="card__share-btn card__share-btn--whatsapp"
                      onClick={(e) => handleWhatsApp(e, entry)}
                      aria-label="Compartir por WhatsApp"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp
                    </button>

                    {/* Botón Copiar — cambia a "¡Copiado!" por 2 segundos */}
                    <button
                      className={`card__share-btn card__share-btn--copy ${copiedId === entry.id ? "card__share-btn--copied" : ""}`}
                      onClick={(e) => handleCopy(e, entry)}
                      aria-label="Copiar al portapapeles"
                    >
                      {copiedId === entry.id ? "¡Copiado!" : "Copiar"}
                    </button>

                  </div>
                </div>
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