"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "../../../store/auth";
import { useUpdateProfile, useLogout } from "../../../hooks/use-auth";

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  target_role: z.string().min(1, "Target role is required"),
  current_experience_level: z.string().min(1, "Experience level is required"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const logoutMutation = useLogout();
  const updateProfileMutation = useUpdateProfile();
  
  // Select state from store
  const { user, accessToken, isInitialized } = useAuthStore();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form initialization
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      target_role: "",
      current_experience_level: "",
    },
  });

  // Guard routing context
  useEffect(() => {
    if (isInitialized && !accessToken) {
      router.push("/login");
    }
  }, [accessToken, isInitialized, router]);

  // Reset form values when user profile is loaded
  useEffect(() => {
    if (user) {
      reset({
        first_name: user.profile?.first_name || "",
        last_name: user.profile?.last_name || "",
        target_role: user.profile?.target_role || "",
        current_experience_level: user.profile?.current_experience_level || "mid",
      });
    }
  }, [user, reset]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push("/login");
    } catch (err) {
      console.error("Logout failure:", err);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await updateProfileMutation.mutateAsync(data);
      setSuccessMsg("Profile updated successfully.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile settings.");
    }
  };

  if (!isInitialized || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      {/* Top Banner Dashboard Navigation */}
      <div className="flex items-center justify-between border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your CareerPilot AI identity and target profile parameters.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg hover:bg-destructive/20 text-sm font-semibold transition-colors"
        >
          Sign out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Security Meta Information */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl border border-border space-y-4">
            <h3 className="font-bold text-lg">System Metadata</h3>
            
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground block">Email Address</span>
              <span className="text-sm font-medium break-all">{user.email}</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground block">RBAC Scope / Role</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20 capitalize">
                {user.role}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground block">Verification Status</span>
              {user.is_verified ? (
                <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                  ✓ Verified Account
                </span>
              ) : (
                <span className="text-xs text-yellow-500 font-semibold flex items-center gap-1 animate-pulse">
                  ⚠ Unverified Account
                </span>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground block">Active Status</span>
              <span className="text-xs text-emerald-500 font-semibold">
                ● Active Connection
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Settings Form */}
        <div className="md:col-span-2">
          <div className="glass-panel p-8 rounded-xl border border-border space-y-6">
            <h3 className="font-bold text-lg">Profile Details</h3>

            {successMsg && (
              <div className="p-3 text-sm rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 text-sm rounded-lg border border-red-500/20 bg-red-500/5 text-red-500">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-foreground">
                    First Name
                  </label>
                  <input
                    id="first_name"
                    type="text"
                    className="mt-1 block w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm transition-all"
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
                    className="mt-1 block w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm transition-all"
                    {...register("last_name")}
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-xs text-destructive">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="target_role" className="block text-sm font-medium text-foreground">
                  Target Career Role
                </label>
                <input
                  id="target_role"
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer"
                  className="mt-1 block w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm transition-all"
                  {...register("target_role")}
                />
                {errors.target_role && (
                  <p className="mt-1 text-xs text-destructive">{errors.target_role.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="current_experience_level" className="block text-sm font-medium text-foreground">
                  Experience Level
                </label>
                <select
                  id="current_experience_level"
                  className="mt-1 block w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm transition-all"
                  {...register("current_experience_level")}
                >
                  <option value="entry">Entry Level (&lt; 2 years)</option>
                  <option value="mid">Mid Level (2-5 years)</option>
                  <option value="senior">Senior Level (5-8 years)</option>
                  <option value="lead">Lead / Principal (8+ years)</option>
                </select>
                {errors.current_experience_level && (
                  <p className="mt-1 text-xs text-destructive">{errors.current_experience_level.message}</p>
                )}
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                  className="inline-flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-40"
                >
                  {isSubmitting ? "Saving changes..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
