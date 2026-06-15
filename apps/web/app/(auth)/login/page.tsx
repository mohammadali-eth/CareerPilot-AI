"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLogin } from "../../../hooks/use-auth";
import { useAuthStore } from "../../../store/auth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLogin();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if redirect parameters exist (e.g. session expired)
  const isExpired = searchParams?.get("expired") === "true";

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/profile");
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMessage(null);
    try {
      await loginMutation.mutateAsync(data);
      router.push("/profile");
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid credentials. Please try again.");
    }
  };

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
            Sign In
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-foreground hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* System Messages */}
        {isExpired && (
          <div className="p-3 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-foreground text-center font-medium">
            Your session has expired. Please log in again.
          </div>
        )}

        {errorMessage && (
          <div className="p-3 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-foreground text-center font-medium">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
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
                autoComplete="email"
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
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-foreground"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[10px] font-bold text-muted-foreground hover:text-foreground hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
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
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2.5 px-4 rounded text-xs font-bold text-background bg-foreground hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[75vh]">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-foreground border-t-transparent" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
