import { ProfileEditDrawer } from "./ProfileEditDrawer";

export interface EditProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Universal profile edit drawer (Farmer, Seller).
 * Wraps ProfileEditDrawer with role="owner" for consistent UX.
 */
export function EditProfileSheet({ open, onOpenChange }: EditProfileSheetProps) {
  return (
    <ProfileEditDrawer
      open={open}
      onOpenChange={onOpenChange}
      role="owner"
    />
  );
}
