"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

/** Brand header and card used by login, registration and onboarding. */
export function AuthCard({
  title,
  sub,
  children,
  footer,
}: {
  title: string;
  sub: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="authwrap">
      <main className="authcard">
        <div className="authbrand">
          <div className="brandmark">
            <Icon name="heartbeat" weight="fill" />
          </div>
          <div>
            <div className="brandname">Pigorithm</div>
            <div className="brandsub">Livestock Intelligence</div>
          </div>
        </div>
        <div className="card">
          <h1 className="authtitle">{title}</h1>
          <div className="authsub">{sub}</div>
          {children}
        </div>
        {footer && <div className="authfoot">{footer}</div>}
      </main>
    </div>
  );
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  /** Control shown inside the right edge of the input, such as a show/hide button. */
  trailing?: ReactNode;
}

/** Labelled input with inline validation message. */
export function Field({ id, label, error, hint, optional, trailing, ...input }: FieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const control = (
    <input
      id={id}
      name={id}
      className="input"
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      {...input}
    />
  );
  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {label}
        {optional && <span className="optional"> (optional)</span>}
      </label>
      {trailing ? (
        <div className="inputwrap">
          {control}
          {trailing}
        </div>
      ) : (
        control
      )}
      {error ? (
        <div className="fielderror" id={`${id}-error`}>
          {error}
        </div>
      ) : hint ? (
        <div className="fieldhint" id={`${id}-hint`}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}

/** Password input with a button that shows or hides the typed password. */
export function PasswordField(props: Omit<FieldProps, "type" | "trailing">) {
  const [visible, setVisible] = useState(false);
  return (
    <Field
      {...props}
      type={visible ? "text" : "password"}
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      trailing={
        <button
          type="button"
          className="inputaction"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-controls={props.id}
          onClick={() => setVisible((v) => !v)}
        >
          <Icon name={visible ? "eye-slash" : "eye"} />
        </button>
      }
    />
  );
}

/** Error banner listing one or more messages from the backend. */
export function FormError({ messages }: { messages: string[] }) {
  if (!messages.length) return null;
  return (
    <div className="formerror" role="alert">
      <Icon name="warning-circle" />
      {messages.length === 1 ? (
        <div>{messages[0]}</div>
      ) : (
        <ul>
          {messages.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function FormNote({ children }: { children: ReactNode }) {
  return (
    <div className="formnote" role="status">
      <Icon name="info" />
      <div>{children}</div>
    </div>
  );
}

export function SubmitButton({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <button type="submit" className="btn btn-primary btn-block" disabled={busy} aria-busy={busy}>
      {busy && <Icon name="spinner-gap" className="spin" />}
      {children}
    </button>
  );
}
