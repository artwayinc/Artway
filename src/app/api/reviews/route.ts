import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { addReview, deleteReview, getReviews, updateReview } from "@/lib/db";

function clampRating(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 5;
  return Math.min(5, Math.max(1, Math.round(n)));
}

export async function GET() {
  const reviews = getReviews();
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

    if (!title || !text || !author) {
      return NextResponse.json(
        { error: "Title, text and author are required" },
        { status: 400 },
      );
    }

    const created = addReview({
      title,
      text,
      author,
      role,
      location,
      rating,
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
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

    const updated = updateReview(id, patch);
    if (!updated) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
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

    const deleted = deleteReview(id);
    if (!deleted) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
