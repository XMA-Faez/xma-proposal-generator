"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild className="border-zinc-600 text-gray-300">
          <Link href="/sales-team">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sales Team
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Add Sales Representative</h1>
          <p className="text-gray-400">Create a new sales rep account</p>
        </div>
      </div>

      {/* Form */}
      <Card className="bg-zinc-800 border-zinc-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Sales Rep Details
          </CardTitle>
          <CardDescription className="text-gray-400">
            Fill in the information below to create a new sales representative account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-500 bg-red-500/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-500/10">
              <AlertDescription className="text-green-400">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className="bg-zinc-900 border-zinc-600 text-white placeholder:text-gray-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className="bg-zinc-900 border-zinc-600 text-white placeholder:text-gray-500"
                required
              />
              <p className="text-xs text-gray-500">
                This will be used for login and notifications
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
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
                  className="bg-zinc-900 border-zinc-600 text-white placeholder:text-gray-500 pr-24"
                  required
                  minLength={6}
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={togglePasswordVisibility}
                    className="h-full px-2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyPassword}
                    disabled={!formData.password}
                    className="h-full px-2 text-gray-400 hover:text-white disabled:opacity-50"
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
                  className="border-zinc-600 text-gray-300 hover:bg-zinc-700 flex items-center gap-2"
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
                  className="border-zinc-600 text-gray-300 hover:bg-zinc-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <Copy className="h-3 w-3" />
                  Copy Password
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Click "Generate Password" for a secure random password. The user should change this on first login.
              </p>
            </div>

            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-700">
              <h4 className="text-sm font-medium text-white mb-2">Permissions Summary</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Create and manage their own proposals</li>
                <li>• View only their own proposals and data</li>
                <li>• Archive proposals (cannot permanently delete)</li>
                <li>• Access to sales dashboard with personal analytics</li>
                <li>• Cannot access admin functions or other reps' data</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Creating..." : "Create Sales Rep"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/sales-team")}
                className="border-zinc-600 text-gray-300 hover:bg-zinc-700"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}