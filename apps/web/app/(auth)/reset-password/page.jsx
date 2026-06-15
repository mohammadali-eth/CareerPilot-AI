"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useResetPassword } from "../../../hooks/use-auth";
const resetSchema = z
    .object({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const resetMutation = useResetPassword();
    const [token, setToken] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    useEffect(() => {
        const queryToken = searchParams?.get("token");
        if (queryToken) {
            setToken(queryToken);
        }
        else {
            setErrorMessage("Reset token is missing in parameters. Please request a new password reset.");
        }
    }, [searchParams]);
    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(resetSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });
    const onSubmit = async (data) => {
        if (!token) {
            setErrorMessage("Cannot update password. Token is missing.");
            return;
        }
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
            await resetMutation.mutateAsync({
                token: token,
                new_password: data.password,
            });
            setSuccessMessage("Password updated successfully. You can now log in.");
        }
        catch (err) {
            setErrorMessage(err.message ||
                "Failed to update password. Token might be invalid or expired.");
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
            Configure new password
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please enter your new credential parameters.
          </p>
        </div>

        {errorMessage && (<div className="p-3 text-sm rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 text-center">
            {errorMessage}
          </div>)}

        {successMessage ? (<div className="space-y-6 text-center">
            <div className="p-3 text-sm rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
              {successMessage}
            </div>
            <div className="pt-2">
              <Link href="/login" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
                Go to Sign in
              </Link>
            </div>
          </div>) : (<form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                New Password
              </label>
              <input id="password" type="password" disabled={!token} className={`mt-1 block w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm ${errors.password
                ? "border-destructive focus:ring-destructive/50"
                : "border-input"}`} {...register("password")}/>
              {errors.password && (<p className="mt-1 text-xs text-destructive">
                  {errors.password.message}
                </p>)}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                Confirm New Password
              </label>
              <input id="confirmPassword" type="password" disabled={!token} className={`mt-1 block w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm ${errors.confirmPassword
                ? "border-destructive focus:ring-destructive/50"
                : "border-input"}`} {...register("confirmPassword")}/>
              {errors.confirmPassword && (<p className="mt-1 text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>)}
            </div>

            <button type="submit" disabled={isSubmitting || !token} className="w-full mt-6 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50">
              {isSubmitting ? "Updating password..." : "Update Password"}
            </button>
          </form>)}
      </div>
    </div>);
}
export default function ResetPasswordPage() {
    return (<Suspense fallback={<div className="flex items-center justify-center min-h-[75vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
        </div>}>
      <ResetPasswordContent />
    </Suspense>);
}
