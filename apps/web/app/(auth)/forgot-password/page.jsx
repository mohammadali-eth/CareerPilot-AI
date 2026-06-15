"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useForgotPassword } from "../../../hooks/use-auth";
const forgotSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});
export default function ForgotPasswordPage() {
    const forgotMutation = useForgotPassword();
    const [errorMessage, setErrorMessage] = useState(null);
    const [successData, setSuccessData] = useState(null);
    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(forgotSchema),
        defaultValues: {
            email: "",
        },
    });
    const onSubmit = async (data) => {
        setErrorMessage(null);
        setSuccessData(null);
        try {
            const result = await forgotMutation.mutateAsync(data);
            setSuccessData(result);
        }
        catch (err) {
            setErrorMessage(err.message || "Failed to process request. Please try again.");
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
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We will generate a reset token to help you configure a new password.
          </p>
        </div>

        {errorMessage && (<div className="p-3 text-sm rounded-lg border border-red-500/20 bg-red-500/5 text-red-500 text-center">
            {errorMessage}
          </div>)}

        {successData ? (<div className="space-y-6 text-center">
            <div className="p-3 text-sm rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
              {successData.message}
            </div>

            {successData.reset_token && (<div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-lg text-left text-xs font-mono space-y-2">
                <p className="text-purple-400 font-semibold">
                  Simulated Reset Link:
                </p>
                <Link href={`/reset-password?token=${successData.reset_token}`} className="text-primary hover:underline break-all block">
                  {`${window.location.origin}/reset-password?token=${successData.reset_token}`}
                </Link>
              </div>)}

            <div className="pt-2">
              <Link href="/login" className="text-sm font-semibold text-primary hover:underline">
                Back to Sign in
              </Link>
            </div>
          </div>) : (<form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email address
              </label>
              <input id="email" type="email" className={`mt-1 block w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm ${errors.email
                ? "border-destructive focus:ring-destructive/50"
                : "border-input"}`} {...register("email")}/>
              {errors.email && (<p className="mt-1 text-xs text-destructive">
                  {errors.email.message}
                </p>)}
            </div>

            <div className="space-y-3">
              <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-50">
                {isSubmitting ? "Generating link..." : "Send Reset Token"}
              </button>
              <div className="text-center">
                <Link href="/login" className="text-sm text-muted-foreground hover:underline">
                  Back to Login
                </Link>
              </div>
            </div>
          </form>)}
      </div>
    </div>);
}
