import { useState, useEffect } from "react";
import { ENTRIES } from "./entries.js";
import "./styles.css";

const ENTRIES_PER_PAGE = 7;

// Extrae la letra inicial ignorando signos de puntuación al inicio
// Ej: "¡A peresha..." → "A", "Aonde" → "A"
const getInitialLetter = (word) => {
  return word.replace(/^[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ]+/, "")[0]?.toUpperCase() ?? "?";
};

// Resalta las coincidencias del buscador dentro de un texto  ← acá
// Divide el texto en partes y envuelve las coincidencias en un <mark>
const highlightText = (text, query) => {
  if (!query.trim()) return text; // Sin búsqueda — devuelve el texto normal
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="highlight">{part}</mark>
      : part
  );
};

export default function App() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeLetter, setActiveLetter] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeYear, setActiveYear] = useState(null);     // ← año seleccionado
  const [activeMonth, setActiveMonth] = useState(null);   // ← mes seleccionado
  const [sortOrder, setSortOrder] = useState("az");       // ← "az", "recent", "oldest"
  const [photoOpen, setPhotoOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);         // ← controla qué card mostró el mensaje de copiado
  const [seenCards, setSeenCards] = useState(() => {
    // Carga del localStorage las cards que ya fueron abiertas
    // Así el pulso del + no vuelve a aparecer en visitas posteriores
    try {
      return new Set(JSON.parse(localStorage.getItem("seen-cards") || "[]"));
    } catch {
      return new Set();
    }
  });

  const [showScrollTop, setShowScrollTop] = useState(false); // ← controla visibilidad del botón
  const [scrollProgress, setScrollProgress] = useState(0);   // ← progreso del scroll 0-100
  const [surpriseId, setSurpriseId] = useState(null);          // ← id de la entrada sorpresa activa

  // Calcula el progreso del scroll y muestra el botón al pasar 400px
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
      setShowScrollTop(scrollTop > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Limpia signos de puntuación al inicio para comparar correctamente
  // Ej: "¡A peresha..." se compara como "A peresha..."
  const cleanForSort = (word) => word.replace(/^[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ]+/, "");

  // Convierte fecha de YYYY-MM-DD a DD-MM-YYYY para mostrar en pantalla
  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  // Entradas ordenadas según el criterio seleccionado
  const entries = [...ENTRIES].sort((a, b) => {
    if (sortOrder === "az") return cleanForSort(a.word).localeCompare(cleanForSort(b.word), "es");
    if (sortOrder === "recent") return new Date(b.date) - new Date(a.date);
    if (sortOrder === "oldest") return new Date(a.date) - new Date(b.date);
    return 0;
  });

  // Letras únicas disponibles en el diccionario, ordenadas alfabéticamente
  const activeLetters = [...new Set(
    entries.map((e) => getInitialLetter(e.word))
  )].sort();

  // Nombres de los meses para mostrar en el filtro de fecha
  const MONTH_NAMES = [
    "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Años únicos disponibles, ordenados de más reciente a más antiguo
  const activeYears = [...new Set(
    entries.map((e) => e.date.split("-")[0])
  )].sort((a, b) => b - a);

  // Meses disponibles según el año seleccionado
  // Si no hay año activo, muestra todos los meses disponibles
  const activeMonths = [...new Set(
    entries
      .filter((e) => activeYear ? e.date.split("-")[0] === activeYear : true)
      .map((e) => e.date.split("-")[1])
  )].sort();

  // Resetea a página 1 al buscar
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // Alterna el filtro por letra — si ya está activa la desactiva y vuelve a Todas
  // Si se toca Todas directamente, limpia el filtro y resetea la categoría
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
      setActiveCategory(null);
    } else {
      setActiveCategory(category);
    }
    setCurrentPage(1);
  };

  // Cambia el año activo — resetea el mes al cambiar de año
  const handleYearClick = (year) => {
    if (activeYear === year) {
      setActiveYear(null);
      setActiveMonth(null);
    } else {
      setActiveYear(year);
      setActiveMonth(null);
    }
    setCurrentPage(1);
  };

  // Cambia el mes activo — mismo patrón que categorías
  const handleMonthClick = (month) => {
    if (activeMonth === month) {
      setActiveMonth(null);
    } else {
      setActiveMonth(month);
    }
    setCurrentPage(1);
  };

  // Entradas filtradas por búsqueda, letra y fecha — sin categoría
  // Se usa para calcular qué categorías mostrar sin que desaparezcan al seleccionar una
  const filteredByLetterAndSearch = entries.filter((e) => {
    const matchesSearch =
      e.word.toLowerCase().includes(search.toLowerCase()) ||
      e.definition.toLowerCase().includes(search.toLowerCase());
    const matchesLetter = activeLetter
      ? getInitialLetter(e.word) === activeLetter
      : true;
    const matchesYear = activeYear
      ? e.date.split("-")[0] === activeYear
      : true;
    const matchesMonth = activeMonth
      ? e.date.split("-")[1] === activeMonth
      : true;
    return matchesSearch && matchesLetter && matchesYear && matchesMonth;
  });

  // Categorías únicas disponibles según letra, búsqueda y fecha — sin filtro de categoría
  // Así las otras categorías no desaparecen al seleccionar una
  const activeCategories = [...new Set(
    filteredByLetterAndSearch.map((e) => e.category)
  )].sort();

  // Aplica filtro completo — búsqueda, letra, fecha y categoría
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

  // Arma el texto para compartir por WhatsApp o copiar
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

  // Selecciona una entrada al azar distinta a la actual
  // Limpia todos los filtros, navega a la página correcta,
  // cierra la anterior, abre la nueva y hace scroll hasta ella
  const handleSurprise = () => {
    // Evita repetir la misma entrada dos veces seguidas
    const available = ENTRIES.filter((e) => e.id !== open);
    const randomEntry = available[Math.floor(Math.random() * available.length)];

    // Calcula en qué página está la entrada dentro de la lista ordenada
    const sortedAll = [...ENTRIES].sort((a, b) =>
      cleanForSort(a.word).localeCompare(cleanForSort(b.word), "es")
    );
    const entryIndex = sortedAll.findIndex((e) => e.id === randomEntry.id);
    const targetPage = Math.floor(entryIndex / ENTRIES_PER_PAGE) + 1;

    // Limpia todos los filtros para que la entrada sea visible
    setSearch("");
    setActiveLetter(null);
    setActiveCategory(null);
    setActiveYear(null);  // ← limpia el filtro de año
    setActiveMonth(null); // ← limpia el filtro de mes
    setSortOrder("az"); // ← resetea el orden a A→Z para que la paginación sea correcta

    // Cierra la entrada anterior y abre la nueva
    setOpen(randomEntry.id);  // ← abre la card sorpresa
    setCurrentPage(targetPage); // ← va a la página donde está esa card
    setSurpriseId(randomEntry.id); // ← marca la entrada para resaltarla

    // Espera a que React actualice el DOM antes de hacer scroll
    setTimeout(() => {
      const el = document.getElementById(`card-${randomEntry.id}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 200);
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

      {/* FILTRO POR FECHA — chips de año y mes */}
      {activeYears.length > 0 && (
        <div className="date-filter-wrapper">

          {/* Chips de año */}
          <div className="date-filter-row">
            <span className="date-filter-label">Año</span>
            <div className="date-chips">

              {/* Botón Todos los años */}
              <button
                className={`date-chip ${activeYear === null ? "date-chip--active" : ""}`}
                onClick={() => { setActiveYear(null); setActiveMonth(null); setCurrentPage(1); }}
                aria-label="Mostrar todos los años"
              >
                Todos
              </button>

              {/* Chips de año — filtran por año */}
              {activeYears.map((year) => (
                <button
                  key={year}
                  className={`date-chip ${activeYear === year ? "date-chip--active" : ""}`}
                  onClick={() => handleYearClick(year)}
                  aria-label={`Filtrar por año ${year}`}
                >
                  {year}
                </button>
              ))}

            </div>
          </div>

          {/* Chips de mes — solo aparecen si hay un año seleccionado */}
          {activeYear && (
            <div className="date-filter-row">
              <span className="date-filter-label">Mes</span>
              <div className="date-chips">

                {/* Botón Todos los meses */}
                <button
                  className={`date-chip ${activeMonth === null ? "date-chip--active" : ""}`}
                  onClick={() => { setActiveMonth(null); setCurrentPage(1); }}
                  aria-label="Mostrar todo el año"
                >
                  Todos
                </button>

                {/* Chips de mes — filtran por mes */}
                {activeMonths.map((month) => (
                  <button
                    key={month}
                    className={`date-chip ${activeMonth === month ? "date-chip--active" : ""}`}
                    onClick={() => handleMonthClick(month)}
                    aria-label={`Filtrar por mes ${MONTH_NAMES[parseInt(month)]}`}
                  >
                    {MONTH_NAMES[parseInt(month)]}
                  </button>
                ))}

              </div>
            </div>
          )}

        </div>
      )}

      {/* INDICADOR DE RESULTADOS — aparece cuando hay cualquier filtro activo */}
      {(search || activeLetter || activeCategory || activeYear || activeMonth) && (
        <p className="results-count">
          {filtered.length === 0
            ? "No se encontraron entradas"
            : `${filtered.length} ${filtered.length === 1 ? "entrada encontrada" : "entradas encontradas"}`
          }
        </p>
      )}

      {/* ORDENAR — dropdown alineado a la derecha encima de la lista */}
      <div className="sort-wrapper">
        <label className="sort-label" htmlFor="sort-select">Ordenar</label>
        <select
          id="sort-select"
          className="sort-select"
          value={sortOrder}
          onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }}
        >
          <option value="az">A → Z</option>
          <option value="recent">Más reciente</option>
          <option value="oldest">Más antiguo</option>
        </select>
      </div>

      {/* LISTA DE ENTRADAS */}
      <div className="entries-wrapper">
        {filtered.length === 0 ? (
          <p className="entries-empty">No se encontró ninguna entrada.</p>
        ) : (
          currentEntries.map((entry, index) => {
            const isOpen = open === entry.id;
            const realIndex = entries.findIndex((e) => e.id === entry.id);

            // Letra inicial de la entrada actual y la anterior
            const currentLetter = getInitialLetter(entry.word);
            const prevEntry = currentEntries[index - 1];
            const prevLetter = prevEntry ? getInitialLetter(prevEntry.word) : null;

            // Muestra separador solo cuando:
            // - No hay filtro de letra activo
            // - No hay búsqueda activa
            // - No hay filtro de categoría activo
            // - El orden es alfabético A→Z
            const showSeparator = !activeLetter && !search && !activeCategory && sortOrder === "az" && currentLetter !== prevLetter;

            return (
              <div key={entry.id}>

                {/* Separador de letra — aparece cuando cambia la inicial */}
                {/* Usa el mismo delay que su card para sincronizarse */}
                {showSeparator && (
                  <div
                    className="letter-separator"
                    style={{ animationDelay: `${index * 180}ms` }}
                  >
                    <span className="letter-separator__letter">{currentLetter}</span>
                    <div className="letter-separator__line" />
                  </div>
                )}

                {/* TARJETA DE ENTRADA */}
                <div
                  id={`card-${entry.id}`}
                  className={`card ${isOpen ? "card--open" : ""} ${surpriseId === entry.id ? "card--surprise" : ""}`}
                  style={{ animationDelay: `${index * 180}ms` }}
                  onClick={() => {
                    setSurpriseId(null); // ← quita la señal al tocar la card
                    // Marca la card como vista y guarda en localStorage
                    // El pulso del + no vuelve a aparecer después de abrir
                    if (!seenCards.has(entry.id)) {
                      const updated = new Set(seenCards);
                      updated.add(entry.id);
                      setSeenCards(updated);
                      localStorage.setItem("seen-cards", JSON.stringify([...updated]));
                    }
                    setOpen(isOpen ? null : entry.id);
                  }}
                >

                  {/* Encabezado de la card — número, palabra y botón toggle */}
                  <div className="card__header">
                    <div>
                      <span className="card__number">
                        {String(realIndex + 1).padStart(2, "0")}
                      </span>
                      <h2 className="card__word">{highlightText(entry.word, search)}</h2>
                    </div>
                    {/* Botón + con pulso suave — pulsa solo si la card nunca fue abierta */}
                    <span className={`card__toggle ${isOpen ? "card__toggle--open" : ""} ${!isOpen && !seenCards.has(entry.id) ? "card__toggle--pulse" : ""}`}>
                      +
                    </span>
                  </div>

                  {/* Definición — siempre visible, con resaltado de búsqueda */}
                  <p className="card__definition">{highlightText(entry.definition, search)}</p>

                  {/* Hint "Ver ejemplo" — visible solo cuando la card está cerrada */}
                  {!isOpen && entry.example && (
                    <p className="card__hint">Ver ejemplo →</p>
                  )}

                  {/* Ejemplo — solo visible al abrir la card */}
                  {isOpen && entry.example && (
                    <div className="card__example">
                      <span className="card__example-label">Ejemplo</span>
                      <p className="card__example-text">"{entry.example}"</p>
                    </div>
                  )}

                  {/* Fecha de registro — mostrada en formato DD-MM-YYYY */}
                  <p className="card__date">{formatDate(entry.date)}</p>

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

      {/* BOTÓN SORPRÉNDEME — flotante inferior izquierdo */}
      <button
        className="surprise-btn"
        onClick={handleSurprise}
        aria-label="Entrada aleatoria"
      >
        ✦
      </button>

      {/* BOTÓN VOLVER ARRIBA — flotante con progreso circular */}
      {showScrollTop && (
        <button
          className="scroll-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Volver arriba"
        >
          {/* Círculo de progreso — se llena según el scroll */}
          <svg
            className="scroll-top__ring"
            viewBox="0 0 42 42"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Círculo de fondo — siempre visible, muy sutil */}
            <circle
              className="scroll-top__ring-bg"
              cx="21" cy="21" r="19"
              fill="none"
              strokeWidth="2"
            />
            {/* Círculo de progreso — crece con el scroll */}
            <circle
              className="scroll-top__ring-fill"
              cx="21" cy="21" r="19"
              fill="none"
              strokeWidth="2"
              strokeDasharray="119.4"
              strokeDashoffset={119.4 - (119.4 * scrollProgress) / 100}
              strokeLinecap="round"
              transform="rotate(-90 21 21)"
            />
          </svg>

          {/* Ícono de flecha — solo la punta, sin el palo */}
          <svg
            className="scroll-top__arrow"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
          >
            <path
              d="M4 15l8-8 8 8"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </>
  );
}