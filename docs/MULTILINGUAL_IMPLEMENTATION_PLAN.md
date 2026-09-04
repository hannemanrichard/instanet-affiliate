# Multilingual Implementation Plan

## Arabic, English, and French Support for Referio Platform

### Overview

This plan outlines a comprehensive approach to implement multilingual support (Arabic, English, and French) for the Referio affiliate marketing platform. The implementation will be easy to maintain, scalable, and follows modern i18n best practices.

## 1. Technology Stack & Dependencies

### Core i18n Library

- **next-intl**: The recommended choice for Next.js applications
  - Built specifically for Next.js 13+ with App Router
  - Excellent TypeScript support
  - RTL (Right-to-Left) support for Arabic
  - Server and client components support
  - SEO-friendly with proper meta tags

### Installation

```bash
npm install next-intl
```

### Alternative Considered

- **react-i18next**: More complex setup, better for pure React apps
- **next-i18next**: Deprecated for App Router

## 2. Project Structure

```
src/
├── i18n/
│   ├── config.ts                 # i18n configuration
│   ├── request.ts               # Server-side request handling
│   └── messages/
│       ├── en.json              # English translations
│       ├── ar.json              # Arabic translations
│       └── fr.json              # French translations
├── middleware.ts                 # Updated middleware for locale detection
└── app/
    ├── [locale]/                 # Locale-based routing
    │   ├── layout.tsx           # Locale-aware layout
    │   ├── page.tsx
    │   ├── (auth)/
    │   ├── (dashboard)/
    │   └── ...
    └── globals.css              # Updated with RTL support
```

## 3. Implementation Phases

### Phase 1: Core Setup (Week 1)

1. **Install and configure next-intl**
2. **Set up locale routing structure**
3. **Create basic translation files**
4. **Update middleware for locale detection**
5. **Configure RTL support for Arabic**

### Phase 2: Navigation & Layout (Week 2)

1. **Translate sidebar navigation**
2. **Translate top navigation**
3. **Add language switcher component**
4. **Update layout components**

### Phase 3: Forms & Validation (Week 3)

1. **Translate form labels and placeholders**
2. **Update validation error messages**
3. **Translate form submission messages**
4. **Update Zod schemas with i18n support**

### Phase 4: Content & Features (Week 4)

1. **Translate dashboard content**
2. **Translate table headers and actions**
3. **Translate modal dialogs**
4. **Translate toast notifications**

### Phase 5: Testing & Polish (Week 5)

1. **Comprehensive testing across all languages**
2. **RTL layout testing for Arabic**
3. **Performance optimization**
4. **Documentation and training**

## 4. Detailed Implementation

### 4.1 Core Configuration

#### `src/i18n/config.ts`

```typescript
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

const locales = ["en", "ar", "fr"];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: "UTC",
    now: new Date(),
  };
});
```

#### `src/i18n/request.ts`

```typescript
import { getRequestConfig } from "next-intl/server";
import { routing } from "./config";

export default getRequestConfig(({ requestLocale }) => {
  let locale = requestLocale ?? routing.defaultLocale;

  if (routing.locales.includes(locale as any)) {
    locale = locale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
```

### 4.2 Middleware Update

#### `src/middleware.ts`

```typescript
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/config";

export default createMiddleware(routing);

export const config = {
  matcher: ["/", "/(ar|en|fr)/:path*"],
};
```

### 4.3 Translation Files Structure

#### `src/i18n/messages/en.json`

```json
{
  "navigation": {
    "home": "Home",
    "leads": "Leads",
    "partners": "Partners",
    "products": "Products",
    "orders": "Orders",
    "stats": "Stats",
    "balance": "Balance",
    "settings": "Settings"
  },
  "forms": {
    "labels": {
      "firstName": "First Name",
      "lastName": "Last Name",
      "phone": "Phone",
      "email": "Email",
      "name": "Name",
      "description": "Description",
      "category": "Category"
    },
    "placeholders": {
      "enterFirstName": "Enter first name",
      "enterLastName": "Enter last name",
      "enterPhone": "Enter phone number"
    },
    "validation": {
      "required": "This field is required",
      "minLength": "Must be at least {min} characters",
      "invalidEmail": "Invalid email format",
      "invalidPhone": "Invalid phone number"
    }
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "update": "Update"
  },
  "messages": {
    "success": {
      "saved": "Successfully saved",
      "created": "Successfully created",
      "updated": "Successfully updated",
      "deleted": "Successfully deleted"
    },
    "error": {
      "generic": "An error occurred",
      "network": "Network error",
      "validation": "Validation error"
    }
  }
}
```

#### `src/i18n/messages/ar.json`

