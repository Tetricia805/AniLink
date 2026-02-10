import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, Eye, EyeOff } from "lucide-react";
import { verifyResetToken, resetPassword } from "@/api/auth";
import { useToast } from "@/components/ui/use-toast";
import { getApiErrorMessage } from "@/lib/apiError";
import { useNavigate } from "react-router-dom";

interface FormValues {
  newPassword: string;
  confirmPassword: string;
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { push } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setIsVerifying(false);
      return;
    }
    verifyResetToken(token)
      .then((r) => setTokenValid(r.valid))
      .catch(() => setTokenValid(false))
      .finally(() => setIsVerifying(false));
  }, [token]);

  const { register, handleSubmit, watch, formState } = useForm<FormValues>({
    defaultValues: { newPassword: "", confirmPassword: "" },
  });
  const newPassword = watch("newPassword");

  const onSubmit = async (values: FormValues) => {
    if (!token) return;
    if (values.newPassword !== values.confirmPassword) {
      push({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(token, values.newPassword);
      push({ title: "Password updated", description: "You can now sign in with your new password." });
      navigate("/login");
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, 'Failed to reset password');
      push({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="text-muted-foreground">Verifying link…</p>
      </div>
    );
  }

  if (!token || !tokenValid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
          className="w-full max-w-md"
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
              <Stethoscope className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-semibold text-2xl">AniLink</span>
          </div>
          <Card className="border border-border shadow-lg transition-all duration-200 hover:shadow-xl hover:border-primary/30">
            <CardHeader>
              <CardTitle>Invalid or expired link</CardTitle>
              <CardDescription>
                This reset link is invalid or has expired. Request a new one from the login page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/forgot-password">Request new link</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full mt-2">
                <Link to="/login">Back to login</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
            <Stethoscope className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-semibold text-2xl">AniLink</span>
        </div>
        <Card className="border border-border shadow-lg transition-all duration-200 hover:shadow-xl hover:border-primary/30">
          <CardHeader>
            <CardTitle>Set new password</CardTitle>
            <CardDescription>
              Enter your new password (at least 8 characters).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    {...register("newPassword", {
                      required: "Password is required",
                      minLength: { value: 8, message: "At least 8 characters" },
                    })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formState.errors.newPassword?.message && (
                  <p className="text-xs text-destructive">{formState.errors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (v) => v === newPassword || "Passwords do not match",
                  })}
                />
                {formState.errors.confirmPassword?.message && (
                  <p className="text-xs text-destructive">{formState.errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Resetting…" : "Reset password"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              <Link to="/login" className="text-primary hover:underline">
                Back to login
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
