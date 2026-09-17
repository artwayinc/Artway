import { NextRequest, NextResponse } from "next/server";
import { getCloudflareEnv } from "@/lib/db";

interface R2ObjectBody {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
}

interface R2Bucket {
  get(key: string): Promise<R2ObjectBody | null>;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ key: string[] }> },
) {
  const env = await getCloudflareEnv();
  const bucket = env && typeof env === "object"
    ? (env as Record<string, unknown>).QUOTE_UPLOADS as R2Bucket | undefined
    : undefined;

  if (!bucket || typeof bucket.get !== "function") {
    return NextResponse.json({ error: "Storage unavailable." }, { status: 503 });
  }

  const { key } = await context.params;
  const object = await bucket.get(key.join("/"));
  if (!object) return NextResponse.json({ error: "Image not found." }, { status: 404 });

  return new NextResponse(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": "private, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
