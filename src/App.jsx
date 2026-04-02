import { useState, useCallback, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

const PasswordGenerator = lazy(() => import("./pages/PasswordGenerator"));
const UuidGenerator = lazy(() => import("./pages/UuidGenerator"));
const TimestampGenerator = lazy(() => import("./pages/TimestampGenerator"));
const PersonaGenerator = lazy(() => import("./pages/PersonaGenerator"));
const JsonFormatter = lazy(() => import("./pages/JsonFormatter"));
const Base64Encoder = lazy(() => import("./pages/Base64Encoder"));
const UrlEncoder = lazy(() => import("./pages/UrlEncoder"));
const JwtDebugger = lazy(() => import("./pages/JwtDebugger"));
const HttpStatusCodes = lazy(() => import("./pages/HttpStatusCodes"));
const LoremIpsum = lazy(() => import("./pages/LoremIpsum"));
const ColorConverter = lazy(() => import("./pages/ColorConverter"));
const HtmlEntityEncoder = lazy(() => import("./pages/HtmlEntityEncoder"));
const WhatsMyIp = lazy(() => import("./pages/WhatsMyIp"));
const Base64Image = lazy(() => import("./pages/Base64Image"));
const HashGenerator = lazy(() => import("./pages/HashGenerator"));
const CssGenerator = lazy(() => import("./pages/CssGenerator"));
const GradientBuilder = lazy(() => import("./pages/GradientBuilder"));
const CrontabGenerator = lazy(() => import("./pages/CrontabGenerator"));
const TailwindSearch = lazy(() => import("./pages/TailwindSearch"));
const RegexTester = lazy(() => import("./pages/RegexTester"));
const MarkdownConverter = lazy(() => import("./pages/MarkdownConverter"));
const MarkdownViewer = lazy(() => import("./pages/MarkdownViewer"));
const GridTemplateBuilder = lazy(() => import("./pages/GridTemplateBuilder"));
const PerfectBorderGenerator = lazy(() => import("./pages/PerfectBorderGenerator"));
const QrCodeGenerator = lazy(() => import("./pages/QrCodeGenerator"));
const SlugGenerator = lazy(() => import("./pages/SlugGenerator"));
const YamlJsonConverter = lazy(() => import("./pages/YamlJsonConverter"));
const CsvJsonConverter = lazy(() => import("./pages/CsvJsonConverter"));
const GitCheatsheet = lazy(() => import("./pages/GitCheatsheet"));
const MetaTagGenerator = lazy(() => import("./pages/MetaTagGenerator"));
const SqlFormatter = lazy(() => import("./pages/SqlFormatter"));
const PasswordHash = lazy(() => import("./pages/PasswordHash"));
const FaviconGenerator = lazy(() => import("./pages/FaviconGenerator"));
const HexConverter = lazy(() => import("./pages/HexConverter"));
const EscapeUnescape = lazy(() => import("./pages/EscapeUnescape"));
const AsciiUnicodeTable = lazy(() => import("./pages/AsciiUnicodeTable"));
const UrlParser = lazy(() => import("./pages/UrlParser"));
const MorseCode = lazy(() => import("./pages/MorseCode"));
const Strobo = lazy(() => import("./pages/Strobo"));
const ExistentialTimer = lazy(() => import("./pages/ExistentialTimer"));
const ClickCounter = lazy(() => import("./pages/ClickCounter"));
const LocalNotes = lazy(() => import("./pages/LocalNotes"));
const TimezoneConverter = lazy(() => import("./pages/TimezoneConverter"));
const Stopwatch = lazy(() => import("./pages/Stopwatch"));
const CountdownTimer = lazy(() => import("./pages/CountdownTimer"));

export default function App() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  return (
    <Routes>
      <Route element={<Layout toast={toast} />}>
        <Route index element={<PasswordGenerator onToast={showToast} />} />
        <Route path="uuid" element={<UuidGenerator onToast={showToast} />} />
        <Route
          path="timestamp"
          element={<TimestampGenerator onToast={showToast} />}
        />
        <Route
          path="persona"
          element={<PersonaGenerator onToast={showToast} />}
        />
        <Route path="json" element={<JsonFormatter onToast={showToast} />} />
        <Route path="base64" element={<Base64Encoder onToast={showToast} />} />
        <Route path="url" element={<UrlEncoder onToast={showToast} />} />
        <Route path="jwt" element={<JwtDebugger onToast={showToast} />} />
        <Route path="http-status" element={<HttpStatusCodes />} />
        <Route path="lorem" element={<LoremIpsum onToast={showToast} />} />
        <Route path="color" element={<ColorConverter onToast={showToast} />} />
        <Route
          path="html-entity"
          element={<HtmlEntityEncoder onToast={showToast} />}
        />
        <Route path="ip" element={<WhatsMyIp onToast={showToast} />} />
        <Route path="base64-image" element={<Base64Image onToast={showToast} />} />
        <Route path="hash" element={<HashGenerator onToast={showToast} />} />
        <Route path="css-generator" element={<CssGenerator onToast={showToast} />} />
        <Route path="gradient-builder" element={<GradientBuilder onToast={showToast} />} />
        <Route path="crontab" element={<CrontabGenerator onToast={showToast} />} />
        <Route path="tailwind" element={<TailwindSearch onToast={showToast} />} />
        <Route path="regex" element={<RegexTester onToast={showToast} />} />
        <Route path="markdown" element={<MarkdownConverter onToast={showToast} />} />
        <Route path="markdown-viewer" element={<MarkdownViewer />} />
        <Route path="grid" element={<GridTemplateBuilder onToast={showToast} />} />
        <Route
          path="perfect-border"
          element={<PerfectBorderGenerator onToast={showToast} />}
        />
        <Route path="qr" element={<QrCodeGenerator onToast={showToast} />} />
        <Route path="slug" element={<SlugGenerator onToast={showToast} />} />
        <Route path="yaml-json" element={<YamlJsonConverter onToast={showToast} />} />
        <Route path="csv-json" element={<CsvJsonConverter onToast={showToast} />} />
        <Route path="git-cheatsheet" element={<GitCheatsheet onToast={showToast} />} />
        <Route path="meta-tags" element={<MetaTagGenerator onToast={showToast} />} />
        <Route path="sql-formatter" element={<SqlFormatter onToast={showToast} />} />
        <Route path="password-hash" element={<PasswordHash onToast={showToast} />} />
        <Route path="icon" element={<FaviconGenerator onToast={showToast} />} />
        <Route path="hex-converter" element={<HexConverter onToast={showToast} />} />
        <Route path="escape" element={<EscapeUnescape onToast={showToast} />} />
        <Route path="ascii-table" element={<AsciiUnicodeTable onToast={showToast} />} />
        <Route path="url-parser" element={<UrlParser onToast={showToast} />} />
        <Route path="morse" element={<MorseCode onToast={showToast} />} />
        <Route path="strobo" element={<Strobo />} />
        <Route path="existential-timer" element={<ExistentialTimer />} />
        <Route path="click-counter" element={<ClickCounter />} />
        <Route path="local-notes" element={<LocalNotes onToast={showToast} />} />
        <Route path="timezone-converter" element={<TimezoneConverter />} />
        <Route path="stopwatch" element={<Stopwatch />} />
        <Route path="countdown" element={<CountdownTimer />} />
      </Route>
    </Routes>
  );
}
