#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🚀 Supabase Setup Script");
console.log("========================\n");

// Check if .env file exists
const envPath = path.join(process.cwd(), ".env");
if (!fs.existsSync(envPath)) {
  console.log("❌ .env file not found!");
  console.log("Please create a .env file with your Supabase credentials:");
  console.log("");
  console.log("EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url");
  console.log("EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key");
  console.log("");
  process.exit(1);
}

console.log("✅ .env file found");

// Read .env file
const envContent = fs.readFileSync(envPath, "utf8");
const urlMatch = envContent.match(/EXPO_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/EXPO_PUBLIC_SUPABASE_ANON_KEY=(.+)/);

if (!urlMatch || !keyMatch) {
  console.log("❌ Missing Supabase credentials in .env file");
  console.log("Please add:");
  console.log("EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url");
  console.log("EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key");
  process.exit(1);
}

const supabaseUrl = urlMatch[1];
const supabaseKey = keyMatch[1];

// Extract project ID from URL
const projectIdMatch = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/);
if (!projectIdMatch) {
  console.log("❌ Invalid Supabase URL format");
  console.log("URL should be: https://your-project-id.supabase.co");
  process.exit(1);
}

const projectId = projectIdMatch[1];
console.log(`✅ Project ID: ${projectId}`);

// Update package.json scripts with actual project ID
const packageJsonPath = path.join(process.cwd(), "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

if (packageJson.scripts["supabase:types"]) {
  packageJson.scripts[
    "supabase:types"
  ] = `supabase gen types typescript --project-id ${projectId} > infrastructure/supabase/types.ts`;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log("✅ Updated package.json with project ID");
}

console.log("\n📋 Next Steps:");
console.log("1. Install Supabase CLI: npm install -g supabase");
console.log("2. Login to Supabase: supabase login");
console.log("3. Generate types: npm run supabase:types");
console.log("4. Or use local development: npm run supabase:types:local");
console.log("");
console.log("🔗 Useful Links:");
console.log("- Supabase Dashboard: https://supabase.com/dashboard");
console.log("- Supabase CLI Docs: https://supabase.com/docs/reference/cli");
console.log("");
console.log("✨ Setup complete!");
