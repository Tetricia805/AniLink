import { useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PhotoUploaderProps {
  /** Optional animal name for contextual copy */
  animalName?: string;
  files: File[];
  previewUrls: string[];
  onFilesChange: (files: File[], previewUrls: string[]) => void;
}

const MAX_SIZE_MB = 10;
const ACCEPT = "image/png,image/jpeg,image/jpg";

export function PhotoUploader({
  animalName,
  files,
  previewUrls,
  onFilesChange,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const revoke = useCallback((url: string) => {
    try {
      URL.revokeObjectURL(url);
    } catch {
      /* noop */
    }
  }, []);

  const addFiles = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return;
      const next: File[] = [];
      const urls: string[] = [];
      for (let i = 0; i < list.length; i++) {
        const f = list[i];
        if (!f.type.startsWith("image/") || f.size > MAX_SIZE_MB * 1024 * 1024)
          continue;
        next.push(f);
        urls.push(URL.createObjectURL(f));
      }
      onFilesChange([...files, ...next], [...previewUrls, ...urls]);
    },
    [files, previewUrls, onFilesChange],
  );

  const removeAt = useCallback(
    (idx: number) => {
      const u = previewUrls[idx];
      revoke(u);
      const nextFiles = files.filter((_, i) => i !== idx);
      const nextUrls = previewUrls.filter((_, i) => i !== idx);
      onFilesChange(nextFiles, nextUrls);
    },
    [files, previewUrls, onFilesChange, revoke],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onBrowse = () => {
    inputRef.current?.click();
  };

  const description = animalName
    ? `Add clear photos of ${animalName} for AI analysis. At least one photo is required.`
    : "Add clear photos for AI analysis. At least one photo is required.";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-icon-primary" />
            <CardTitle>Upload Photos</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onBrowse();
              }
            }}
            onClick={onBrowse}
            onDrop={onDrop}
            onDragOver={onDragOver}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-colors outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "hover:border-primary/50 hover:bg-muted/30 cursor-pointer",
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              multiple
              className="sr-only"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium mb-1">Drop images here or click to browse</p>
            <p className="text-sm text-muted-foreground">
              PNG, JPG (max {MAX_SIZE_MB}MB each)
            </p>
          </div>

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {previewUrls.map((url, idx) => (
                <div
                  key={url}
                  className="relative rounded-lg overflow-hidden border border-border bg-muted aspect-square group"
                >
                  <img
                    src={url}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-7 w-7 rounded-full opacity-90 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAt(idx);
                    }}
                    aria-label={`Remove photo ${idx + 1}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {previewUrls.length === 0 && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20 p-3 text-sm">
              <AlertTriangle className="h-4 w-4 text-icon-amber shrink-0 mt-0.5" />
              <p className="text-icon-amber opacity-90">
                Add at least one photo for AI analysis. For cattle, focus on muzzle, tongue, hooves, udder, or mouth.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
