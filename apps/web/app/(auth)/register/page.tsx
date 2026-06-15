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
  const [successData, setSuccessData] = useState<{ message: string; verification_token?: string } | null>(null);

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
      setErrorMessage(err.message || "An error occurred during registration. Please try again.");
    }
  };

  if (successData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 glass-panel p-8 rounded-2xl shadow-premium border border-emerald-500/20 text-center">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto text-2xl">
            ✓
          </div>
          <h2 className="text-2xl font-bold">Registration Successful</h2>
          <p className="text-sm text-muted-foreground">
            {successData.message || "Account registered successfully. Please verify your email."}
          </p>

          {successData.verification_token && (
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-left text-xs font-mono space-y-2">
              <p className="text-emerald-400 font-semibold">Simulated Verification Link:</p>
              <Link
                href={`/verify-email?token=${successData.verification_token}`}
                className="text-primary hover:underline break-all block"
              >
                {`${window.location.origin}/verify-email?token=${successData.verification_token}`}
              </Link>
            </div>
          )}

          <div className="pt-4">
            <Link
              href="/login"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
            >
              Go to Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-2xl shadow-premium border border-border">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            CareerPilot AI
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight">Create your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Error Messages */}
        {errorMessage && (
          <div className="p-3 text-sm rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 text-center">
            {errorMessage}
          </div>
        )}

        {/* Register Form */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-foreground">
                First Name
              </label>
              <input
                id="first_name"
                type="text"
                className={`mt-1 block w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm ${
                  errors.first_name ? "border-destructive focus:ring-destructive/50" : "border-input"
                }`}
                {...register("first_name")}
              />
              {errors.first_name && (
                <p className="mt-1 text-xs text-destructive">{errors.first_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-foreground">
                Last Name
              </label>
              <input
                id="last_name"
                type="text"
                className={`mt-1 block w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm ${
                  errors.last_name ? "border-destructive focus:ring-destructive/50" : "border-input"
                }`}
                {...register("last_name")}
              />
              {errors.last_name && (
                <p className="mt-1 text-xs text-destructive">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email address
            </label>
            <input
              id="email"
              type="email"
              className={`mt-1 block w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm ${
                errors.email ? "border-destructive focus:ring-destructive/50" : "border-input"
              }`}
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`mt-1 block w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm ${
                errors.password ? "border-destructive focus:ring-destructive/50" : "border-input"
              }`}
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
