import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowUpRight, Pause, Play } from "lucide-react";

type Kind = "country" | "city";

type Project = {
  id: string;
  name: string;
  place: string;
  area: number;
  year: number;
  months: number;
  kind: Kind;
  image: string;
  material: string;
  note: string;
};

const PROJECTS: Project[] = [
  {
    id: "pines",
    name: "Сосны",
    place: "Рублёво-Успенское",
    area: 680,
    year: 2024,
    months: 20,
    kind: "country",
    image: "/media/pines.jpg",
    material: "Травертин, бронза",
    note: "Длинный дом между стволами. Вода перед фасадом держит горизонт, жилые комнаты смотрят в глубь участка, а не на дорогу.",
  },
  {
    id: "quiet",
    name: "Тишина",
    place: "Николина Гора",
    area: 420,
    year: 2023,
    months: 16,
    kind: "country",
    image: "/media/forest.jpg",
    material: "Обожжённый дуб, стекло",
    note: "Низкий павильон в берёзах. Кровля не спорит с кронами, двор — мох и один камень, инженерия спрятана в цоколе.",
  },
  {
    id: "shore",
    name: "Берег",
    place: "Истринское водохранилище",
    area: 310,
    year: 2025,
    months: 14,
    kind: "country",
    image: "/media/lake.jpg",
    material: "Бетон, дуб",
    note: "Линейный объём вдоль воды. Тонкий свес даёт тень террасе, гостиная продолжается настилом без порога.",
  },
  {
    id: "hall",
    name: "Зал",
    place: "Остоженка",
    area: 240,
    year: 2024,
    months: 11,
    kind: "city",
    image: "/media/interior.jpg",
    material: "Известняк, дуб",
    note: "Городской дом с двойной высотой. Лестница — единственная скульптура, свет идёт с двух сторон, мебели мало.",
  },
];

const MATERIALS = [
  {
    id: "lime",
    label: "Известняк",
    note: "Тёплый камень, бронзовые переплёты, вода.",
    image: "/media/hero.jpg",
  },
  {
    id: "oak",
    label: "Чёрный дуб",
    note: "Тёмный объём, который растворяется в лесу.",
    image: "/media/forest.jpg",
  },
  {
    id: "concrete",
    label: "Бетон и дуб",
    note: "Спокойная линия у воды, без декора.",
    image: "/media/lake.jpg",
  },
] as const;

const FINISHES = [
  { id: "quiet", label: "Тихий каркас", rate: 290_000, note: "Дерево, штукатурка, ровный свет." },
  { id: "stone", label: "Камень", rate: 410_000, note: "Известняк, дуб, скрытые системы." },
  { id: "author", label: "Авторский", rate: 560_000, note: "Мебель на заказ, камень, двор." },
] as const;

type FinishId = (typeof FINISHES)[number]["id"];

const STEPS = [
  {
    n: "01",
    title: "Участок",
    text: "Обмеры, инсоляция, подъезды, соседи и то, чего на кадастре не видно. Без этого эскиз — картинка.",
  },
  {
    n: "02",
    title: "Образ",
    text: "Объём, свет и двор. Показываем модель и две-три развилки, а не двадцать фасадов на выбор.",
  },
  {
    n: "03",
    title: "Стройка",
    text: "Свой прораб на объекте. Каждую пятницу — короткий отчёт: что закрыто, что сдвинулось, где нужно ваше «да».",
  },
  {
    n: "04",
    title: "Дом",
    text: "Интерьер, свет, кухня и ландшафт входят в тот же договор. Ключи — когда можно жить, а не когда «коробка готова».",
  },
];

const TICKER = ["Архитектура", "Конструктив", "Интерьер", "Ландшафт", "Свет", "Камень", "Инженерия", "Надзор"];

function Mark() {
  return (
    <svg className="mark" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M6 26 L16 6.5 L26 26" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.4 18.2 H21.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function useSeen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setSeen(true);
        io.disconnect();
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, seen };
}

function Count({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLElement>(null);
  const [value, setValue] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) {
          setValue(to);
          return;
        }
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / 900);
          setValue(Math.round(to * (1 - (1 - p) ** 3)));
          if (p < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to]);
  return (
    <b ref={ref}>
      {value}
      {suffix}
    </b>
  );
}

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { ref, seen } = useSeen<HTMLDivElement>();
  return (
    <div ref={ref} className={`${className} wait${seen ? " is-in" : ""}`}>
      {children}
    </div>
  );
}

