// useLLM — thin wrapper around the Forge OpenAI-compatible chat completions endpoint.
// Uses VITE_FRONTEND_FORGE_API_KEY and VITE_FRONTEND_FORGE_API_URL injected at build time.

import { useState, useCallback } from "react";

const FORGE_BASE_URL =
  import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
  "https://forge.butterfly-effect.dev";

const FORGE_API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY || "";

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface UseLLMResult {
  ask: (messages: LLMMessage[]) => Promise<string>;
  loading: boolean;
  error: string | null;
}

export function useLLM(): UseLLMResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(async (messages: LLMMessage[]): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${FORGE_BASE_URL}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FORGE_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages,
          temperature: 0.2,
          max_tokens: 1200,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`LLM API error ${res.status}: ${text}`);
      }
      const data = await res.json();
      const content: string = data?.choices?.[0]?.message?.content ?? "";
      return content;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { ask, loading, error };
}
