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
function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const loginMutation = useLogin();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [errorMessage, setErrorMessage] = useState(null);
    // Check if redirect parameters exist (e.g. session expired)
    const isExpired = searchParams?.get("expired") === "true";
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/profile");
        }
    }, [isAuthenticated, router]);
    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const onSubmit = async (data) => {
        setErrorMessage(null);
        try {
            await loginMutation.mutateAsync(data);
            router.push("/profile");
        }
        catch (err) {
            setErrorMessage(err.message || "Invalid credentials. Please try again.");
        }
    };
    return (<div className="flex flex-col items-center justify-center min-h-[75vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-2xl shadow-premium border border-border">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            CareerPilot AI
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        {/* System Messages */}
        {isExpired && (<div className="p-3 text-sm rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-yellow-500 text-center">
            Your session has expired. Please log in again.
          </div>)}

        {errorMessage && (<div className="p-3 text-sm rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 text-center">
            {errorMessage}
          </div>)}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email address
              </label>
              <input id="email" type="email" autoComplete="email" className={`mt-1 block w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm ${errors.email
            ? "border-destructive focus:ring-destructive/50"
            : "border-input"}`} {...register("email")}/>
              {errors.email && (<p className="mt-1 text-xs text-destructive">
                  {errors.email.message}
                </p>)}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input id="password" type="password" autoComplete="current-password" className={`mt-1 block w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm ${errors.password
            ? "border-destructive focus:ring-destructive/50"
            : "border-input"}`} {...register("password")}/>
              {errors.password && (<p className="mt-1 text-xs text-destructive">
                  {errors.password.message}
                </p>)}
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>);
}
export default function LoginPage() {
    return (<Suspense fallback={<div className="flex items-center justify-center min-h-[75vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
        </div>}>
      <LoginContent />
    </Suspense>);
}