export function HomePage() {
  const [solid, setSolid] = useState(false);
  const [menu, setMenu] = useState(false);
  const [filter, setFilter] = useState<"all" | Kind>("all");
  const [step, setStep] = useState(0);
  const [material, setMaterial] = useState<(typeof MATERIALS)[number]["id"]>("lime");
  const [area, setArea] = useState(420);
  const [finish, setFinish] = useState<FinishId>("stone");
  const [sheet, setSheet] = useState<{ project: Project; phase: "in" | "out" } | null>(null);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeTimer = useRef(0);
  const titleId = useId();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [place, setPlace] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const p = height > 0 ? window.scrollY / height : 0;
      document.documentElement.style.setProperty("--scroll", p.toFixed(4));
      setSolid(window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          if (!video.paused) return;
          video.play().then(() => setPaused(false)).catch(() => setPaused(true));
        } else {
          video.pause();
        }
      },
      { threshold: 0.45 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!sheet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [sheet]);

  const shown = PROJECTS.filter((item) => filter === "all" || item.kind === filter);
  const rate = FINISHES.find((item) => item.id === finish) ?? FINISHES[1];
  const total = area * rate.rate;
  const low = Math.round((total * 0.92) / 1_000_000);
  const high = Math.round((total * 1.08) / 1_000_000);
  const wing = 48 + ((area - 180) / 720) * 78;

  function go(id: string) {
    setMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  function openProject(project: Project) {
    window.clearTimeout(closeTimer.current);
    setSheet({ project, phase: "in" });
  }

  function dismiss() {
    setSheet((current) => (current ? { ...current, phase: "out" } : null));
    closeTimer.current = window.setTimeout(() => setSheet(null), 180);
  }

  function wantSimilar(project: Project) {
    setNote(`Интересует дом в духе «${project.name}», ${project.place}.`);
    setSent(false);
    dismiss();
    window.setTimeout(() => go("contact"), 40);
  }

  function toggleVideo() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setPaused(false)).catch(() => setPaused(true));
    } else {
      video.pause();
      setPaused(true);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const next: { name?: string; phone?: string } = {};
    if (name.trim().length < 2) next.name = "Как к вам обращаться?";
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) next.phone = "Нужен телефон, чтобы перезвонить.";
    setErrors(next);
    if (next.name || next.phone) return;
    const lead = {
      name: name.trim(),
      phone: phone.trim(),
      place: place.trim(),
      note: note.trim(),
      at: new Date().toISOString(),
    };
    try {
      const prev = JSON.parse(localStorage.getItem("aurelia-leads") || "[]") as unknown[];
      const list = Array.isArray(prev) ? prev : [];
      localStorage.setItem("aurelia-leads", JSON.stringify([lead, ...list].slice(0, 20)));
    } catch {
      /* private mode */
    }
    setSent(true);
  }

  return (
    <main id="top">
      <header className={`site-nav${solid ? " is-solid" : ""}${menu ? " is-open" : ""}`}>
        <div className="progress" aria-hidden="true" />
        <div className="wrap nav-row">
          <a className="brand" href="#top" onClick={() => setMenu(false)}>
            <Mark />
            <span>
              <span className="brand-name">AURELIA</span>
              <span className="brand-sub">ATELIER</span>
            </span>
          </a>
          <nav className="nav-links" aria-label="Разделы">
            <a href="#works">Дома</a>
            <a href="#method">Метод</a>
            <a href="#studio">Материал</a>
            <a href="#estimate">Расчёт</a>
            <a href="#contact">Контакт</a>
          </nav>
          <a className="nav-cta press" href="#contact">
            Разговор
          </a>
          <button
            type="button"
            className={`burger${menu ? " is-on" : ""}`}
            aria-expanded={menu}
            aria-label={menu ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setMenu((value) => !value)}
          >
            <span />
            <span />
          </button>
        </div>
        {menu ? (
          <div className="mobile-panel wrap">
            <button type="button" onClick={() => go("works")}>Дома</button>
            <button type="button" onClick={() => go("method")}>Метод</button>
            <button type="button" onClick={() => go("studio")}>Материал</button>
            <button type="button" onClick={() => go("estimate")}>Расчёт</button>
            <button type="button" onClick={() => go("contact")}>Контакт</button>
          </div>
        ) : null}
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="kicker reveal">Частные резиденции · Москва</p>
          <h1 className="reveal d1">Дома, в которых тихо.</h1>
          <p className="lede reveal d2">
            AURELIA проектирует и строит резиденции под ключ — от участка до ключей. Одна
            мастерская, один договор, один ритм стройки.
          </p>
          <div className="hero-actions reveal d3">
            <a className="btn press" href="#contact">
              Обсудить участок
            </a>
            <a className="btn btn-ghost press" href="#works">
              Смотреть дома
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <img
            className="hero-still"
            src="/media/hero.jpg"
            alt="Вечерний известняковый дом с зеркалом воды и соснами"
            width={1280}
            height={720}
          />
          <span className="hero-chip">Вечер · известняк · вода</span>
        </div>
      </section>

      <section className="stats wrap" aria-label="Практика ателье">
        <div className="stat">
          <Count to={47} />
          <span>домов сдано</span>
        </div>
        <div className="stat">
          <Count to={12} suffix=" лет" />
          <span>одна команда</span>
        </div>
        <div className="stat">
          <Count to={18} suffix=" мес." />
          <span>средний цикл</span>
        </div>
        <div className="stat">
          <Count to={1} />
          <span>прораб на объекте</span>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[...TICKER, ...TICKER].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>

      <section className="section" id="works">
        <div className="wrap">
          <Reveal className="section-head">
            <p className="kicker">Избранное</p>
            <h2>Четыре дома, четыре участка</h2>
            <p>Не каталог планировок. Каждый объём собран вокруг света, двора и того, как в доме молчат.</p>
            <div className="filters" role="tablist" aria-label="Тип дома">
              {(
                [
                  ["all", "Все"],
                  ["country", "Загород"],
                  ["city", "Город"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={filter === id}
                  className={`chip press${filter === id ? " is-on" : ""}`}
                  onClick={() => setFilter(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </Reveal>
          <div className="work-grid">
            {shown.map((project, index) => (
              <button
                key={project.id}
                type="button"
                className={`work-card press${index === 0 && shown.length > 1 ? " is-feature" : ""}`}
                onClick={() => openProject(project)}
              >
                <span className="work-media">
                  <img src={project.image} alt="" width={960} height={640} />
                </span>
                <span className="work-meta">
                  <span>
                    <span className="work-name">{project.name}</span>
                    <span className="work-place">
                      {project.place} · {project.area} м²
                    </span>
                  </span>
                  <ArrowUpRight className="work-go" aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="method">
        <div className="wrap">
          <Reveal className="section-head">
            <p className="kicker">Метод</p>
            <h2>Как устроен год с нами</h2>
            <p>Смета не растёт без вашего согласия. Срок называем диапазоном и держим его еженедельным отчётом.</p>
          </Reveal>
          <div className="method">
            {STEPS.map((item, index) => (
              <button
                key={item.n}
                type="button"
                className="step press"
                aria-expanded={step === index}
                onClick={() => setStep(index)}
              >
                <span className="step-no">{item.n}</span>
                <span>
                  <h3>{item.title}</h3>
                  {step === index ? <p>{item.text}</p> : null}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="studio">
        <div className="wrap studio">
          <Reveal>
            <p className="kicker">Ателье</p>
            <h2>Материал задаёт тишину</h2>
            <p className="lede mt-5">
              Три палитры, с которых чаще начинается разговор. Переключение меняет дом, не декор.
            </p>
            <div className="mat-list mt-6">
              {MATERIALS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`mat-btn press${material === item.id ? " is-on" : ""}`}
                  aria-pressed={material === item.id}
                  onClick={() => setMaterial(item.id)}
                >
                  <strong>{item.label}</strong>
                  <small>{item.note}</small>
                </button>
              ))}
            </div>
          </Reveal>
          <div className="mat-frame">
            {MATERIALS.map((item) => (
              <img
                key={item.id}
                className={`mat-img${material === item.id ? " is-on" : ""}`}
                src={item.image}
                alt={item.label}
                width={960}
                height={640}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="reel">
        <div className="wrap reel-grid">
          <Reveal>
            <p className="kicker">Проход</p>
            <h2>Шесть секунд вдоль воды</h2>
            <p className="lede mt-5">
              Короткий кадр, не рекламный ролик. Дом «Сосны» вечером: стекло, известняк, неподвижная гладь.
            </p>
          </Reveal>
          <div>
            <div className="video-frame">
              <video
                ref={videoRef}
                poster="/media/hero.jpg"
                muted
                loop
                playsInline
                preload="metadata"
                src="/media/reel.mp4"
              />
              <button type="button" className="video-btn press" onClick={toggleVideo} aria-label={paused ? "Смотреть" : "Пауза"}>
                {paused ? <Play size={18} /> : <Pause size={18} />}
              </button>
            </div>
            <p className="video-caption">6 секунд · без звука · около 260 КБ</p>
          </div>
        </div>
      </section>

      <section className="section" id="estimate">
        <div className="wrap calc">
          <Reveal>
            <p className="kicker">Ориентир</p>
            <h2>Порядок цифр до сметы</h2>
            <p className="lede mt-5">
              Площадь и класс отделки дают вилку. Точная смета появляется после участка и программы комнат.
            </p>
            <p key={`${low}-${high}`} className="figure mt-6">
              {low}–{high} млн ₽
            </p>
            <p className="fine">
              {area} м² · {Math.round(rate.rate / 1000)} тыс. ₽ / м² · {rate.note} Это не оферта.
            </p>
            <svg className="plan" viewBox="0 0 220 130" role="img" aria-label="Схема объёма: жилое крыло и двор">
              <rect className="court" x="18" y="22" width={Math.max(wing - 20, 24)} height="36" />
              <rect x="12" y="16" width={wing} height="96" />
              <rect x={wing + 22} y="40" width={170 - wing} height="72" />
            </svg>
          </Reveal>
          <form className="calc-panel" onSubmit={(event) => event.preventDefault()}>
            <div className="field">
              <div className="range-label">Площадь дома · {area} м²</div>
              <input
                className="range"
                type="range"
                min={180}
                max={900}
                step={10}
                value={area}
                aria-label="Площадь дома"
                onChange={(event) => setArea(Number(event.target.value))}
              />
            </div>
            <div className="filters" role="radiogroup" aria-label="Класс отделки">
              {FINISHES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={finish === item.id}
                  className={`chip press${finish === item.id ? " is-on" : ""}`}
                  onClick={() => setFinish(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <a className="btn press" href="#contact">
              Прислать эту вилку архитектору
            </a>
          </form>
        </div>
      </section>

      <section className="section" id="contact">
        <div className="wrap contact">
          <div>
            <p className="kicker">Контакт</p>
            <h2>Расскажите про участок</h2>
            <p className="lede mt-5">
              Архитектор отвечает в рабочий день. Если участка ещё нет — напишите район и как хотите жить.
            </p>
            <address className="addr">
              AURELIA Atelier
              <br />
              Большой Знаменский переулок, 2
              <br />
              Москва
              <br />
              +7 495 120 48 10
            </address>
          </div>
          {sent ? (
            <div className="form ok" role="status">
              <h3 className="display display-sm">
                Заявка у архитектора.
              </h3>
              <p className="fine">Сохранили обращение в этом браузере. Перезвоним по номеру, который вы оставили.</p>
              <button
                type="button"
                className="btn btn-ghost press"
                onClick={() => {
                  setSent(false);
                  setName("");
                  setPhone("");
                  setPlace("");
                  setNote("");
                }}
              >
                Написать ещё
              </button>
            </div>
          ) : (
            <form className="form" onSubmit={submit} noValidate>
              <div className="field">
                <label htmlFor="name">Имя</label>
                <input id="name" name="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
                {errors.name ? <p className="err">{errors.name}</p> : null}
              </div>
              <div className="field">
                <label htmlFor="phone">Телефон</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+7"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
                {errors.phone ? <p className="err">{errors.phone}</p> : null}
              </div>
              <div className="field">
                <label htmlFor="place">Район или участок</label>
                <input id="place" name="place" value={place} onChange={(event) => setPlace(event.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="note">Коротко о доме</label>
                <textarea id="note" name="note" value={note} onChange={(event) => setNote(event.target.value)} />
              </div>
              <button className="btn press" type="submit">
                Отправить
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="site-foot">
        <div className="wrap foot-row">
          <a className="brand" href="#top">
            <Mark />
            <span className="brand-name">AURELIA</span>
          </a>
          <span>Ателье частных резиденций · Москва · {new Date().getFullYear()}</span>
        </div>
      </footer>

      {sheet ? (
        <>
          <button type="button" className={`sheet-back${sheet.phase === "in" ? " is-in" : ""}`} aria-label="Закрыть" onClick={dismiss} />
          <aside
            className={`sheet${sheet.phase === "in" ? " is-in" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className="sheet-top">
              <span className="kicker">{sheet.project.year}</span>
              <button type="button" className="sheet-close press" onClick={dismiss} aria-label="Закрыть карточку">
                ×
              </button>
            </div>
            <img src={sheet.project.image} alt="" width={960} height={640} />
            <h3 id={titleId}>{sheet.project.name}</h3>
            <p className="fine mt-0">
              {sheet.project.note}
            </p>
            <div className="specs">
              <div>
                <b>{sheet.project.area} м²</b>
                <span>площадь</span>
              </div>
              <div>
                <b>{sheet.project.place}</b>
                <span>участок</span>
              </div>
              <div>
                <b>{sheet.project.material}</b>
                <span>материал</span>
              </div>
              <div>
                <b>{sheet.project.months} мес.</b>
                <span>стройка</span>
              </div>
            </div>
            <button type="button" className="btn press" onClick={() => wantSimilar(sheet.project)}>
              Хочу в этом духе
            </button>
          </aside>
        </>
      ) : null}
    </main>
  );
}
