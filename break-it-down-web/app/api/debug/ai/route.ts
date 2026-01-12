import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  if (!process.env.AI_SERVICE_URL) {
    return NextResponse.json(
      { error: "AI service URL is not configured." },
      { status: 500 }
    );
  }

  const aiServiceUrl = process.env.AI_SERVICE_URL.replace(/\/$/, "");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${aiServiceUrl}/generate-steps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task: "test task" }),
      signal: controller.signal,
    });

    const bodyText = await response.text();
    return NextResponse.json(
      {
        status: response.status,
        ok: response.ok,
        body: bodyText,
      },
      { status: response.ok ? 200 : 502 }
    );
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to reach AI service.", detail },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
