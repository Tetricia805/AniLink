import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"
import { Button } from "@/components/ui/button"
import { MessageCircle, Phone, Mail, Copy } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export interface ContactSellerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sellerName?: string | null
  sellerPhone?: string | null
  sellerEmail?: string | null
  orderId?: string
}

function stripNonDigits(s: string): string {
  return s.replace(/\D/g, "")
}

export function ContactSellerModal({
  open,
  onOpenChange,
  sellerName,
  sellerPhone,
  sellerEmail,
  orderId,
}: ContactSellerModalProps) {
  const { push } = useToast()
  const hasAnyContact = !!(sellerPhone || sellerEmail)

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard?.writeText(value).then(
      () => push({ title: "Copied", description: `${label} copied to clipboard.` }),
      () => push({ title: "Copy failed", description: "Could not copy to clipboard." })
    )
  }

  const whatsappUrl = sellerPhone
    ? `https://wa.me/${stripNonDigits(sellerPhone)}?text=${encodeURIComponent(
        `Hi${sellerName ? ` ${sellerName}` : ""}, I have a question about my order${orderId ? ` ${orderId.slice(0, 8)}` : ""}.`
      )}`
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact seller</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {sellerName && (
            <p className="text-sm text-muted-foreground">
              Reach out to <span className="font-medium text-foreground">{sellerName}</span>
            </p>
          )}
          {hasAnyContact ? (
            <div className="flex flex-col gap-3">
              {sellerPhone && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <span className="text-sm truncate">{sellerPhone}</span>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(sellerPhone!, "Phone")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {whatsappUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <a href={`tel:${sellerPhone}`}>
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
              {sellerEmail && (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <span className="text-sm truncate">{sellerEmail}</span>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(sellerEmail!, "Email")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`mailto:${sellerEmail}?subject=${encodeURIComponent(
                          orderId ? `Question about order ${orderId.slice(0, 8)}` : "Question about my order"
                        )}`}
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Seller contact information is not available yet.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                In-app messaging will be available in a future update.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
