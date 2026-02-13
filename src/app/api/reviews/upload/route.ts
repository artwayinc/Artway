import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import path from "path";
import fs from "fs";

const PUBLIC_REVIEWS = "reviews";
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    const publicDir = path.join(process.cwd(), "public", PUBLIC_REVIEWS);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const ext =
      file.type === "image/jpeg"
        ? "jpg"
        : file.type === "image/png"
          ? "png"
          : file.type === "image/webp"
            ? "webp"
            : "gif";
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const filename = `${unique}.${ext}`;
    const outPath = path.join(publicDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    try {
      fs.writeFileSync(outPath, buffer);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (writeErr) {
      // No writable filesystem (e.g. Cloudflare Workers)
      return NextResponse.json(
        { error: "Image upload not available on this deployment." },
        { status: 503 },
      );
    }

    const url = `/${PUBLIC_REVIEWS}/${filename}`;
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Failed to process image." },
      { status: 500 },
    );
  }
}
