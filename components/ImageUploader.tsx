"use client";

import NextImage from "next/image";
import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

const MAX_IMAGE_SIZE = 1600;

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo cargar la imagen"));
    };
    image.src = url;
  });

const optimizeImage = async (file: File) => {
  if (!file.type.startsWith("image/")) return file;

  const image = await loadImage(file);
  const scale = Math.min(
    1,
    MAX_IMAGE_SIZE / Math.max(image.width || 1, image.height || 1)
  );
  const targetWidth = Math.round(image.width * scale);
  const targetHeight = Math.round(image.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  const usePng = file.type === "image/png";
  const mimeType = usePng ? "image/png" : "image/jpeg";
  const quality = usePng ? 0.92 : 0.82;
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mimeType, quality)
  );

  if (!blob) return file;

  const baseName = file.name.replace(/\.[^.]+$/, "");
  const extension = usePng ? "png" : "jpg";
  return new File([blob], `${baseName}.${extension}`, { type: mimeType });
};

const PUBLIC_PREFIX = "/storage/v1/object/public/images/";

const getStoragePath = (url: string | null) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const index = parsed.pathname.indexOf(PUBLIC_PREFIX);
    if (index == -1) return null;
    return decodeURIComponent(parsed.pathname.slice(index + PUBLIC_PREFIX.length));
  } catch {
    return null;
  }
};


const ImageUploader = ({
  value,
  onChange,
  optimize = true
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  optimize?: boolean;
}) => {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);

    let optimizedFile = file;
    if (optimize) {
      try {
        optimizedFile = await optimizeImage(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al optimizar imagen");
      }
    }

    const cleanName = optimizedFile.name.replace(/[^a-zA-Z0-9.-]/g, "-");
    const existingPath = getStoragePath(value);
    const filePath = existingPath ?? `catalogo/${Date.now()}-${cleanName}`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, optimizedFile, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("images").getPublicUrl(filePath);
    const cacheBustedUrl = `${data.publicUrl}?v=${Date.now()}`;
    onChange(cacheBustedUrl);
    setUploading(false);
  };

  const handleRemove = async () => {
    setError(null);
    const existingPath = getStoragePath(value);
    if (existingPath) {
      const { error: removeError } = await supabase.storage
        .from("images")
        .remove([existingPath]);

      if (removeError) {
        setError(removeError.message);
      }
    }

    onChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {value ? (
          <NextImage
            src={value}
            alt="Vista previa"
            width={64}
            height={64}
            className="h-16 w-16 rounded-xl object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-400">
            Sin foto
          </div>
        )}
        <label className="button-outline cursor-pointer">
          {uploading ? "Subiendo..." : "Subir imagen"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                handleUpload(file);
              }
            }}
          />
        </label>
        {value && (
          <button
            type="button"
            className="button-ghost"
            onClick={handleRemove}
          >
            Quitar
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default ImageUploader;
