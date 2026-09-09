"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Paperclip, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { UploadButton } from "@/shared/utils/uploadthing";
import { useCreateAffiliateClaim } from "@/features/claims/application/useClaims";
import {
  AFFILIATE_CLAIM_CATEGORIES,
  type AffiliateClaimCategory,
  type CreateAffiliateClaimAttachmentInput,
} from "@/features/claims/domain";

type CreateClaimDialogProps = {
  orderId: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  showDefaultTrigger?: boolean;
};

export const CreateClaimDialog = ({
  orderId,
  open: controlledOpen,
  onOpenChange,
  trigger,
  showDefaultTrigger = true,
}: CreateClaimDialogProps) => {
  const t = useTranslations("affiliateDashboard.settings.claims");
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  const [category, setCategory] = useState<AffiliateClaimCategory | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<
    CreateAffiliateClaimAttachmentInput[]
  >([]);

  const createClaim = useCreateAffiliateClaim();

  const handleReset = () => {
    setCategory("");
    setTitle("");
    setDescription("");
    setAttachments([]);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) handleReset();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!category || orderId <= 0) return;

    createClaim.mutate(
      {
        order_id: orderId,
        category,
        title: title.trim(),
        description: description.trim(),
        attachments,
      },
      {
        onSuccess: () => handleOpenChange(false),
      }
    );
  };

  const canSubmit =
    orderId > 0 &&
    Boolean(category) &&
    title.trim().length >= 3 &&
    description.trim().length >= 10 &&
    !createClaim.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : showDefaultTrigger ? (
        <DialogTrigger asChild>
          <Button type="button" size="sm" className="gap-1.5">
            <Plus className="size-4" aria-hidden />
            {t("newClaim")}
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
          <DialogDescription>{t("createDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="claim-category">{t("category")}</Label>
            <Select
              value={category}
              onValueChange={(value) =>
                setCategory(value as AffiliateClaimCategory)
              }
            >
              <SelectTrigger id="claim-category" aria-label={t("category")}>
                <SelectValue placeholder={t("categoryPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {AFFILIATE_CLAIM_CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {t(`categories.${item}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="claim-title">{t("titleField")}</Label>
            <Input
              id="claim-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t("titlePlaceholder")}
              maxLength={160}
              aria-label={t("titleField")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="claim-description">{t("descriptionField")}</Label>
            <Textarea
              id="claim-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t("descriptionPlaceholder")}
              rows={5}
              maxLength={4000}
              aria-label={t("descriptionField")}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("attachments")}</Label>
            <p className="text-xs text-muted-foreground">{t("attachmentsHint")}</p>
            <UploadButton
              endpoint="claimAttachment"
              onClientUploadComplete={(files) => {
                setAttachments((current) =>
                  [
                    ...current,
                    ...files.map((file) => ({
                      file_url: file.ufsUrl || file.url,
                      file_name: file.name,
                      file_type: file.type,
                    })),
                  ].slice(0, 5)
                );
              }}
              onUploadError={(error) => {
                console.error("Claim attachment upload failed", error);
              }}
              appearance={{
                button:
                  "ut-ready:bg-primary ut-uploading:cursor-not-allowed after:bg-primary text-sm",
                allowedContent: "text-xs text-muted-foreground",
              }}
            />
            {attachments.length > 0 ? (
              <ul className="space-y-1.5 pt-1">
                {attachments.map((attachment) => (
                  <li
                    key={`${attachment.file_url}-${attachment.file_name ?? ""}`}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                  >
                    <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 truncate">
                      {attachment.file_name || attachment.file_url}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {createClaim.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t("submitting")}
                </>
              ) : (
                t("submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
