export type AuthField =
  | "username"
  | "email"
  | "otp"
  | "password"
  | "confirmPassword";

export type ProviderId = "google" | "github" | "magic-link";

export type GoogleQueryParams = {
  client_id: string;
  redirect_uri: string;
  response_type: "code";
  scope: string;
  state?: string;
  include_granted_scopes?: "true" | "false";
  prompt?: "none" | "consent" | "select_account";
};

export type TokenPairResponse = {
  accessToken: string;
  refreshToken: string;
};

export type ConfirmEmailVerificationResponse = {
  verifiedToken: string;
};

export type SignUpState = {
  email: string;
  otp: string;
  username: string;
  password: string;
  isRequested: boolean;
  isEmailVerified: boolean;
  verifiedToken: string;
};
