import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "result-photos";

export async function uploadResultPhoto(
  guestId: string,
  file: File,
): Promise<{ storagePath: string; mimeType: string; sizeBytes: number }> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const allowed = ["jpg", "jpeg", "png", "webp", "heic"];
  if (!allowed.includes(ext)) {
    throw new Error("Formato de imagen no permitido");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("La imagen supera 8 MB");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = `${guestId}/${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const mimeType = file.type || `image/${ext === "jpg" ? "jpeg" : ext}`;

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, bytes, { contentType: mimeType, upsert: false });
    if (error) throw new Error(error.message);
    return { storagePath: filename, mimeType, sizeBytes: file.size };
  }

  // Local fallback for development
  const dir = path.join(process.cwd(), "public", "uploads", guestId);
  await mkdir(dir, { recursive: true });
  const localName = path.basename(filename);
  await writeFile(path.join(dir, localName), bytes);
  return {
    storagePath: `local:${guestId}/${localName}`,
    mimeType,
    sizeBytes: file.size,
  };
}

export async function getSignedPhotoUrl(
  storagePath: string,
  expiresIn = 3600,
): Promise<string | null> {
  if (storagePath.startsWith("local:")) {
    const rel = storagePath.replace("local:", "");
    return `/uploads/${rel}`;
  }

  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresIn);
  if (error) return null;
  return data.signedUrl;
}

export async function deletePhoto(storagePath: string): Promise<void> {
  if (storagePath.startsWith("local:")) return;
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.storage.from(BUCKET).remove([storagePath]);
}
