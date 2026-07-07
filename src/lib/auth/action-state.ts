export type AuthActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<
    Record<
      | "full_name"
      | "email"
      | "password"
      | "confirm_password"
      | "terms_accepted",
      string[]
    >
  >;
};
