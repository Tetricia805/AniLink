import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/use-toast";
import { getRoleHome } from "@/lib/auth";
import type { RegisterRequestDto, UserRole } from "@/types/auth";
import { Stethoscope, Eye, EyeOff, AlertCircle, User, Building2, Store } from "lucide-react";

interface RegisterFormValues {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  location?: string;
  animalTypes: string[];
  clinicName?: string;
  services: string[];
  farmVisits: boolean;
  storeName?: string;
  terms: boolean;
}

const animalTypeOptions = ["Livestock", "Poultry", "Pets"];
const serviceOptions = ["General Consultation", "Surgery", "Vaccination", "Farm Visits", "Emergency"];

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const { push } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<UserRole>(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "vet") return "VET";
    if (roleParam === "seller") return "SELLER";
    return "OWNER";
  });

  const { register, handleSubmit, formState, watch, setValue, control } = useForm<RegisterFormValues>({
    defaultValues: {
      role: role,
      animalTypes: [],
      services: [],
      farmVisits: false,
      terms: false,
    },
  });

  const watchedAnimalTypes = watch("animalTypes");
  const watchedServices = watch("services");

  useEffect(() => {
    setValue("role", role);
  }, [role, setValue]);

  const toggleAnimalType = (type: string) => {
    const current = watchedAnimalTypes || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    setValue("animalTypes", updated);
  };

  const toggleService = (service: string) => {
    const current = watchedServices || [];
    const updated = current.includes(service)
      ? current.filter((s) => s !== service)
      : [...current, service];
    setValue("services", updated);
  };

  const onSubmit = async (values: RegisterFormValues) => {
    if (values.password !== values.confirmPassword) {
      push({ title: "Password mismatch", description: "Passwords do not match." });
      return;
    }

    if (!values.terms) {
      push({ title: "Terms required", description: "Please accept the terms and conditions." });
      return;
    }

    const payload: RegisterRequestDto = {
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
      phone: values.phone?.trim() || null,
      role: values.role,
    };

    try {
      await registerUser(payload);
      push({ title: "Account created", description: "Welcome to AniLink." });
      const user = useAuthStore.getState().user;
      if (user?.role === "SELLER" && values.storeName?.trim()) {
        const { useSellerStore } = await import("@/store/sellerStore");
        useSellerStore.getState().updateProfile({ storeName: values.storeName.trim() });
      }
      navigate(user?.role ? getRoleHome(user.role) : "/home");
    } catch {
      push({ title: "Registration failed", description: "Please try again." });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
        className="w-full max-w-2xl"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary">
            <Stethoscope className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-semibold text-2xl">AniLink</span>
        </div>

        <Card className="border border-border shadow-lg transition-all duration-200 hover:shadow-xl hover:border-primary/30">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Create account</CardTitle>
            <CardDescription>Join AniLink and keep your animals healthy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Role Selector: Farmer | Vet | Seller */}
            <Tabs value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="OWNER" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Farmer
                </TabsTrigger>
                <TabsTrigger value="VET" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Vet
                </TabsTrigger>
                <TabsTrigger value="SELLER" className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Seller
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {/* Common Fields */}
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  {...register("name", { required: "Name is required" })}
                />
                {formState.errors.name?.message && (
                  <p className="text-xs text-destructive">{formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {formState.errors.email?.message && (
                  <p className="text-xs text-destructive">{formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+256700000000"
                  {...register("phone")}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
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
                  {formState.errors.password?.message && (
                    <p className="text-xs text-destructive">{formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      {...register("confirmPassword", { required: "Please confirm your password" })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formState.errors.confirmPassword?.message && (
                    <p className="text-xs text-destructive">{formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Role-specific Fields */}
              {role === "OWNER" && (
                <>
                  <div className="space-y-2">
                    <Label>Location (optional)</Label>
                    <Input
                      placeholder="District/City"
                      {...register("location")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Animal types</Label>
                    <div className="flex flex-wrap gap-2">
                      {animalTypeOptions.map((type) => (
                        <Badge
                          key={type}
                          variant={watchedAnimalTypes?.includes(type) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleAnimalType(type)}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {role === "VET" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="clinicName">Clinic name</Label>
                    <Input
                      id="clinicName"
                      placeholder="Your clinic name"
                      {...register("clinicName")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Services offered</Label>
                    <div className="flex flex-wrap gap-2">
                      {serviceOptions.map((service) => (
                        <Badge
                          key={service}
                          variant={watchedServices?.includes(service) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleService(service)}
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="farmVisits" {...register("farmVisits")} />
                    <Label htmlFor="farmVisits" className="text-sm font-normal cursor-pointer">
                      Offer farm visits
                    </Label>
                  </div>
                </>
              )}

              {role === "SELLER" && (
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store name (optional)</Label>
                  <Input
                    id="storeName"
                    placeholder="Your store or business name"
                    {...register("storeName")}
                  />
                  <p className="text-xs text-muted-foreground">
                    You can update store details in Seller profile after signup.
                  </p>
                </div>
              )}

              {/* Terms */}
              <div className="flex items-start space-x-2">
                <Controller
                  name="terms"
                  control={control}
                  rules={{ required: "You must accept the terms and conditions" }}
                  render={({ field }) => (
                    <Checkbox
                      id="terms"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  )}
                />
                <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              {formState.errors.terms && (
                <p className="text-xs text-destructive">{formState.errors.terms.message}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
