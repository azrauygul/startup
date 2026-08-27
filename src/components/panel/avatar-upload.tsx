"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Camera, Loader2 } from "lucide-react";
import { uploadAvatar } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Props = {
  value?: string | null;
  onChange: (url: string) => void;
  className?: string;
};

async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: Area,
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const size = 400;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas desteklenmiyor");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Görsel işlenemedi"))),
      "image/jpeg",
      0.88,
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = src;
  });
}

export function AvatarUpload({ value, onChange, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onCropComplete = useCallback((_: Area, area: Area) => {
    setCroppedArea(area);
  }, []);

  const handleFile = (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) {
      setError("Lütfen bir fotoğraf seçin.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Fotoğraf en fazla 8 MB olabilir.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(String(reader.result));
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!imageSrc || !croppedArea) return;
    startTransition(async () => {
      try {
        const blob = await getCroppedBlob(imageSrc, croppedArea);
        const formData = new FormData();
        formData.append("avatar", blob, "avatar.jpg");
        const result = await uploadAvatar(formData);
        if (result.error) {
          setError(result.error);
          return;
        }
        if (result.url) {
          onChange(result.url);
          setOpen(false);
          setImageSrc(null);
        }
      } catch {
        setError("Fotoğraf yüklenemedi. Tekrar deneyin.");
      }
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />

      <div className="flex items-center gap-4">
        <div className="relative size-24 overflow-hidden rounded-2xl border bg-muted">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Profil" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <Camera className="size-8" />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => inputRef.current?.click()}
          >
            Galeriden seç
          </Button>
          <p className="text-xs text-muted-foreground">
            Telefondan fotoğraf seçip kırpabilirsiniz.
          </p>
        </div>
      </div>

      {error && !open ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm gap-0 p-0" showCloseButton={false}>
          <DialogHeader className="border-b px-4 py-3">
            <DialogTitle className="text-base">Fotoğrafı kırp</DialogTitle>
          </DialogHeader>

          <div className="relative h-56 bg-muted">
            {imageSrc ? (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            ) : null}
          </div>

          <div className="space-y-3 px-4 py-3">
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary"
              aria-label="Yakınlaştır"
            />
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
          </div>

          <DialogFooter className="border-t px-4 py-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setOpen(false)}
            >
              İptal
            </Button>
            <Button
              type="button"
              className="rounded-full"
              disabled={pending || !croppedArea}
              onClick={handleSave}
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                "Kaydet"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
