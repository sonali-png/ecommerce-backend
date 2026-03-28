import bcrypt from "bcryptjs";

export async function generateHashedPasswords(pw = "user123") {
  if (!pw) return null;
  const hashed = await bcrypt.hash(pw, 10);
  return hashed;
}
