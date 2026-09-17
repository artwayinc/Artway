import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

interface R2Bucket {
  put(key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
}

function getBucket(env: unknown): R2Bucket | null {
  if (!env || typeof env !== "object") return null;
  const bucket = (env as Record<string, unknown>).QUOTE_UPLOADS;
  if (!bucket || typeof (bucket as R2Bucket).put !== "function") return null;
  return bucket as R2Bucket;
}

export async function POST(request: NextRequest) {
  try {
    const { getCloudflareEnv } = await import("@/lib/db");
    const bucket = getBucket(await getCloudflareEnv());
    if (!bucket) {
      return NextResponse.json(
        { error: "Photo upload is temporarily unavailable. Please provide an artwork link instead." },
        { status: 503 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file or invalid file field (use 'file')" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid type. Use JPEG, PNG, WebP or GIF." },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File too large (max 10 MB)." },
        { status: 400 },
      );
    }

    const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "bin";
    const key = `quote-uploads/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
    await bucket.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });

    const url = new URL(`/api/quote-upload/${key}`, request.url).toString();
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Quote upload error:", err);
    return NextResponse.json(
      { error: "Failed to process image." },
      { status: 500 },
    );
  }
}
