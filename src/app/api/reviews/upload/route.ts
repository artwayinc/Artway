import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

// File upload not supported on Cloudflare Workers (no writable filesystem)
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

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

    // On Cloudflare Workers: no writable filesystem available
    // For production use, integrate with Cloudflare R2 or external storage service
    return NextResponse.json(
      {
        error:
          "Image upload is not available. Please use image URLs instead or contact support.",
      },
      { status: 503 },
    );
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Failed to process image." },
      { status: 500 },
    );
  }
}
