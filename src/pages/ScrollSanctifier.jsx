import { useCallback, useEffect, useRef, useState } from "react";
import { copyToClipboard } from "../utils/clipboard";

/** Virtual line height (px) — counting only, not DOM rows. */
const LINE_PX = 28;
const EXTEND_THRESHOLD_PX = 2800;
const EXTEND_CHUNK_PX = 5000;
/** ~36 lines ≈ 1k px scroll between encouragements (160 was ~4.5k px — felt broken). */
const MESSAGE_EVERY_LINES = 120;

const ENCOURAGEMENTS = [
  "The void nods. Keep going.",
  "That scroll has weight. Respect.",
  "Momentum is a kind of faith.",
  "You're doing great. Seriously.",
  "The pixels appreciate the attention.",
  "Steady. The sanctifier is watching (in a nice way).",
  "Every line is a tiny victory lap.",
  "Still here? That counts for something.",
  "Gravity called. You answered. Good.",
  "Somewhere a scrollbar feels useful today.",
  "The document lengthens; so does your legend.",
  "This is not procrastination. It is ceremony.",
  "Your thumb / wheel / trackpad salutes you.",
  "The abyss asked for a little more. You delivered.",
  "Certified scroll behavior: exemplary.",
  "If scrolling were a sport, you'd get a sticker.",
  "The fold was not ready for your curiosity.",
  "Keep descending. The header can't stop you.",
  "You and this page: a slow, beautiful agreement.",
  "The void whispers: 'nice inertia.'",
  "Pixel by pixel, you're winning nothing—and everything.",
  "That was a confident flick. The void noticed.",
  "Scroll depth: immeasurable. Vibes: intact.",
  "The sanctifier updates your file: still cool.",
  "No one asked for this dedication. That's why it matters.",
  "You're not lost. You're thorough.",
  "The bottom is a rumor. You're investigating.",
  "Smooth. Like butter on a long document.",
  "Your future self might not read this. The void will.",
  "Tenacity detected. Deploying mild pride.",
  "The margin thanks you for your patronage.",
  "If this were a meeting, you'd still be the MVP.",
  "The scrollbar grew up wanting to be you.",
  "Descent approved. Ascent optional.",
  "You're giving this page the attention it never earned.",
  "The universe prefers people who finish their scroll.",
  "Another milestone. The void sends a thumbs-up (conceptually).",
  "Keep going—the certificate is shy, not absent.",
  "You've crossed an invisible line. It tickles.",
  "This scroll has narrative tension. You're the protagonist.",
  "The void rates this session: surprisingly wholesome.",
  "Rubber duck debugging, but the duck is the abyss.",
  "Your scroll history could write poetry. Rough drafts only.",
  "The footer is flattered. It doesn't show it.",
  "Stamina: noted. Sarcasm: withheld.",
  "If boredom knocked, you weren't home.",
  "The sanctifier blinks once. That means respect.",
];

const MISSION_MESSAGE =
  "I'm glad you stuck to the mission, keep it up";

function buildCertificate(lines, voided) {
  const d = new Date().toLocaleString();
  if (voided) {
    return [
      "══════════════════════════════════════",
      "     DEVKIT SCROLL DEPTH SANCTIFIER",
      "══════════════════════════════════════",
      "",
      "STATUS: VOID",
      "",
      "The bearer scrolled all this way, then reached for",
      '"return to top" without returning. The achievement',
      "was questioned. This document is null and extremely",
      "judgmental about it.",
      "",
      `Last recorded line count: ${lines.toLocaleString()}`,
      `Recorded at: ${d}`,
      "",
      "Seal: ◇ VOIDED ◇",
      "══════════════════════════════════════",
    ].join("\n");
  }
  return [
    "══════════════════════════════════════",
    "     DEVKIT SCROLL DEPTH SANCTIFIER",
    "══════════════════════════════════════",
    "",
    `This certifies that the bearer has honored`,
    `this journey with ${lines.toLocaleString()} lines`,
    `of scroll (virtual ${LINE_PX}px lines).`,
    "",
    "Witnessed by: the scroll event loop",
    `Recorded at: ${d}`,
    "",
    "Seal: ◇ VOID APPROVED ◇",
    "══════════════════════════════════════",
  ].join("\n");
}

