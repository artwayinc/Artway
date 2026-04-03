/**
 * Node-only: delete a file under public/. Used for removing old review images.
 * Only call when !process.env.CF_PAGES (Vercel/Node). Do not import in Edge routes.
 */
import fs from "fs";
import path from "path";

export function deleteReviewImage(publicPath: string): void {
  if (!publicPath || !publicPath.startsWith("/reviews/")) return;
  try {
    const filePath = path.join(process.cwd(), "public", publicPath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // ignore
  }
}
