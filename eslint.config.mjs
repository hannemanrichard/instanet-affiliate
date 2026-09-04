import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-var": "off",
      "prefer-rest-params": "off",
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
  {
    // Phase 6 — keep browser code off the anon Supabase client and server-only data layer
    files: ["src/features/**/presentation/**/*.{ts,tsx}", "src/features/**/application/use*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/infrastructure/supabase/client",
              message:
                "Use apiFetch → /api/* instead of the browser Supabase client.",
            },
            {
              name: "@/infrastructure/supabase/server",
              message:
                "supabaseServer is server-only. Call it from Route Handlers / application services, not hooks or presentation.",
            },
          ],
          patterns: [
            {
              group: ["**/features/*/data", "**/features/*/data/*"],
              message:
                "Do not import feature data services from hooks/presentation. Use apiFetch → /api/*.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/__tests__/**/*", "**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "react/display-name": "off",
      "@typescript-eslint/no-require-imports": "off",
      "no-restricted-imports": "off",
    },
  },
];

export default eslintConfig;