```json
{
  "navigation": {
    "home": "الرئيسية",
    "leads": "العملاء المحتملين",
    "partners": "الشركاء",
    "products": "المنتجات",
    "orders": "الطلبات",
    "stats": "الإحصائيات",
    "balance": "الرصيد",
    "settings": "الإعدادات"
  },
  "forms": {
    "labels": {
      "firstName": "الاسم الأول",
      "lastName": "الاسم الأخير",
      "phone": "رقم الهاتف",
      "email": "البريد الإلكتروني",
      "name": "الاسم",
      "description": "الوصف",
      "category": "الفئة"
    },
    "placeholders": {
      "enterFirstName": "أدخل الاسم الأول",
      "enterLastName": "أدخل الاسم الأخير",
      "enterPhone": "أدخل رقم الهاتف"
    },
    "validation": {
      "required": "هذا الحقل مطلوب",
      "minLength": "يجب أن يكون على الأقل {min} أحرف",
      "invalidEmail": "تنسيق البريد الإلكتروني غير صحيح",
      "invalidPhone": "رقم الهاتف غير صحيح"
    }
  },
  "actions": {
    "save": "حفظ",
    "cancel": "إلغاء",
    "delete": "حذف",
    "edit": "تعديل",
    "create": "إنشاء",
    "update": "تحديث"
  },
  "messages": {
    "success": {
      "saved": "تم الحفظ بنجاح",
      "created": "تم الإنشاء بنجاح",
      "updated": "تم التحديث بنجاح",
      "deleted": "تم الحذف بنجاح"
    },
    "error": {
      "generic": "حدث خطأ",
      "network": "خطأ في الشبكة",
      "validation": "خطأ في التحقق"
    }
  }
}
```

#### `src/i18n/messages/fr.json`

```json
{
  "navigation": {
    "home": "Accueil",
    "leads": "Prospects",
    "partners": "Partenaires",
    "products": "Produits",
    "orders": "Commandes",
    "stats": "Statistiques",
    "balance": "Solde",
    "settings": "Paramètres"
  },
  "forms": {
    "labels": {
      "firstName": "Prénom",
      "lastName": "Nom de famille",
      "phone": "Téléphone",
      "email": "E-mail",
      "name": "Nom",
      "description": "Description",
      "category": "Catégorie"
    },
    "placeholders": {
      "enterFirstName": "Entrez le prénom",
      "enterLastName": "Entrez le nom de famille",
      "enterPhone": "Entrez le numéro de téléphone"
    },
    "validation": {
      "required": "Ce champ est requis",
      "minLength": "Doit contenir au moins {min} caractères",
      "invalidEmail": "Format d'e-mail invalide",
      "invalidPhone": "Numéro de téléphone invalide"
    }
  },
  "actions": {
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "edit": "Modifier",
    "create": "Créer",
    "update": "Mettre à jour"
  },
  "messages": {
    "success": {
      "saved": "Enregistré avec succès",
      "created": "Créé avec succès",
      "updated": "Mis à jour avec succès",
      "deleted": "Supprimé avec succès"
    },
    "error": {
      "generic": "Une erreur s'est produite",
      "network": "Erreur réseau",
      "validation": "Erreur de validation"
    }
  }
}
```

### 4.4 Language Switcher Component

#### `src/components/layout/language-switcher.tsx`

```typescript
"use client";

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common');

  const handleLanguageChange = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  const currentLanguage = languages.find(lang => lang.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentLanguage?.flag} {currentLanguage?.name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={locale === language.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 4.5 Updated Layout Structure

#### `src/app/[locale]/layout.tsx`

```typescript
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['en', 'ar', 'fr'];

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### 4.6 Updated Components

#### Example: Updated Sidebar Component

```typescript
"use client";

import { useTranslations } from "next-intl";
// ... other imports

export function AppSidebar() {
  const t = useTranslations("navigation");
  // ... existing code

  const adminNavigation = [
    {
      title: t("home"),
      href: "/dashboard",
      icon: Home,
    },
    {
      title: t("leads"),
      href: "/leads",
      icon: UserPlus,
    },
    // ... other navigation items
  ];

  // ... rest of component
}
```

### 4.7 Updated Validation Schemas

#### `src/lib/validations/lead.ts` (Updated)

```typescript
import * as z from "zod";

// Create a function that accepts translation function
export const createLeadFormSchema = (t: (key: string) => string) => {
  const createItemSchema = (isWholesale: boolean) =>
    z.object({
      product: z.string().min(1, t("forms.validation.productRequired")),
      color: z.string().min(1, t("forms.validation.colorRequired")),
      size: isWholesale
        ? z.string().optional()
        : z.string().min(1, t("forms.validation.sizeRequired")),
      price: z.number().min(0, t("forms.validation.pricePositive")),
      qty: z.number().min(1, t("forms.validation.qtyMin")),
      productRetailMin: z.number().optional(),
      productWholesaleMin: z.number().optional(),
    });

  return z.object({
    firstname: z.string().min(1, t("forms.validation.firstNameRequired")),
    lastname: z.string().min(1, t("forms.validation.lastNameRequired")),
    phone: z.string().min(1, t("forms.validation.phoneRequired")),
    // ... rest of schema
  });
};
```