function newMessageId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function InlineScrollMessage({ id, topPx, text, onLeftViewport }) {
  const elRef = useRef(null);
  const [entered, setEntered] = useState(false);
  const wasVisibleRef = useRef(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          wasVisibleRef.current = true;
          setEntered(true);
        } else if (wasVisibleRef.current) {
          onLeftViewport(id);
        }
      },
      {
        root: null,
        threshold: 0.02,
        rootMargin: "0px 0px -8px 0px",
      },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [id, onLeftViewport]);

  return (
    <div
      ref={elRef}
      className="absolute left-0 right-0 flex justify-center px-4 pointer-events-auto"
      style={{ top: topPx }}
    >
      <div
        className={`w-full max-w-3xl py-3 px-4 rounded-md bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm font-mono text-xs text-stone-800 dark:text-stone-200 transition-[transform,opacity] duration-500 ease-out motion-reduce:transition-none motion-reduce:translate-y-0 motion-reduce:opacity-100 ${
          entered ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
        role="note"
      >
        {text}
      </div>
    </div>
  );
}

export default function ScrollSanctifier({ onToast }) {
  const [lines, setLines] = useState(0);
  const [scrollingUp, setScrollingUp] = useState(false);
  const [scrollableHeight, setScrollableHeight] = useState(() =>
    typeof window !== "undefined" ? Math.max(window.innerHeight * 10, 12000) : 12000,
  );
  const [inlineMessages, setInlineMessages] = useState([]);
  const [certVoided, setCertVoided] = useState(false);

  const trackRef = useRef(null);
  const lastYRef = useRef(0);
  const rafRef = useRef(0);
  const lastSegmentRef = useRef(-1);
  const missionPendingRef = useRef(false);
  const initializedRef = useRef(false);

  const removeMessage = useCallback((id) => {
    setInlineMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const pushMessage = useCallback((text) => {
    requestAnimationFrame(() => {
      const track = trackRef.current;
      if (!track) return;
      const trackTopDoc = track.getBoundingClientRect().top + window.scrollY;
      // Place just below the viewport so the user reveals it by scrolling down (enters from bottom)
      const viewportBottomDoc = window.scrollY + window.innerHeight;
      const gapBelowViewport = 56;
      const topPx = Math.max(0, viewportBottomDoc - trackTopDoc + gapBelowViewport);
      setInlineMessages((prev) => [
        ...prev,
        { id: newMessageId(), topPx, text },
      ]);
    });
  }, []);

  const tickScroll = useCallback(() => {
    const y = window.scrollY;
    const prev = lastYRef.current;
    const delta = y - prev;
    lastYRef.current = y;

    if (delta < -0.5) setScrollingUp(true);
    else if (delta > 0.5) setScrollingUp(false);

    const lineCount = Math.max(0, Math.floor(y / LINE_PX));
    setLines(lineCount);

    let blockedSegment = false;

    if (missionPendingRef.current && Math.abs(delta) > 0.5) {
      missionPendingRef.current = false;
      pushMessage(MISSION_MESSAGE);
      blockedSegment = true;
    }

    if (
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - EXTEND_THRESHOLD_PX
    ) {
      setScrollableHeight((h) => h + EXTEND_CHUNK_PX);
    }

    if (!blockedSegment) {
      const segment = Math.floor(lineCount / MESSAGE_EVERY_LINES);
      if (segment > lastSegmentRef.current && lineCount > 0) {
        lastSegmentRef.current = segment;
        const text =
          ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
        pushMessage(text);
      }
    }
  }, [pushMessage]);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "auto";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        tickScroll();
      });
    };

    if (!initializedRef.current) {
      initializedRef.current = true;
      lastYRef.current = window.scrollY;
      tickScroll();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [tickScroll]);

  useEffect(() => {
    return () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };
  }, []);

  const cert = buildCertificate(lines, certVoided);

  const handleFakeReturnToTop = () => {
    setCertVoided(true);
    missionPendingRef.current = true;
    onToast?.(
      'You scrolled all this way just to undo your achievement! Certificate will be void. (We did not scroll to top.)',
    );
  };

  const handleGetCertificate = () => {
    copyToClipboard(cert, () => onToast?.("Certificate copied."));
  };

  return (
    <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="fixed top-16 left-0 right-0 z-30 border-b border-stone-200 dark:border-stone-800 bg-stone-100/95 dark:bg-stone-900/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="font-mono text-sm tabular-nums min-w-0">
            <span className="text-stone-500 dark:text-stone-400">Lines scrolled: </span>
            <span
              className={
                scrollingUp
                  ? "font-bold text-red-600 dark:text-red-400"
                  : "font-bold text-stone-900 dark:text-stone-100"
              }
            >
              {lines.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleGetCertificate}
              className="px-3 py-1.5 font-mono text-xs border border-stone-900 dark:border-stone-100 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 hover:opacity-90"
            >
              Get certificate
            </button>
            <button
              type="button"
              onClick={handleFakeReturnToTop}
              className="px-3 py-1.5 font-mono text-xs border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800"
            >
              Return to top
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto pt-[5.5rem] px-4 sm:px-0 pb-8">
        <header className="mb-10 text-center space-y-4">
          <p className="text-[10px] sm:text-[11px] font-mono tracking-[0.35em] text-stone-500 dark:text-stone-500 uppercase">
            Rite of descent
          </p>
          <h2 className="text-5xl sm:text-6xl font-black tracking-tight text-stone-900 dark:text-stone-50 leading-none">
            Scroll sanctifier
          </h2>
          <p className="text-sm sm:text-base font-mono text-stone-600 dark:text-stone-400 leading-relaxed max-w-2xl mx-auto">
            The abyss below has no floor—only appetite. It lengthens as you
            near its threshold, swallowing distance on your behalf. The tally
            hungers for downward resolve: climb backward and the count
            withers, the runes burn{" "}
            <span className="text-red-600 dark:text-red-400 font-semibold">
              red
            </span>
            ; descend again and the flame of judgment cools.
          </p>
        </header>

        <div className="bg-stone-950 text-stone-100 p-8 sm:p-10 border border-stone-700 dark:border-stone-600 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] space-y-5">
          <p className="font-serif text-lg sm:text-xl leading-snug text-stone-100 italic">
            You are witnessed. Every line surrendered to the fall is etched
            into nothing—and that nothing is enough. Whispers may rise from the
            dark: benedictions, taunts, the void pretending to care. They are
            not chained to the earth; look away, scroll past, and they dissolve
            like breath on glass.
          </p>
          <p className="font-mono text-xs sm:text-sm text-stone-400 leading-relaxed border-t border-stone-700 pt-5">
            When your pilgrimage feels sufficient, seal it in ink: claim your
            certificate. Should you swear an oath to the summit before your
            covenant is complete—know that some doors open only to mock the
            hand that knocks.
          </p>
        </div>
      </div>

      <div
        ref={trackRef}
        className="relative w-full isolate"
        style={{ height: scrollableHeight }}
      >
        {inlineMessages.map((m) => (
          <InlineScrollMessage
            key={m.id}
            id={m.id}
            topPx={m.topPx}
            text={m.text}
            onLeftViewport={removeMessage}
          />
        ))}
      </div>
    </div>
  );
}
