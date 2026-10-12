// Selecting a file, validating it and storing it — shared by the reader page
// and the admin inbox so both attach files the same way.
import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { tt } from "@/components/languages/hardcodedTranslate";
import { uploadSupportAttachment } from "../services/support-service";
import { MAX_ATTACHMENT_BYTES } from "../constants";
import { fileToBase64 } from "../utils";
import type { SupportAttachment } from "../types";

export function useSupportAttachment() {
  const { toast } = useToast();
  const [attachment, setAttachment] = useState<SupportAttachment | null>(null);
  const [uploading, setUploading] = useState(false);

  const selectFile = useCallback(
    async (file: File) => {
      if (!file) return;
      if (file.size > MAX_ATTACHMENT_BYTES) {
        toast({
          title: tt("File is too large"),
          description: tt("Please attach a file smaller than 5MB."),
        });
        return;
      }

      setUploading(true);
      try {
        const base64 = await fileToBase64(file);
        const res = await uploadSupportAttachment({ attachment: base64, fileName: file.name });
        if ((res.returnCode === 201 || res.returnCode === 200) && res.returnData?.url) {
          setAttachment({
            url: res.returnData.url,
            name: res.returnData.name || file.name,
            size: res.returnData.size ?? file.size,
            type: res.returnData.type ?? file.type,
          });
        } else {
          toast({
            title: tt("Could not attach the file"),
            description: res.returnMessage,
          });
        }
      } catch (err) {
        toast({
          title: tt("Could not attach the file"),
          description: (err as Error)?.message,
        });
      } finally {
        setUploading(false);
      }
    },
    [toast],
  );

  const clear = useCallback(() => setAttachment(null), []);

  return {
    data: { attachment, uploading },
    actions: { selectFile, clear },
  };
}
