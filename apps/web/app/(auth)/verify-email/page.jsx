"use client";
import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useVerifyEmail } from "../../../hooks/use-auth";
function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const verifyMutation = useVerifyEmail();
    const [status, setStatus] = useState("loading");
    const [errorMessage, setErrorMessage] = useState(null);
    // Guard against double firing in React 19 StrictMode
    const hasFired = useRef(false);
    useEffect(() => {
        const token = searchParams?.get("token");
        if (!token) {
            setStatus("error");
            setErrorMessage("No verification token was provided.");
            return;
        }
        if (hasFired.current)
            return;
        hasFired.current = true;
        async function verifyToken() {
            try {
                await verifyMutation.mutateAsync({ token: token });
                setStatus("success");
            }
            catch (err) {
                setStatus("error");
                setErrorMessage(err.message ||
                    "Failed to verify email. The token may be invalid or expired.");
            }
        }
        verifyToken();
    }, [searchParams, verifyMutation]);
    return (<div className="flex flex-col items-center justify-center min-h-[75vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 glass-panel p-8 rounded-2xl shadow-premium border border-border text-center">
        <Link href="/" className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          CareerPilot AI
        </Link>

        {status === "loading" && (<div className="space-y-4 py-6">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"/>
            <h3 className="text-xl font-semibold">Verifying your email</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we confirm your credentials...
            </p>
          </div>)}

        {status === "success" && (<div className="space-y-4 py-6">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <h3 className="text-xl font-semibold text-emerald-500">
              Email Verified!
            </h3>
            <p className="text-sm text-muted-foreground">
              Thank you. Your email address has been verified successfully.
            </p>
            <div className="pt-4">
              <Link href="/login" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
                Sign In
              </Link>
            </div>
          </div>)}

        {status === "error" && (<div className="space-y-4 py-6">
            <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto text-xl">
              ✕
            </div>
            <h3 className="text-xl font-semibold text-red-500">
              Verification Failed
            </h3>
            <p className="text-sm text-muted-foreground">
              {errorMessage ||
                "The verification token is invalid or has expired."}
            </p>
            <div className="pt-4 flex flex-col gap-2">
              <Link href="/register" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors">
                Create a new account
              </Link>
              <Link href="/login" className="text-sm text-muted-foreground hover:underline">
                Back to Login
              </Link>
            </div>
          </div>)}
      </div>
    </div>);
}
export default function VerifyEmailPage() {
    return (<Suspense fallback={<div className="flex items-center justify-center min-h-[75vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
        </div>}>
      <VerifyEmailContent />
    </Suspense>);
}
