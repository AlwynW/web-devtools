import { useState, useCallback } from "react";
import { ArrowsClockwise } from "phosphor-react";
import { faker } from "@faker-js/faker";
import Button from "../components/Button";
import CopyButton from "../components/CopyButton";
import { copyToClipboard } from "../utils/clipboard";
import useOnlineStatus from "../hooks/useOnlineStatus";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import Label from "../components/ui/Label";

function initialsFromName(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function createPersona() {
  const fName = faker.person.firstName();
  const lName = faker.person.lastName();
  const company = faker.company.name();
  const cleanCompany = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  const email = faker.internet.email({
    firstName: fName,
    lastName: lName,
    provider: `${cleanCompany}.com`,
  });

  const avatarSeed = encodeURIComponent(`${fName}${lName}${Math.random()}`);
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  return {
    name: `${fName} ${lName}`,
    company,
    email,
    avatar: avatarUrl,
  };
}

function Avatar({ name, avatarUrl, online }) {
  const [failed, setFailed] = useState(false);
  const showFallback = failed || !online;

  if (showFallback) {
    return (
      <div
        className="w-full h-full flex items-center justify-center bg-secondary-hover text-fg-soft text-3xl font-black tracking-tight"
        aria-label={`${name} avatar initials`}
      >
        {initialsFromName(name) || "?"}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt="Profile"
      className="w-full h-full"
      onError={() => setFailed(true)}
    />
  );
}

export default function PersonaGenerator({ onToast }) {
  const online = useOnlineStatus();
  const [persona, setPersona] = useState(createPersona);

  const generatePersona = useCallback(() => {
    setPersona(createPersona());
  }, []);

  const copyFullPersona = () => {
    if (!persona) return;
    const text = `Name: ${persona.name}\nCompany: ${persona.company}\nEmail: ${persona.email}`;
    copyToClipboard(text, () => onToast("Persona copied!"));
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Persona" description="Quickly spin up fake personas for testing." />

      <Panel className="sm:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="flex flex-col items-center gap-4 shrink-0">
          <div className="w-40 h-40 border-4 border-border rounded-control overflow-hidden bg-surface-muted">
            <Avatar
              key={persona.avatar}
              name={persona.name}
              avatarUrl={persona.avatar}
              online={online}
            />
          </div>
          {online ? (
            <CopyButton
              text={persona.avatar}
              onCopySuccess={() => onToast("Avatar URL copied!")}
              title="Copy URL"
              className="w-full justify-center"
            />
          ) : (
            <p className="text-[11px] font-mono text-fg-muted text-center">
              Offline — initials avatar (Dicebear needs network)
            </p>
          )}
        </div>

        <div className="flex-1 w-full space-y-4">
          {[
            { label: "Name", val: persona.name },
            { label: "Company", val: persona.company },
            { label: "Email", val: persona.email },
          ].map((field) => (
            <div key={field.label}>
              <Label>
                {field.label}
              </Label>
              <div className="flex justify-between items-center bg-surface-muted p-3 border border-border rounded-control mt-1">
                <span className="text-lg font-mono truncate pr-4 text-fg">
                  {field.val}
                </span>
                <CopyButton
                  text={field.val}
                  onCopySuccess={() => onToast(`${field.label} copied!`)}
                  title={`Copy ${field.label}`}
                  size={16}
                />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
        <Button variant="outline" onClick={copyFullPersona}>
          Full Report
        </Button>
        <Button onClick={generatePersona} icon={ArrowsClockwise}>
          New Persona
        </Button>
      </div>
    </div>
  );
}
