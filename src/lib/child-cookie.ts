import { cookies } from "next/headers";

const COOKIE_NAME = "activeChildId";

export async function getActiveChildId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}
