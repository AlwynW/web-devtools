import { useState, useMemo } from "react";
import CopyArea from "../components/CopyArea";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";

function generateMetaTags(fields) {
  const { title, description, url, imageUrl, siteName, twitterHandle } = fields;
  const lines = [];

  if (title) {
    lines.push('<meta property="og:title" content="' + escapeHtml(title) + '" />');
    lines.push('<meta name="twitter:title" content="' + escapeHtml(title) + '" />');
  }
  if (description) {
    lines.push('<meta property="og:description" content="' + escapeHtml(description) + '" />');
    lines.push('<meta name="twitter:description" content="' + escapeHtml(description) + '" />');
  }
  if (url) {
    lines.push('<meta property="og:url" content="' + escapeHtml(url) + '" />');
  }
  if (imageUrl) {
    lines.push('<meta property="og:image" content="' + escapeHtml(imageUrl) + '" />');
    lines.push('<meta name="twitter:image" content="' + escapeHtml(imageUrl) + '" />');
  }
  if (siteName) {
    lines.push('<meta property="og:site_name" content="' + escapeHtml(siteName) + '" />');
  }
  lines.push('<meta property="og:type" content="website" />');
  lines.push('<meta name="twitter:card" content="summary_large_image" />');
  if (twitterHandle) {
    lines.push('<meta name="twitter:site" content="' + escapeHtml(twitterHandle) + '" />');
  }

  return lines.join("\n");
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function MetaTagGenerator({ onToast }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [siteName, setSiteName] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");

  const output = useMemo(
    () =>
      generateMetaTags({
        title,
        description,
        url,
        imageUrl,
        siteName,
        twitterHandle,
      }),
    [title, description, url, imageUrl, siteName, twitterHandle]
  );

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Meta Tag Generator" description="Generate Open Graph and Twitter Card meta tags for SEO and social sharing." />

      <Panel className="space-y-4">
        {[
          { key: "title", label: "Title", value: title, set: setTitle },
          { key: "description", label: "Description", value: description, set: setDescription },
          { key: "url", label: "URL", value: url, set: setUrl },
          { key: "imageUrl", label: "Image URL", value: imageUrl, set: setImageUrl },
          { key: "siteName", label: "Site name", value: siteName, set: setSiteName },
          { key: "twitterHandle", label: "Twitter handle (e.g. @username)", value: twitterHandle, set: setTwitterHandle },
        ].map(({ key, label, value, set }) => (
          <div key={key}>
            <Label className="mb-1">
              {label}
            </Label>
            <input
              type="text"
              value={value}
              onChange={(e) => set(e.target.value)}
              placeholder={label}
              className="w-full p-3 bg-surface border border-border-strong font-mono text-sm focus:outline-none focus:ring-1 focus:ring-focus text-fg rounded-control"
            />
          </div>
        ))}

        {output && (
          <>
            <Label className="mt-6">
              Generated HTML
            </Label>
            <CopyArea text={output} onCopySuccess={() => onToast("Copied!")} />
          </>
        )}
      </Panel>
    </div>
  );
}
