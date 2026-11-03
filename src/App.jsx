import { useEffect, useRef, useState } from "react";
import { BotanicalCorners, ItemIcon, Jar, Moli, TarotArt } from "./art.jsx";
import {
  MOODS,
  TAROTS,
  generateReading,
  getSavedReading,
  saveReading,
} from "./data.js";
import { generateFortuneImage } from "./fortune-image.js";

const heart = "♡";
const formatDate = (date) =>
  new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);

function Clover({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 20C-2 22 6 1 16 9l4 7c-4-22 23-13 13-3l-9 7c22-4 14 22 3 13l-7-9c4 22-22 14-13 3l9-7Z"
        fill="currentColor"
      />
      <path
        d="M20 22q8 9 4 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TouchMoli({ state = "happy", jar = false, className = "" }) {
  const [spark, setSpark] = useState(0);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  function tap() {
    setSpark((s) => s + 1);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSpark(0), 900);
  }
  return (
    <button
      type="button"
      className={`moli-touch ${className} ${spark ? "is-delighted" : ""}`}
      onClick={tap}
      aria-label="Give MOLI a little love"
    >
      {jar ? (
        <Jar state={spark ? "excited" : state} />
      ) : (
        <Moli state={spark ? "excited" : state} />
      )}
      {!!spark && (
        <span className="tap-sparkles" key={spark} aria-hidden="true">
          <i>✦</i>
          <i>♡</i>
          <i>✧</i>
        </span>
      )}
    </button>
  );
}

function Progress({ screen }) {
  const active = { mood: 0, tarot: 1, result: 2 }[screen];
  return (
    <nav className="progress" aria-label="Reading progress">
      {["Check in", "Find your card", "Your little luck"].map((label, i) => (
        <span
          key={label}
          aria-current={i === active ? "step" : undefined}
          className={i === active ? "active" : i < active ? "complete" : ""}
        >
          <b>{i < active ? "✓" : `0${i + 1}`}</b>
          <span>{label}</span>
        </span>
      ))}
    </nav>
  );
}

