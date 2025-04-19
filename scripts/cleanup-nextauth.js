#!/usr/bin/env node
/**
 * This script removes NextAuth-related files and references
 * after migrating to Supabase authentication
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Files to remove
const filesToRemove = [
  "auth.ts",
  "app/api/auth/[...nextauth]/route.ts",
  "components/auth/AuthProvider.tsx",
];

// Execute the script
try {
  console.log("Cleaning up NextAuth files...");

  // Remove NextAuth files
  filesToRemove.forEach((file) => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Removed: ${file}`);
    } else {
      console.log(`File not found: ${file}`);
    }
  });

  // Uninstall NextAuth package
  console.log("Uninstalling next-auth package...");
  execSync("npm uninstall next-auth", { stdio: "inherit" });

  console.log("NextAuth cleanup completed successfully!");
} catch (error) {
  console.error("Error during cleanup:", error);
  process.exit(1);
}
