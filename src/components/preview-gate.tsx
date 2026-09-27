"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

const storageKey = "casiciaco-preview-access";

export function PreviewGate() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"checking" | "ready" | "submitting">(
    "checking",
  );
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function restore() {
      try {
        const token = localStorage.getItem(storageKey);
        if (token) {
          const response = await fetch("/api/preview-access", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
            signal: controller.signal,
          });
          if (response.ok) {
            window.location.reload();
            return;
          }
          if (response.status === 401) localStorage.removeItem(storageKey);
        }
      } catch {
        // Storage can be unavailable in private/restricted browser contexts.
      }
      if (!controller.signal.aborted) setStatus("ready");
    }
    void restore();
    return () => controller.abort();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status !== "ready" || !/^\d{3}$/.test(code)) return;
    setStatus("submitting");
    setError("");
    try {
      const response = await fetch("/api/preview-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "No pudimos entrar. Probá de nuevo.");
        setStatus("ready");
        input.current?.focus();
        input.current?.select();
        return;
      }
      try {
        localStorage.setItem(storageKey, result.token);
      } catch {
        // The HttpOnly cookie still remembers access when localStorage is blocked.
      }
      window.location.reload();
    } catch {
      setError("No pudimos conectar. Revisá tu conexión y probá de nuevo.");
      setStatus("ready");
    }
  }

  return (
    <main id="recorrido" className="preview-gate">
      <div className="gate-card">
        <span className="gate-brand">
          casiciaco<span>en proceso</span>
        </span>
        <p className="eyebrow">VISTA PREVIA</p>
        <h1>
          Estamos preparando
          <br />
          <span>algo lindo.</span>
        </h1>
        <p className="gate-description">
          Esta versión todavía está en construcción.
          <br />
          Si tenés el código, pasá a verla.
        </p>
        <form onSubmit={submit} aria-busy={status !== "ready"}>
          <label htmlFor="preview-code">Código de acceso</label>
          <input
            ref={input}
            id="preview-code"
            name="code"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={3}
            minLength={3}
            pattern="[0-9]{3}"
            value={code}
            onChange={(event) => {
              setCode(event.target.value.replace(/\D/g, "").slice(0, 3));
              setError("");
            }}
            aria-describedby="code-hint code-error"
            aria-invalid={!!error}
            required
          />
          <p id="code-hint" className="gate-hint">
            Son 3 números. Recordaremos el acceso en este dispositivo.
          </p>
          <p id="code-error" className="gate-error" role="alert">
            {error}
          </p>
          <button
            type="submit"
            className="gate-submit"
            disabled={status !== "ready" || code.length !== 3}
          >
            {status === "checking"
              ? "Comprobando acceso…"
              : status === "submitting"
                ? "Entrando…"
                : "Entrar"}
            <span aria-hidden="true">↗</span>
          </button>
        </form>
        <noscript>
          Activá JavaScript para ingresar el código y ver la vista previa.
        </noscript>
      </div>
    </main>
  );
}
