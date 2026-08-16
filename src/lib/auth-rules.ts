/** Strong-password policy enforced at registration and password reset. */
export function passwordIssues(password: string): string[] {
  const issues: string[] = [];
  if (password.length < 8) issues.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) issues.push("One uppercase letter");
  if (!/[a-z]/.test(password)) issues.push("One lowercase letter");
  if (!/[0-9]/.test(password)) issues.push("One number");
  if (!/[^A-Za-z0-9]/.test(password)) issues.push("One special character");
  return issues;
}

export function isGmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith("@gmail.com");
}
