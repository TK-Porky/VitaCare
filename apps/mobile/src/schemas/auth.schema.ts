import { z } from 'zod';

// Regex for Cameroon phone numbers (9 digits)
const phoneRegex = /^[6](2|5|6|7|8|9)[0-9]{7}$/;

export const loginEmailSchema = z.object({
  email: z.string().min(1, 'L\'adresse email est requise').email('Adresse email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  rememberMe: z.boolean().optional(),
});

export type LoginEmailFormValues = z.infer<typeof loginEmailSchema>;

export const loginPhoneSchema = z.object({
  phone: z.string().min(1, 'Le numéro de téléphone est requis').regex(phoneRegex, 'Numéro de téléphone invalide'),
});

export type LoginPhoneFormValues = z.infer<typeof loginPhoneSchema>;

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet est requis (min 2 caractères)'),
  mode: z.enum(['phone', 'email']),
  phone: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.mode === 'phone') {
    if (!data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Le numéro de téléphone est requis',
        path: ['phone'],
      });
    } else if (!phoneRegex.test(data.phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Numéro de téléphone invalide',
        path: ['phone'],
      });
    }
  } else {
    if (!data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'L\'adresse email est requise',
        path: ['email'],
      });
    } else if (!z.string().email().safeParse(data.email).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Adresse email invalide',
        path: ['email'],
      });
    }

    if (!data.password || data.password.length < 8 || data.password.includes(' ')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Minimum 8 caractères, sans espace',
        path: ['password'],
      });
    }

    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Les mots de passe ne correspondent pas',
        path: ['confirmPassword'],
      });
    }
  }
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordEmailSchema = z.object({
  email: z.string().min(1, 'L\'adresse email est requise').email('Adresse email invalide'),
});

export type ForgotPasswordEmailValues = z.infer<typeof forgotPasswordEmailSchema>;

export const forgotPasswordOtpSchema = z.object({
  otp: z.string().length(6, 'Le code doit contenir 6 chiffres'),
});

export type ForgotPasswordOtpValues = z.infer<typeof forgotPasswordOtpSchema>;

export const forgotPasswordResetSchema = z.object({
  password: z.string().min(8, 'Minimum 8 caractères, sans espace').refine(s => !s.includes(' '), 'Sans espace'),
  confirmPassword: z.string().min(1, 'La confirmation est requise'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export type ForgotPasswordResetValues = z.infer<typeof forgotPasswordResetSchema>;

export const otpSchema = z.object({
  code: z.string().length(5, 'Le code doit contenir 5 chiffres'),
});

export type OtpFormValues = z.infer<typeof otpSchema>;

export const onboardingLocationSchema = z.object({
  searchQuery: z.string().min(1, 'Veuillez indiquer votre position'),
});

export type OnboardingLocationValues = z.infer<typeof onboardingLocationSchema>;

export const onboardingSearchSchema = z.object({
  reason: z.string().min(1, 'Veuillez sélectionner une option'),
});

export type OnboardingSearchValues = z.infer<typeof onboardingSearchSchema>;

export const onboardingLanguageSchema = z.object({
  language: z.string().min(1, 'Veuillez sélectionner une langue'),
});

export type OnboardingLanguageValues = z.infer<typeof onboardingLanguageSchema>;