## 5. RTL Support for Arabic

### 5.1 CSS Updates

#### `src/app/globals.css` (Additions)

```css
/* RTL Support */
[dir="rtl"] {
  direction: rtl;
}

[dir="rtl"] .sidebar {
  right: 0;
  left: auto;
}

[dir="rtl"] .ml-auto {
  margin-left: 0;
  margin-right: auto;
}

[dir="rtl"] .mr-auto {
  margin-right: 0;
  margin-left: auto;
}

/* RTL-specific spacing adjustments */
[dir="rtl"] .space-x-2 > * + * {
  margin-left: 0;
  margin-right: 0.5rem;
}

[dir="rtl"] .space-x-4 > * + * {
  margin-left: 0;
  margin-right: 1rem;
}
```

### 5.2 Tailwind Configuration

#### `tailwind.config.ts` (Updates)

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ... existing config
    },
  },
  plugins: [
    // ... existing plugins
  ],
  // Add RTL support
  future: {
    hoverOnlyWhenSupported: true,
  },
};

export default config;
```

## 6. Testing Strategy

### 6.1 Unit Tests

- Test translation functions
- Test locale switching
- Test RTL layout adjustments

### 6.2 Integration Tests

- Test complete user flows in all languages
- Test form validation in all languages
- Test navigation in all languages

### 6.3 Visual Testing

- Screenshot testing for RTL layouts
- Cross-browser testing
- Mobile responsiveness testing

## 7. Performance Considerations

### 7.1 Bundle Size Optimization

- Lazy load translation files
- Use dynamic imports for locale-specific content
- Implement code splitting by locale

### 7.2 Caching Strategy

- Cache translation files
- Implement proper cache headers
- Use CDN for static translation assets

## 8. SEO Considerations

### 8.1 URL Structure

- Use locale prefixes: `/en/dashboard`, `/ar/dashboard`, `/fr/dashboard`
- Implement proper canonical URLs
- Add hreflang tags

### 8.2 Meta Tags

- Localized meta descriptions
- Localized Open Graph tags
- Proper language declarations

## 9. Maintenance & Updates

### 9.1 Translation Management

- Use translation keys consistently
- Implement translation validation
- Set up translation review process

### 9.2 Developer Guidelines

- Always use translation keys instead of hardcoded text
- Follow naming conventions for translation keys
- Document new translation requirements

## 10. Rollout Strategy

### 10.1 Phase 1: English (Current)

- Keep existing English content
- Set up i18n infrastructure
- Test with English-only

### 10.2 Phase 2: Arabic

- Add Arabic translations
- Test RTL functionality
- Deploy to staging

### 10.3 Phase 3: French

- Add French translations
- Complete testing
- Full deployment

## 11. Success Metrics

### 11.1 Technical Metrics

- Page load times across locales
- Bundle size impact
- Error rates by locale

### 11.2 User Experience Metrics

- User engagement by locale
- Form completion rates
- User feedback scores

## 12. Risk Mitigation

### 12.1 Technical Risks

- **Risk**: RTL layout issues
- **Mitigation**: Comprehensive testing, gradual rollout

### 12.2 Content Risks

- **Risk**: Translation quality
- **Mitigation**: Professional translation services, review process

### 12.3 Performance Risks

- **Risk**: Bundle size increase
- **Mitigation**: Lazy loading, code splitting

## 13. Timeline

| Week | Phase      | Deliverables                             |
| ---- | ---------- | ---------------------------------------- |
| 1    | Core Setup | i18n infrastructure, basic routing       |
| 2    | Navigation | Translated navigation, language switcher |
| 3    | Forms      | Translated forms, validation messages    |
| 4    | Content    | Dashboard content, tables, modals        |
| 5    | Testing    | Comprehensive testing, bug fixes         |

## 14. Resources Required

### 14.1 Development

- 1 Senior Frontend Developer (5 weeks)
- 1 QA Engineer (2 weeks)

### 14.2 Translation

- Professional translation service
- Native speaker review

### 14.3 Testing

- Cross-browser testing tools
- Mobile device testing
- Performance monitoring tools

## Conclusion

This implementation plan provides a comprehensive, sustainable approach to adding multilingual support to the Referio platform. The phased approach ensures minimal disruption to existing functionality while building a robust i18n foundation for future growth.

The use of next-intl ensures excellent Next.js integration, TypeScript support, and RTL capabilities essential for Arabic support. The structured approach to translations and the emphasis on testing will ensure a high-quality user experience across all supported languages.
