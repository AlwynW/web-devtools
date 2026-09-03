import { useState, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import { lazyTool } from "./utils/lazyTool";

const PasswordGenerator = lazyTool(() => import("./pages/PasswordGenerator"));
const UuidGenerator = lazyTool(() => import("./pages/UuidGenerator"));
const TimestampGenerator = lazyTool(() => import("./pages/TimestampGenerator"));
const PersonaGenerator = lazyTool(() => import("./pages/PersonaGenerator"));
const JsonFormatter = lazyTool(() => import("./pages/JsonFormatter"));
const JsonTreeEditor = lazyTool(() => import("./pages/JsonTreeEditor"));
const Base64Encoder = lazyTool(() => import("./pages/Base64Encoder"));
const UrlEncoder = lazyTool(() => import("./pages/UrlEncoder"));
const JwtDebugger = lazyTool(() => import("./pages/JwtDebugger"));
const HttpStatusCodes = lazyTool(() => import("./pages/HttpStatusCodes"));
const LoremIpsum = lazyTool(() => import("./pages/LoremIpsum"));
const ColorConverter = lazyTool(() => import("./pages/ColorConverter"));
const HtmlEntityEncoder = lazyTool(() => import("./pages/HtmlEntityEncoder"));
const WhatsMyIp = lazyTool(() => import("./pages/WhatsMyIp"));
const Base64Image = lazyTool(() => import("./pages/Base64Image"));
const HashGenerator = lazyTool(() => import("./pages/HashGenerator"));
const CssGenerator = lazyTool(() => import("./pages/CssGenerator"));
const GradientBuilder = lazyTool(() => import("./pages/GradientBuilder"));
const TextGradientCreator = lazyTool(() => import("./pages/TextGradientCreator"));
const GradientBorderGenerator = lazyTool(() => import("./pages/GradientBorderGenerator"));
const CrontabGenerator = lazyTool(() => import("./pages/CrontabGenerator"));
const TailwindSearch = lazyTool(() => import("./pages/TailwindSearch"));
const RegexTester = lazyTool(() => import("./pages/RegexTester"));
const MarkdownConverter = lazyTool(() => import("./pages/MarkdownConverter"));
const MarkdownViewer = lazyTool(() => import("./pages/MarkdownViewer"));
const GridTemplateBuilder = lazyTool(() => import("./pages/GridTemplateBuilder"));
const CssGridComposer = lazyTool(() => import("./pages/CssGridComposer"));
const PerfectBorderGenerator = lazyTool(() => import("./pages/PerfectBorderGenerator"));
const QrCodeGenerator = lazyTool(() => import("./pages/QrCodeGenerator"));
const SlugGenerator = lazyTool(() => import("./pages/SlugGenerator"));
const YamlJsonConverter = lazyTool(() => import("./pages/YamlJsonConverter"));
const CsvJsonConverter = lazyTool(() => import("./pages/CsvJsonConverter"));
const GitCheatsheet = lazyTool(() => import("./pages/GitCheatsheet"));
const WindowsCheatSheet = lazyTool(() => import("./pages/WindowsCheatSheet"));
const MetaTagGenerator = lazyTool(() => import("./pages/MetaTagGenerator"));
const SqlFormatter = lazyTool(() => import("./pages/SqlFormatter"));
const SqlSchemaVisualizer = lazyTool(() => import("./pages/SqlSchemaVisualizer"));
const PasswordHash = lazyTool(() => import("./pages/PasswordHash"));
const FaviconGenerator = lazyTool(() => import("./pages/FaviconGenerator"));
const HexConverter = lazyTool(() => import("./pages/HexConverter"));
const EscapeUnescape = lazyTool(() => import("./pages/EscapeUnescape"));
const AsciiUnicodeTable = lazyTool(() => import("./pages/AsciiUnicodeTable"));
const UrlParser = lazyTool(() => import("./pages/UrlParser"));
const MorseCode = lazyTool(() => import("./pages/MorseCode"));
const NatoPhonetic = lazyTool(() => import("./pages/NatoPhonetic"));
const Braille = lazyTool(() => import("./pages/Braille"));
const Strobo = lazyTool(() => import("./pages/Strobo"));
const ExistentialTimer = lazyTool(() => import("./pages/ExistentialTimer"));
const ClickCounter = lazyTool(() => import("./pages/ClickCounter"));
const LocalNotes = lazyTool(() => import("./pages/LocalNotes"));
const TimezoneConverter = lazyTool(() => import("./pages/TimezoneConverter"));
const Stopwatch = lazyTool(() => import("./pages/Stopwatch"));
const CountdownTimer = lazyTool(() => import("./pages/CountdownTimer"));
const UrlExpand = lazyTool(() => import("./pages/UrlExpand"));
const ChmodCalculator = lazyTool(() => import("./pages/ChmodCalculator"));
const MimeLookup = lazyTool(() => import("./pages/MimeLookup"));
const EnvEditor = lazyTool(() => import("./pages/EnvEditor"));
const SemverComparator = lazyTool(() => import("./pages/SemverComparator"));
const ColorContrast = lazyTool(() => import("./pages/ColorContrast"));
const ClampGenerator = lazyTool(() => import("./pages/ClampGenerator"));
const EasingEditor = lazyTool(() => import("./pages/EasingEditor"));
const UnicodeInspector = lazyTool(() => import("./pages/UnicodeInspector"));
const NginxFormatter = lazyTool(() => import("./pages/NginxFormatter"));
const RedirectGenerator = lazyTool(() => import("./pages/RedirectGenerator"));
const TableCsvConverter = lazyTool(() => import("./pages/TableCsvConverter"));
const CurlConverter = lazyTool(() => import("./pages/CurlConverter"));
const SvgTools = lazyTool(() => import("./pages/SvgTools"));
const XmlTools = lazyTool(() => import("./pages/XmlTools"));
const CspBuilder = lazyTool(() => import("./pages/CspBuilder"));
const HmacGenerator = lazyTool(() => import("./pages/HmacGenerator"));
const GitignoreComposer = lazyTool(() => import("./pages/GitignoreComposer"));
const KeycodeInspector = lazyTool(() => import("./pages/KeycodeInspector"));
const ColorShades = lazyTool(() => import("./pages/ColorShades"));
const RobotsBuilder = lazyTool(() => import("./pages/RobotsBuilder"));
const TextDiff = lazyTool(() => import("./pages/TextDiff"));
const GraphqlFormat = lazyTool(() => import("./pages/GraphqlFormat"));
const TomlJsonConverter = lazyTool(() => import("./pages/TomlJsonConverter"));
const ScrollSanctifier = lazyTool(() => import("./pages/ScrollSanctifier"));
const CoinFlip = lazyTool(() => import("./pages/CoinFlip"));
const DiceRoller = lazyTool(() => import("./pages/DiceRoller"));
const AssetGridComposer = lazyTool(() => import("./pages/AssetGridComposer"));
const FontConverter = lazyTool(() => import("./pages/FontConverter"));
const ImageEditor = lazyTool(() => import("./pages/ImageEditor"));

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
        <Route
          path="json-editor"
          element={<JsonTreeEditor onToast={showToast} />}
        />
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
        <Route path="text-gradient" element={<TextGradientCreator onToast={showToast} />} />
        <Route path="gradient-border" element={<GradientBorderGenerator onToast={showToast} />} />
        <Route path="crontab" element={<CrontabGenerator onToast={showToast} />} />
        <Route path="tailwind" element={<TailwindSearch onToast={showToast} />} />
        <Route path="regex" element={<RegexTester onToast={showToast} />} />
        <Route path="markdown" element={<MarkdownConverter onToast={showToast} />} />
        <Route path="markdown-viewer" element={<MarkdownViewer onToast={showToast} />} />
        <Route path="grid" element={<GridTemplateBuilder onToast={showToast} />} />
        <Route path="grid-composer" element={<CssGridComposer onToast={showToast} />} />
        <Route path="image-composition" element={<AssetGridComposer onToast={showToast} />} />
        <Route path="asset-grid" element={<Navigate to="/image-composition" replace />} />
        <Route path="image-editor" element={<ImageEditor onToast={showToast} />} />
        <Route
          path="perfect-border"
          element={<PerfectBorderGenerator onToast={showToast} />}
        />
        <Route path="qr" element={<QrCodeGenerator onToast={showToast} />} />
        <Route path="slug" element={<SlugGenerator onToast={showToast} />} />
        <Route path="yaml-json" element={<YamlJsonConverter onToast={showToast} />} />
        <Route path="csv-json" element={<CsvJsonConverter onToast={showToast} />} />
        <Route path="git-cheatsheet" element={<GitCheatsheet onToast={showToast} />} />
        <Route
          path="windows-cheat-sheet"
          element={<WindowsCheatSheet onToast={showToast} />}
        />
        <Route path="meta-tags" element={<MetaTagGenerator onToast={showToast} />} />
        <Route path="sql-formatter" element={<SqlFormatter onToast={showToast} />} />
        <Route path="sql-schema" element={<SqlSchemaVisualizer onToast={showToast} />} />
        <Route path="password-hash" element={<PasswordHash onToast={showToast} />} />
        <Route path="icon" element={<FaviconGenerator onToast={showToast} />} />
        <Route path="hex-converter" element={<HexConverter onToast={showToast} />} />
        <Route path="escape" element={<EscapeUnescape onToast={showToast} />} />
        <Route path="ascii-table" element={<AsciiUnicodeTable onToast={showToast} />} />
        <Route path="url-parser" element={<UrlParser onToast={showToast} />} />
        <Route path="nato" element={<NatoPhonetic onToast={showToast} />} />
        <Route path="braille" element={<Braille onToast={showToast} />} />
        <Route path="morse" element={<MorseCode onToast={showToast} />} />
        <Route path="strobo" element={<Strobo />} />
        <Route path="existential-timer" element={<ExistentialTimer />} />
        <Route path="click-counter" element={<ClickCounter />} />
        <Route
          path="scroll-sanctifier"
          element={<ScrollSanctifier onToast={showToast} />}
        />
        <Route path="coin-flip" element={<CoinFlip />} />
        <Route path="dice" element={<DiceRoller />} />
        <Route path="local-notes" element={<LocalNotes onToast={showToast} />} />
        <Route path="timezone-converter" element={<TimezoneConverter onToast={showToast} />} />
        <Route path="stopwatch" element={<Stopwatch />} />
        <Route path="countdown" element={<CountdownTimer />} />
        <Route path="url-expand" element={<UrlExpand />} />
        <Route path="chmod" element={<ChmodCalculator onToast={showToast} />} />
        <Route path="mime" element={<MimeLookup onToast={showToast} />} />
        <Route path="env" element={<EnvEditor onToast={showToast} />} />
        <Route path="semver" element={<SemverComparator />} />
        <Route path="contrast" element={<ColorContrast />} />
        <Route path="clamp" element={<ClampGenerator onToast={showToast} />} />
        <Route path="easing" element={<EasingEditor onToast={showToast} />} />
        <Route path="unicode" element={<UnicodeInspector />} />
        <Route path="nginx-format" element={<NginxFormatter onToast={showToast} />} />
        <Route path="redirects" element={<RedirectGenerator onToast={showToast} />} />
        <Route path="table-csv" element={<TableCsvConverter onToast={showToast} />} />
        <Route path="curl-convert" element={<CurlConverter onToast={showToast} />} />
        <Route path="svg" element={<SvgTools onToast={showToast} />} />
        <Route path="font-converter" element={<FontConverter onToast={showToast} />} />
        <Route path="xml" element={<XmlTools onToast={showToast} />} />
        <Route path="csp" element={<CspBuilder onToast={showToast} />} />
        <Route path="hmac" element={<HmacGenerator onToast={showToast} />} />
        <Route path="gitignore" element={<GitignoreComposer onToast={showToast} />} />
        <Route path="keycode" element={<KeycodeInspector onToast={showToast} />} />
        <Route path="color-shades" element={<ColorShades onToast={showToast} />} />
        <Route path="robots" element={<RobotsBuilder onToast={showToast} />} />
        <Route path="diff" element={<TextDiff onToast={showToast} />} />
        <Route path="graphql-format" element={<GraphqlFormat onToast={showToast} />} />
        <Route path="toml-json" element={<TomlJsonConverter onToast={showToast} />} />
      </Route>
    </Routes>
  );
}
