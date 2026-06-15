"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRegister } from "../../../hooks/use-auth";

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const registerMutation = useRegister();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    message: string;
    verification_token?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setErrorMessage(null);
    setSuccessData(null);
    try {
      const result = await registerMutation.mutateAsync(data);
      setSuccessData(result);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          "An error occurred during registration. Please try again.",
      );
    }
  };

  if (successData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 glass-panel p-8 rounded border border-border text-center">
          <div className="h-10 w-10 rounded-full border border-foreground flex items-center justify-center mx-auto text-sm font-extrabold text-foreground">
            ✓
          </div>
          <h2 className="text-xl font-bold text-foreground">Registration Successful</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {successData.message ||
              "Account registered successfully. Please verify your email."}
          </p>

          {successData.verification_token && (
            <div className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-border rounded text-left text-xs font-mono space-y-2">
              <p className="text-foreground font-bold uppercase tracking-wider text-[10px]">
                Simulated Verification Link:
              </p>
              <Link
                href={`/verify-email?token=${successData.verification_token}`}
                className="text-foreground hover:underline break-all block font-semibold"
              >
                {`${window.location.origin}/verify-email?token=${successData.verification_token}`}
              </Link>
            </div>
          )}

          <div className="pt-4">
            <Link
              href="/login"
              className="w-full flex justify-center py-2.5 px-4 rounded text-xs font-bold text-background bg-foreground hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            >
              GO TO SIGN IN
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded border border-border">
        {/* Header */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm font-bold uppercase tracking-widest text-foreground"
          >
            CareerPilot
          </Link>
          <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground">
            Create Account
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-foreground hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Error Messages */}
        {errorMessage && (
          <div className="p-3 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-foreground text-center font-medium">
            {errorMessage}
          </div>
        )}

        {/* Register Form */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="first_name"
                className="block text-xs font-bold uppercase tracking-wider text-foreground"
              >
                First Name
              </label>
              <input
                id="first_name"
                type="text"
                className={`mt-1.5 block w-full px-3 py-2 bg-background border rounded focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground transition-all text-xs font-medium ${
                  errors.first_name ? "border-neutral-800" : "border-input"
                }`}
                {...register("first_name")}
              />
              {errors.first_name && (
                <p className="mt-1 text-[10px] text-muted-foreground font-semibold">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="last_name"
                className="block text-xs font-bold uppercase tracking-wider text-foreground"
              >
                Last Name
              </label>
              <input
                id="last_name"
                type="text"
                className={`mt-1.5 block w-full px-3 py-2 bg-background border rounded focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground transition-all text-xs font-medium ${
                  errors.last_name ? "border-neutral-800" : "border-input"
                }`}
                {...register("last_name")}
              />
              {errors.last_name && (
                <p className="mt-1 text-[10px] text-muted-foreground font-semibold">
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider text-foreground"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={`mt-1.5 block w-full px-3 py-2 bg-background border rounded focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground transition-all text-xs font-medium ${
                errors.email ? "border-neutral-800" : "border-input"
              }`}
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-[10px] text-muted-foreground font-semibold">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-wider text-foreground"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`mt-1.5 block w-full px-3 py-2 bg-background border rounded focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground transition-all text-xs font-medium ${
                errors.password ? "border-neutral-800" : "border-input"
              }`}
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-[10px] text-muted-foreground font-semibold">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 flex justify-center py-2.5 px-4 rounded text-xs font-bold text-background bg-foreground hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
          </button>
        </form>
      </div>
    </div>
  );
}
