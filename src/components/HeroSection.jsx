import { useEffect, useState, useRef } from 'react';
import { fetchFarettoHeroSlides } from '../lib/api.js';

const AUTOPLAY_MS = 6500;

// Hero rotativo del home, debajo del header (ver App.jsx: se renderiza fuera
// de .public-main a proposito, para poder ocupar el ancho completo de la
// pantalla sin heredar el max-width/padding del contenido). Administrable
// desde Power Admin > sitio Faretto > grupo Faretto > Hero / Slider.
//
// El <section> exterior queda siempre montado (nunca cambia de tipo de
// elemento entre "cargando" y "listo") por la misma razon documentada en
// HomePromoSlider de sitio_power: reemplazar un placeholder por el carrusel
// recien montado obliga a un ciclo de layout que se mide como salto de CLS.
export function HeroSection({ onNavigate }) {
  const [slides, setSlides] = useState(null); // null = todavia no respondio
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetchFarettoHeroSlides()
      .then((data) => { if (!cancelled) setSlides(data); })
      .catch(() => { if (!cancelled) setSlides([]); });
    return () => { cancelled = true; };
  }, []);

  const ready = Array.isArray(slides) && slides.length > 0;
  const canRotate = ready && slides.length > 1;

  useEffect(() => {
    if (!canRotate) return undefined;
    timerRef.current = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timerRef.current);
  }, [canRotate, slides?.length]);

  // El indice puede quedar fuera de rango si el admin borra slides mientras
  // la pagina esta abierta - se corrige antes del proximo render.
  useEffect(() => {
    if (ready && activeIndex >= slides.length) setActiveIndex(0);
  }, [ready, slides?.length, activeIndex]);

  const goTo = (index) => {
    window.clearInterval(timerRef.current);
    setActiveIndex(index);
  };

  const handleClick = (event, url) => {
    if (!url || !url.startsWith('/')) return;
    event.preventDefault();
    onNavigate(url);
  };

  if (slides !== null && slides.length === 0) return null;

  return (
    <section className="hero-slider" aria-label="Destacados Faretto" aria-busy={!ready}>
      {ready && (
        <>
          <div className="hero-slider-track">
            {slides.map((slide, index) => {
              const isActive = index === activeIndex;
              const Tag = slide.url_destino ? 'a' : 'div';
              return (
                <Tag
                  key={slide.imagen_url + index}
                  className={`hero-slide ${isActive ? 'is-active' : ''}`}
                  aria-hidden={!isActive}
                  {...(slide.url_destino ? {
                    href: slide.url_destino,
                    onClick: (event) => handleClick(event, slide.url_destino),
                    target: slide.url_destino.startsWith('http') ? '_blank' : undefined,
                    rel: slide.url_destino.startsWith('http') ? 'noreferrer' : undefined
                  } : {})}
                >
                  <picture>
                    {slide.imagen_url_mobile && (
                      <source media="(max-width: 720px)" srcSet={slide.imagen_url_mobile} />
                    )}
                    <img
                      src={slide.imagen_url}
                      alt={slide.alt || ''}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                      decoding="async"
                    />
                  </picture>
                </Tag>
              );
            })}
          </div>
          {canRotate && (
            <div className="hero-slider-dots" aria-label="Seleccionar destacado">
              {slides.map((slide, index) => (
                <button
                  type="button"
                  key={slide.imagen_url + index}
                  className={index === activeIndex ? 'active' : ''}
                  onClick={() => goTo(index)}
                  aria-label={`Ir al destacado ${index + 1}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
