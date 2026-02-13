import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getCloudflareEnv, getStore } from "@/lib/db";

function clampRating(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 5;
  return Math.min(5, Math.max(1, Math.round(n)));
}

export async function GET() {
  const env = await getCloudflareEnv();
  const store = await getStore(env);
  const reviews = await store.getReviews();
  return NextResponse.json(reviews);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;

    const title = String(body.title ?? "").trim();
    const text = String(body.text ?? "").trim();
    const author = String(body.author ?? "").trim();
    const role = String(body.role ?? "").trim();
    const location = String(body.location ?? "").trim();
    const rating = clampRating(body.rating);
    const image =
      typeof body.image === "string" && body.image.trim()
        ? body.image.trim()
        : undefined;

    if (!title || !text || !author) {
      return NextResponse.json(
        { error: "Title, text and author are required" },
        { status: 400 }
      );
    }

    const env = await getCloudflareEnv();
    const store = await getStore(env);
    const created = await store.addReview({
      title,
      text,
      author,
      role,
      location,
      rating,
      image,
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = String(body.id ?? "").trim();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const patch: Record<string, unknown> = {};
    if (body.title !== undefined) patch.title = String(body.title ?? "").trim();
    if (body.text !== undefined) patch.text = String(body.text ?? "").trim();
    if (body.author !== undefined)
      patch.author = String(body.author ?? "").trim();
    if (body.role !== undefined) patch.role = String(body.role ?? "").trim();
    if (body.location !== undefined)
      patch.location = String(body.location ?? "").trim();
    if (body.rating !== undefined) patch.rating = clampRating(body.rating);
    if (body.image !== undefined)
      patch.image =
        typeof body.image === "string" && body.image.trim()
          ? body.image.trim()
          : undefined;

    const env = await getCloudflareEnv();
    const store = await getStore(env);
    const existing = (await store.getReviews()).find((r) => r.id === id);
    if (!existing) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const updated = await store.updateReview(id, patch);
    if (!updated) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const oldImage = existing.image;
    const newImage = updated.image;
    const shouldDeleteOldFile =
      oldImage && oldImage.startsWith("/reviews/") && oldImage !== newImage;
    if (shouldDeleteOldFile && process.env.CF_PAGES !== "1") {
      const { deleteReviewImage } = await import("@/lib/delete-file-node");
      deleteReviewImage(oldImage);
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { orderedIds } = body;

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json(
        { error: "orderedIds array is required" },
        { status: 400 }
      );
    }

    const env = await getCloudflareEnv();
    const store = await getStore(env);
    const reordered = await store.reorderReviews(orderedIds);
    return NextResponse.json(reordered);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const env = await getCloudflareEnv();
    const store = await getStore(env);
    const review = (await store.getReviews()).find((r) => r.id === id);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const deleted = await store.deleteReview(id);
    if (!deleted) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (review.image && review.image.startsWith("/reviews/") && process.env.CF_PAGES !== "1") {
      const { deleteReviewImage } = await import("@/lib/delete-file-node");
      deleteReviewImage(review.image);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
