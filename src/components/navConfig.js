import {
  Key,
  Hash,
  Clock,
  UserSquare,
  BracketsCurly,
  FileCode,
  LinkSimple,
  Keyhole,
  FileText,
  TextAlignLeft,
  Palette,
  Code,
  Globe,
  ImageSquare,
  FingerprintSimple,
  Cube,
  CalendarCheck,
  BookOpen,
  BracketsAngle,
  File,
  DownloadSimple,
  SquaresFour,
  Square,
  QrCode,
} from "phosphor-react";

export const navGroups = [
  {
    name: "Generate",
    items: [
      {
        path: "/",
        label: "Password",
        icon: Key,
        description: "Generate strong, random passwords.",
      },
      {
        path: "/uuid",
        label: "UUID Gen",
        icon: Hash,
        description: "Create RFC-compliant UUIDs.",
      },
      {
        path: "/timestamp",
        label: "Timestamp",
        icon: Clock,
        description: "Convert to/from Unix timestamps.",
      },
      {
        path: "/persona",
        label: "Persona",
        icon: UserSquare,
        description: "Quickly spin up fake personas for testing.",
      },
      {
        path: "/lorem",
        label: "Lorem",
        icon: TextAlignLeft,
        description: "Generate lorem ipsum placeholder text.",
      },
      {
        path: "/crontab",
        label: "Crontab",
        icon: CalendarCheck,
        description: "Build and understand cron expressions.",
      },
    ],
  },
  {
    name: "CSS tools",
    items: [
      {
        path: "/css-generator",
        label: "CSS Shadow/Gradient",
        icon: Cube,
        description: "Design shadows and gradients and copy the CSS.",
      },
      {
        path: "/grid",
        label: "Grid",
        icon: SquaresFour,
        description: "Experiment with CSS grid layouts.",
      },
      {
        path: "/perfect-border",
        label: "Perfect Border",
        icon: Square,
        description: "Tweak border radius until it looks just right.",
      },

      {
        path: "/color",
        label: "Color",
        icon: Palette,
        description: "Explore and convert colors for your UI.",
      },
    ],
  },
  {
    name: "Encode / Decode",
    items: [
      {
        path: "/qr",
        label: "QR Code",
        icon: QrCode,
        description: "Generate QR codes from text/URLs.",
      },
      {
        path: "/base64",
        label: "Base64",
        icon: FileCode,
        description: "Encode/decode text using Base64.",
      },
      {
        path: "/base64-image",
        label: "Base64 Image",
        icon: ImageSquare,
        description: "Encode/decode images using Base64.",
      },
      {
        path: "/url",
        label: "URL",
        icon: LinkSimple,
        description: "URL-encode and decode strings.",
      },
      {
        path: "/jwt",
        label: "JWT",
        icon: Keyhole,
        description: "Inspect JSON Web Tokens.",
      },
      {
        path: "/html-entity",
        label: "HTML Entity",
        icon: Code,
        description: "Convert text to/from HTML entities.",
      },
      {
        path: "/hash",
        label: "Hash",
        icon: FingerprintSimple,
        description: "Create hashes for strings.",
      },
    ],
  },
  {
    name: "Convert / Validate",
    items: [
      {
        path: "/json",
        label: "JSON",
        icon: BracketsCurly,
        description: "Pretty-print, minify, and validate JSON.",
      },
      {
        path: "/markdown",
        label: "Markdown/HTML",
        icon: File,
        description: "Convert between Markdown and HTML.",
      },
    ],
  },
  {
    name: "Tools",
    items: [
      {
        path: "/regex",
        label: "Regex",
        icon: BracketsAngle,
        description: "Build and test regular expressions.",
      },
      {
        path: "/markdown-viewer",
        label: "MarkDown Viewer",
        icon: DownloadSimple,
        description: "Render Markdown for quick previews.",
      },
    ],
  },
  {
    name: "Reference",
    items: [
      {
        path: "/http-status",
        label: "HTTP Status",
        icon: FileText,
        description: "Look up HTTP status codes.",
      },
      {
        path: "/tailwind",
        label: "Tailwind",
        icon: BookOpen,
        description: "Quick Tailwind CSS reference.",
      },
      {
        path: "/ip",
        label: "My IP",
        icon: Globe,
        description: "Show your public IP address.",
      },
    ],
  },
];

