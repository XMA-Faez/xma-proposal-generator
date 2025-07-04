"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/design-card";
import { brandButtonVariants } from "@/lib/design-system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, UserPlus, AlertCircle, Eye, EyeOff, Copy, RefreshCw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewSalesRepPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: ""
  });

  // Generate a secure random password
  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    // Ensure at least one of each character type
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // uppercase
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // lowercase
    password += "0123456789"[Math.floor(Math.random() * 10)]; // number
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // special char
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setFormData(prev => ({ ...prev, password: newPassword }));
    toast.success("Password generated successfully!");
  };

  const handleCopyPassword = async () => {
    if (!formData.password) {
      toast.error("No password to copy");
      return;
    }
    
    try {
      await navigator.clipboard.writeText(formData.password);
      toast.success("Password copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy password");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/sales-reps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create sales representative");
      }

      setSuccess("Sales representative created successfully!");
      
      // Redirect to sales team page after a short delay
      setTimeout(() => {
        router.push("/sales-team");
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-surface-primary min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/sales-team"
            className="px-3 py-1.5 text-sm border border-border-primary text-text-secondary hover:bg-surface-interactive rounded-md transition-colors flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sales Team
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Add Sales Representative</h1>
            <p className="text-text-muted">Create a new sales rep account</p>
          </div>
        </div>

        {/* Form */}
        <Card variant="primary" size="lg">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Sales Rep Details
            </h3>
            <p className="text-sm text-text-muted">
              Fill in the information below to create a new sales representative account.
            </p>
          </div>
          <div className="space-y-6">
            {error && (
              <Alert className="border-semantic-error bg-semantic-error/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-semantic-error">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-status-accepted bg-status-accepted/10">
                <AlertDescription className="text-status-accepted">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-text-secondary">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="bg-surface-elevated border-border-primary text-text-primary placeholder:text-text-muted"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-text-secondary">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className="bg-surface-elevated border-border-primary text-text-primary placeholder:text-text-muted"
                  required
                />
                <p className="text-xs text-text-subtle">
                  This will be used for login and notifications
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-text-secondary">
                  Temporary Password
                </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter temporary password"
                  className="bg-surface-elevated border-border-primary text-text-primary placeholder:text-text-muted pr-24"
                  required
                  minLength={6}
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={togglePasswordVisibility}
                    className="h-full px-2 text-text-muted hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyPassword}
                    disabled={!formData.password}
                    className="h-full px-2 text-text-muted hover:text-text-primary disabled:opacity-50"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePassword}
                  className="border-border-primary text-text-secondary hover:bg-surface-interactive flex items-center gap-2"
                >
                  <RefreshCw className="h-3 w-3" />
                  Generate Password
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPassword}
                  disabled={!formData.password}
                  className="border-border-primary text-text-secondary hover:bg-surface-interactive disabled:opacity-50 flex items-center gap-2"
                >
                  <Copy className="h-3 w-3" />
                  Copy Password
                </Button>
              </div>
                <p className="text-xs text-text-subtle">
                  Click "Generate Password" for a secure random password. The user should change this on first login.
                </p>
              </div>

              <div className="bg-surface-elevated p-4 rounded-lg border border-border-secondary">
                <h4 className="text-sm font-medium text-text-primary mb-2">Permissions Summary</h4>
                <ul className="text-sm text-text-muted space-y-1">
                  <li>• Create and manage their own proposals</li>
                  <li>• View only their own proposals and data</li>
                  <li>• Archive proposals (cannot permanently delete)</li>
                  <li>• Access to sales dashboard with personal analytics</li>
                  <li>• Cannot access admin functions or other reps' data</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 ${brandButtonVariants({ variant: "primary" })} disabled:opacity-50`}
                >
                  {loading ? "Creating..." : "Create Sales Rep"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/sales-team")}
                  className="px-3 py-1.5 text-sm border border-border-primary text-text-secondary hover:bg-surface-interactive rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}