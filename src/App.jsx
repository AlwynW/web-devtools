import { useState, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import PasswordGenerator from "./pages/PasswordGenerator";
import UuidGenerator from "./pages/UuidGenerator";
import TimestampGenerator from "./pages/TimestampGenerator";
import PersonaGenerator from "./pages/PersonaGenerator";
import JsonFormatter from "./pages/JsonFormatter";
import Base64Encoder from "./pages/Base64Encoder";
import UrlEncoder from "./pages/UrlEncoder";
import JwtDebugger from "./pages/JwtDebugger";
import HttpStatusCodes from "./pages/HttpStatusCodes";
import LoremIpsum from "./pages/LoremIpsum";
import ColorConverter from "./pages/ColorConverter";
import HtmlEntityEncoder from "./pages/HtmlEntityEncoder";
import WhatsMyIp from "./pages/WhatsMyIp";
import Base64Image from "./pages/Base64Image";
import HashGenerator from "./pages/HashGenerator";
import CssGenerator from "./pages/CssGenerator";
import CrontabGenerator from "./pages/CrontabGenerator";
import TailwindSearch from "./pages/TailwindSearch";
import RegexTester from "./pages/RegexTester";
import MarkdownConverter from "./pages/MarkdownConverter";
import MarkdownViewer from "./pages/MarkdownViewer";
import GridTemplateBuilder from "./pages/GridTemplateBuilder";
import PerfectBorderGenerator from "./pages/PerfectBorderGenerator";
import QrCodeGenerator from "./pages/QrCodeGenerator";
import SlugGenerator from "./pages/SlugGenerator";
import YamlJsonConverter from "./pages/YamlJsonConverter";
import CsvJsonConverter from "./pages/CsvJsonConverter";
import GitCheatsheet from "./pages/GitCheatsheet";
import MetaTagGenerator from "./pages/MetaTagGenerator";
import SqlFormatter from "./pages/SqlFormatter";
import PasswordHash from "./pages/PasswordHash";
import FaviconGenerator from "./pages/FaviconGenerator";
import HexConverter from "./pages/HexConverter";
import EscapeUnescape from "./pages/EscapeUnescape";
import AsciiUnicodeTable from "./pages/AsciiUnicodeTable";
import UrlParser from "./pages/UrlParser";
import MorseCode from "./pages/MorseCode";

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
        <Route path="favicon" element={<FaviconGenerator onToast={showToast} />} />
        <Route path="hex-converter" element={<HexConverter onToast={showToast} />} />
        <Route path="escape" element={<EscapeUnescape onToast={showToast} />} />
        <Route path="ascii-table" element={<AsciiUnicodeTable onToast={showToast} />} />
        <Route path="url-parser" element={<UrlParser onToast={showToast} />} />
        <Route path="morse" element={<MorseCode onToast={showToast} />} />
      </Route>
    </Routes>
  );
}
