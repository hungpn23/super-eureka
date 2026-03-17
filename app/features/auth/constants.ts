import type {
  AuthFormField,
  AuthFormInputField,
  AuthFormOtpField,
  ButtonProps,
} from "@nuxt/ui";
import * as v from "valibot";
import type { AuthField, ProviderId } from "./types";

export const DEFAULT_FIELDS: AuthFormField[] = [
  {
    name: "username" satisfies AuthField,
    type: "text",
    label: "Username",
    placeholder: "Enter your username",
    required: true,
  } satisfies AuthFormInputField,
  {
    name: "email" satisfies AuthField,
    type: "email",
    label: "Email",
    placeholder: "Enter your email",
    required: true,
  },
  {
    name: "otp" satisfies AuthField,
    type: "otp",
    label: "Enter OTP from your reveived email",
    required: true,
    length: 6,
  } satisfies AuthFormOtpField,
  {
    name: "password" satisfies AuthField,
    type: "password",
    label: "Password",
    placeholder: "Enter your password",
    required: true,
  },
  {
    name: "confirmPassword" satisfies AuthField,
    type: "password",
    label: "Confirm password",
    placeholder: "Enter your confirm password",
    required: true,
  },
] as const;

export const AUTH_PROVIDERS: (ButtonProps & { id: ProviderId })[] = [
  {
    id: "google" satisfies ProviderId,
    label: "Continue with Google",
    icon: "i-simple-icons-google",
  },
  {
    id: "github" satisfies ProviderId,
    label: "Continue with GitHub",
    icon: "i-simple-icons-github",
  },
  {
    id: "magic-link" satisfies ProviderId,
    label: "Continue with Email",
    icon: "i-simple-icons-simplelogin",
  },
] as const;


