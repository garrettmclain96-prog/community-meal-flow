import { Link } from "@tanstack/react-router";
import { useId } from "react";

import { LEGAL_DOCUMENTS, type LegalDocKey } from "@/lib/legal/registry";

export type LegalAcceptanceValue = {
  accepted: boolean;
  signerName: string;
};

export const EMPTY_ACCEPTANCE: LegalAcceptanceValue = { accepted: false, signerName: "" };

export function isAcceptanceComplete(
  value: LegalAcceptanceValue,
  requireSignature: boolean,
): boolean {
  if (!value.accepted) return false;
  if (requireSignature && value.signerName.trim().length < 2) return false;
  return true;
}

/**
 * Reusable affirmative-assent control. The checkbox is never pre-checked and
 * the caller must keep its submit button disabled until
 * `isAcceptanceComplete()` returns true.
 */
export function LegalAcceptance({
  documents,
  value,
  onChange,
  requireSignature = false,
  intro,
  className = "",
}: {
  documents: LegalDocKey[];
  value: LegalAcceptanceValue;
  onChange: (next: LegalAcceptanceValue) => void;
  requireSignature?: boolean;
  intro?: string;
  className?: string;
}) {
  const checkboxId = useId();
  const nameId = useId();
  const docs = documents.map((key) => LEGAL_DOCUMENTS[key]);

  return (
    <div className={`editorial-card p-4 ${className}`}>
      <p className="kicker text-primary">Agreement required</p>
      {intro && <p className="mt-2 text-sm text-muted-foreground">{intro}</p>}

      <ul className="mt-3 grid gap-1.5 text-sm">
        {docs.map((doc) => (
          <li key={doc.key}>
            <Link
              to={doc.path}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-4"
            >
              {doc.title} v{doc.version}
            </Link>
            <span className="block text-xs text-muted-foreground">{doc.summary}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-start gap-3">
        <input
          id={checkboxId}
          type="checkbox"
          checked={value.accepted}
          onChange={(event) => onChange({ ...value, accepted: event.target.checked })}
          className="mt-1 size-5 shrink-0 accent-[var(--primary)]"
        />
        <label htmlFor={checkboxId} className="text-sm leading-6">
          I have read and I agree to{" "}
          {docs.map((doc, index) => (
            <span key={doc.key}>
              {index > 0 && (index === docs.length - 1 ? " and " : ", ")}
              <strong>
                {doc.title} v{doc.version}
              </strong>
            </span>
          ))}
          . I am 18 years of age or older.
        </label>
      </div>

      {requireSignature && (
        <div className="mt-4">
          <label htmlFor={nameId} className="field-label">
            Type your full legal name as your electronic signature
          </label>
          <input
            id={nameId}
            value={value.signerName}
            onChange={(event) => onChange({ ...value, signerName: event.target.value })}
            className="field-control"
            autoComplete="name"
            placeholder="Full legal name"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Under Texas Business &amp; Commerce Code Chapter 322, this typed name plus the checkbox
            above is an electronic signature. We record the document key and version, your account
            ID, the name you type and the time — no IP address and no device fingerprint.
          </p>
        </div>
      )}
    </div>
  );
}