function SaveModal({ reading, art, close }) {
  const [url, setUrl] = useState("");
  const [blob, setBlob] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sharing, setSharing] = useState(false);
  const panel = useRef();
  const filename = `moli-lucky-day-${reading.date}.png`;
  useEffect(() => {
    let alive = true;
    let objectUrl;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    generateFortuneImage(reading, art)
      .then((image) => {
        if (!alive) return;
        objectUrl = URL.createObjectURL(image);
        setBlob(image);
        setUrl(objectUrl);
      })
      .catch(
        () =>
          alive &&
          setError(
            "Your image couldn’t be created. Please close this window and try again.",
          ),
      );
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [reading, art]);
  function onKeyDown(event) {
    if (event.key === "Escape") close();
    if (event.key === "Tab") {
      const items = [
        ...panel.current.querySelectorAll("button:not(:disabled), a[href]"),
      ];
      if (!items.length) return;
      if (
        event.shiftKey &&
        (document.activeElement === items[0] ||
          document.activeElement === panel.current)
      ) {
        event.preventDefault();
        items.at(-1).focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === items.at(-1) ||
          document.activeElement === panel.current)
      ) {
        event.preventDefault();
        items[0].focus();
      }
    }
  }
  async function share() {
    setNotice("");
    setSharing(true);
    try {
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "MOLI’s Lucky Day",
          text: "A little luck & comfort, just for you.",
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: "MOLI’s Lucky Day",
          text: "Find your own little moment of magic with MOLI.",
          url: window.location.href,
        });
        setNotice(
          "Game link shared. Download your image to share your reading, too.",
        );
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
        setNotice(
          "Game link copied! Download your image to share your reading.",
        );
      } else {
        setNotice(
          "Download your image below, then attach it in your favorite app.",
        );
      }
    } catch (err) {
      if (err.name !== "AbortError")
        setNotice(
          "Sharing isn’t available here. Download the image or press and hold its preview to save it.",
        );
    } finally {
      setSharing(false);
    }
  }
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <section
        className="save-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-title"
        tabIndex={-1}
        ref={panel}
        onKeyDown={onKeyDown}
      >
        <button
          className="close-button"
          onClick={close}
          aria-label="Close save preview"
        >
          ×
        </button>
        <p className="eyebrow">A LITTLE KEEPSAKE</p>
        <h2 id="save-title">Take your luck with you.</h2>
        <p className="modal-description">
          Made for your story. Saved from your reading.
        </p>
        <div className="image-preview">
          {url ? (
            <img
              src={url}
              alt={`Your personalized MOLI fortune for ${reading.date}`}
              width="1080"
              height="1920"
            />
          ) : (
            <p role="status">{error || "Gathering a little magic…"}</p>
          )}
        </div>
        {url && (
          <>
            <a className="button primary" href={url} download={filename}>
              Download image <span aria-hidden="true">↓</span>
            </a>
            <button
              className="button secondary"
              disabled={sharing}
              onClick={share}
            >
              {sharing ? "Opening share…" : "Share My Luck"}{" "}
              <span aria-hidden="true">↗</span>
            </button>
            <p className="save-hint">
              1080 × 1920 PNG · On iPhone, you can also press and hold the image
              to save it.
            </p>
          </>
        )}
        <p className="share-notice" role="status">
          {notice || error}
        </p>
      </section>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [mood, setMood] = useState(null);
  const [reading, setReading] = useState(null);
  const [saved, setSaved] = useState(() => getSavedReading());
  const [selectedCard, setSelectedCard] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [saveArt, setSaveArt] = useState(null);
  const [storageNotice, setStorageNotice] = useState("");
  const heading = useRef();
  const drawLock = useRef(false);
  const flipTimer = useRef();
  const resultArt = useRef();
  const companionArt = useRef();
  const recommendationsArt = useRef();
  const activeMood = MOODS.find((m) => m.id === mood);
  const tarot = TAROTS.find((t) => t.id === reading?.tarot);
  const resultMood = MOODS.find((m) => m.id === reading?.mood);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [screen]);
  useEffect(() => () => clearTimeout(flipTimer.current), []);

  function restart() {
    clearTimeout(flipTimer.current);
    drawLock.current = false;
    setSelectedCard(null);
    setRevealed(false);
    setMood(null);
    setReading(null);
    setSaveArt(null);
    setStorageNotice("");
    setScreen("mood");
  }
  function draw(index) {
    if (drawLock.current || !mood) return;
    drawLock.current = true;
    const next = generateReading(mood);
    setReading(next);
    setSelectedCard(index);
    flipTimer.current = setTimeout(() => setRevealed(true), 850);
  }
  function showResult() {
    if (!reading || !revealed) return;
    if (!saveReading(reading))
      setStorageNotice(
        "Your browser couldn’t store this reading. You can still save it as an image.",
      );
    else setSaved(reading);
    setScreen("result");
  }
  function revisit() {
    const current = getSavedReading();
    if (current) {
      setReading(current);
      setMood(current.mood);
      setScreen("result");
    } else {
      setSaved(null);
      restart();
    }
  }
  function save() {
    const moliSvg = companionArt.current?.querySelector("svg")?.outerHTML;
    const tarotSvg = resultArt.current?.querySelector("svg")?.outerHTML;
    const itemSvgs = Object.fromEntries(
      ["outfit", "food", "charm"].map((type) => [
        type,
        recommendationsArt.current?.querySelector(`[data-export="${type}"]`)
          ?.outerHTML,
      ]),
    );
    setSaveArt({ moliSvg, tarotSvg, itemSvgs });
  }

  return (
    <div className={`app screen-${screen}`}>
      <BotanicalCorners />
      <header className="site-header">
        <a
          className="brand"
          href="./"
          onClick={(e) => {
            e.preventDefault();
            setScreen("welcome");
          }}
          aria-label="MOLI’s Lucky Day home"
        >
          <Clover />
          <span>
            MOLI<span className="brand-dot">.</span>
          </span>
        </a>
        <span className="header-note">Small rituals. Lovely days.</span>
        <span className="date-badge">
          <span className="status-dot" />
          {formatDate(new Date())}
        </span>
      </header>
      <main className="main-content">
        {screen !== "welcome" && <Progress screen={screen} />}
        {screen === "welcome" && (
          <section
            className="welcome screen-enter"
            aria-labelledby="page-title"
          >
            <div className="welcome-copy">
              <p className="eyebrow">
                <span aria-hidden="true">✦</span> A LITTLE MOMENT OF MAGIC
              </p>
              <h1 ref={heading} tabIndex={-1} id="page-title">
                MOLI’s
                <br />
                <em>Lucky Day</em>
                <span className="title-spark" aria-hidden="true">
                  ✧
                </span>
              </h1>
              <p className="tagline">
                Your Daily Dose of
                <br className="mobile-break" /> Luck &amp; Comfort
              </p>
              <p className="welcome-description">
                A tiny friend. A thoughtful card.
                <br />A little reminder that good things are growing.
              </p>
              <button className="button primary welcome-cta" onClick={restart}>
                Find My Luck <span aria-hidden="true">{heart}</span>
              </button>
              {saved && (
                <button
                  className="text-button previous-reading"
                  onClick={revisit}
                >
                  Revisit today’s reading <span aria-hidden="true">↗</span>
                </button>
              )}
              <div className="welcome-footnote">
                <span aria-hidden="true">✧</span> Just a minute for you. No
                right or wrong answers.
              </div>
            </div>
            <div className="welcome-art">
              <div className="sun-halo" />
              <span className="art-star star-one" aria-hidden="true">
                ✧
              </span>
              <span className="art-star star-two" aria-hidden="true">
                ✦
              </span>
              <span className="handwritten jar-note">
                a little luck,
                <br />
                bottled with love <span aria-hidden="true">↘</span>
              </span>
              <TouchMoli jar className="hero-jar" />
              <span className="jar-caption">
                <span />
                Meet MOLI, your little marimo companion
                <span />
              </span>
              <span className="tap-caption">psst… tap MOLI to say hello ♡</span>
            </div>
          </section>
        )}

        {screen === "mood" && (
          <section
            className="mood-screen screen-enter"
            aria-labelledby="page-title"
          >
            <div className="section-heading">
              <p className="eyebrow">FIRST, A LITTLE CHECK-IN</p>
              <h1 ref={heading} tabIndex={-1} id="page-title">
                Hey there!
                <br />
                <em>How are you feeling today?</em>
              </h1>
              <p>Whatever it is, there’s room for it here.</p>
            </div>
            <div
              className="mood-grid"
              role="group"
              aria-label="Choose how you feel"
            >
              {MOODS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`mood-card ${mood === item.id ? "selected" : ""}`}
                  aria-pressed={mood === item.id}
                  onClick={() => setMood(item.id)}
                >
                  <span className="mood-selection" aria-hidden="true">
                    {mood === item.id ? "✓" : "+"}
                  </span>
                  <Moli state={item.state} />
                  <span className="mood-label">{item.label}</span>
                  <span className="mood-detail">
                    {
                      {
                        happy: "A little sunshine",
                        anxious: "A busy little mind",
                        tired: "Running on soft mode",
                        lost: "Finding my own way",
                      }[item.id]
                    }
                  </span>
                </button>
              ))}
            </div>
            <div
              className={`mood-comfort ${mood ? "has-mood" : ""}`}
              role="status"
            >
              <span aria-hidden="true">♡</span>
              {activeMood?.message ||
                "MOLI is here for you. All feelings are welcome."}
            </div>
            <button
              className="button primary continue-button"
              disabled={!mood}
              onClick={() => setScreen("tarot")}
            >
              Continue <span aria-hidden="true">→</span>
            </button>
            <p className="tiny-note">
              A little honesty is a lovely place to start.
            </p>
          </section>
        )}

        {screen === "tarot" && (
          <section
            className="tarot-screen screen-enter"
            aria-labelledby="page-title"
          >
            <div className="section-heading">
              <p className="eyebrow">LET A LITTLE MAGIC FIND YOU</p>
              <h1 ref={heading} tabIndex={-1} id="page-title">
                Pick your
                <br />
                <em>magic card.</em>
              </h1>
              <p>
                {selectedCard === null
                  ? "Take a soft breath. Trust your intuition."
                  : revealed
                    ? "A little message, just for this moment."
                    : "Your little message is on its way…"}
              </p>
            </div>
            <div
              className={`card-spread ${selectedCard !== null ? "has-drawn" : ""}`}
              role="group"
              aria-label="Pick one magic tarot card"
            >
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  className={`tarot-pick card-${index} ${selectedCard === index ? "chosen" : ""}`}
                  disabled={selectedCard !== null}
                  aria-label={
                    selectedCard === index && tarot
                      ? `Your card: ${tarot.name}`
                      : `Choose magic card ${index + 1}`
                  }
                  onClick={() => draw(index)}
                >
                  <div
                    className={`card-flipper ${selectedCard === index ? "is-flipped" : ""}`}
                  >
                    <div className="card-face card-back">
                      <div className="card-border">
                        <span className="card-corner top-left">✧</span>
                        <span className="card-corner top-right">✦</span>
                        <span className="card-moon">☾</span>
                        <svg
                          className="card-sun"
                          viewBox="0 0 100 120"
                          aria-hidden="true"
                        >
                          <path
                            d="M50 0 57 48 94 18 66 57 100 60 65 66 85 103 56 76 50 120 44 76 15 103 35 66 0 60 34 57 6 18 43 48Z"
                            fill="currentColor"
                          />
                          <circle cx="50" cy="60" r="12" fill="#fff4c0" />
                        </svg>
                        <span className="card-orbit" />
                        <span className="card-corner bottom-left">✦</span>
                        <span className="card-corner bottom-right">✧</span>
                        <span className="card-brand">M O L I</span>
                      </div>
                    </div>
                    <div className="card-face card-front">
                      {selectedCard === index && tarot && (
                        <TarotArt id={tarot.id} />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="draw-message" role="status" aria-live="polite">
              {revealed && tarot ? (
                <>
                  <p className="eyebrow">{tarot.theme}</p>
                  <h2>{tarot.name}</h2>
                  <p>“{tarot.message}”</p>
                </>
              ) : (
                <>
                  <TouchMoli
                    state={activeMood?.state || "calm"}
                    className="tarot-companion"
                  />
                  <p className="handwritten">
                    The card you need will find you.
                  </p>
                </>
              )}
            </div>
            {revealed && (
              <button
                className="button primary reveal-button"
                onClick={showResult}
              >
                Reveal My Luck <span aria-hidden="true">✦</span>
              </button>
            )}
            <p className="tiny-note">
              A gentle reflection, never a prediction.
            </p>
          </section>
        )}

        {screen === "result" && reading && tarot && (
          <section
            className="result-screen screen-enter"
            aria-labelledby="page-title"
          >
            <div className="section-heading">
              <p className="eyebrow">A POCKETFUL OF POSSIBILITIES</p>
              <h1 ref={heading} tabIndex={-1} id="page-title">
                Your lucky <em>guide.</em>
                <span className="heading-heart" aria-hidden="true">
                  ♡
                </span>
              </h1>
              <p>
                {formatDate(new Date(`${reading.date}T12:00:00`))} · Made just
                for you
              </p>
            </div>
            <div className="fortune-panel">
              <div className="tarot-summary">
                <div className="result-tarot" ref={resultArt}>
                  <TarotArt id={tarot.id} />
                </div>
                <div className="tarot-summary-copy">
                  <p className="eyebrow">TODAY’S TAROT</p>
                  <h2>{tarot.name}</h2>
                  <span className="theme-label">{tarot.theme}</span>
                  <p className="tarot-quote">“{tarot.message}”</p>
                  <p className="interpretation">{tarot.interpretation}</p>
                </div>
              </div>
              <div className="moli-message">
                <div className="result-companion" ref={companionArt}>
                  <TouchMoli state="comforting" />
                </div>
                <div>
                  <span className="eyebrow">A LITTLE NOTE FROM MOLI</span>
                  <p>{resultMood.comfort}</p>
                  <span className="message-signature">
                    Always rooting for you. ♡
                  </span>
                </div>
              </div>
              <div className="lucky-grid" ref={recommendationsArt}>
                <div className="lucky-tile">
                  <span className="tile-label">Lucky color</span>
                  <span
                    className="color-swatch"
                    style={{ "--swatch": reading.color.hex }}
                  />
                  <strong>{reading.color.name}</strong>
                </div>
                <div className="lucky-tile">
                  <span className="tile-label">Lucky outfit</span>
                  <ItemIcon
                    data-export="outfit"
                    type="outfit"
                    value={reading.outfit}
                  />
                  <strong>{reading.outfit}</strong>
                </div>
                <div className="lucky-tile">
                  <span className="tile-label">Lucky food</span>
                  <ItemIcon
                    data-export="food"
                    type="food"
                    value={reading.food}
                  />
                  <strong>{reading.food}</strong>
                </div>
                <div className="lucky-tile">
                  <span className="tile-label">Lucky charm</span>
                  <ItemIcon
                    data-export="charm"
                    type="charm"
                    value={reading.charm}
                  />
                  <strong>{reading.charm}</strong>
                </div>
                <div className="lucky-tile tip-tile">
                  <span className="tile-label">Today’s tip</span>
                  <svg viewBox="0 0 64 64" aria-hidden="true">
                    <path
                      d="M32 56V29M32 39C3 41 8 12 12 14q23-1 20 25ZM32 30C30 6 56 7 56 11q0 19-24 19Z"
                      fill="#b7cb7e"
                      stroke="#6c8946"
                      strokeWidth="2"
                    />
                  </svg>
                  <strong>{reading.tip}</strong>
                </div>
                <div className="lucky-tile energy-tile">
                  <span className="tile-label">Lucky energy</span>
                  <span
                    className="energy-stars"
                    role="img"
                    aria-label={`${reading.energy} out of 5 stars`}
                  >
                    {"★".repeat(reading.energy)}
                    <span>{"☆".repeat(5 - reading.energy)}</span>
                  </span>
                  <strong>
                    {
                      {
                        3: "Quietly blooming",
                        4: "A lovely little glow",
                        5: "Full of possibility",
                      }[reading.energy]
                    }
                  </strong>
                </div>
              </div>
              <div className="result-actions">
                <button className="button primary" onClick={save}>
                  Save My Luck <span aria-hidden="true">♡</span>
                </button>
                <button className="button secondary" onClick={restart}>
                  Try Again <span aria-hidden="true">↻</span>
                </button>
              </div>
              {storageNotice && (
                <p className="storage-notice" role="status">
                  {storageNotice}
                </p>
              )}
              <p className="saved-note">
                {storageNotice
                  ? "A little keepsake for this moment. Save the image to keep it."
                  : "Your little luck, saved for today on this device."}
              </p>
            </div>
            <p className="tiny-note">
              Keep what feels good. Let the rest float away.
            </p>
          </section>
        )}
      </main>
      <footer className="site-footer">
        <span className="footer-flower" aria-hidden="true">
          ✿
        </span>
        <p>A little play. A little comfort. A little you.</p>
        <span className="footer-legal">
          For fun &amp; self-reflection · An independent, unofficial portfolio
          concept
        </span>
      </footer>
      {saveArt && reading && (
        <SaveModal
          reading={reading}
          art={saveArt}
          close={() => setSaveArt(null)}
        />
      )}
    </div>
  );
}
