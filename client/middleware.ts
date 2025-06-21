import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token");
  const path = request.nextUrl.pathname;

  const isProfilePage = /^\/school\/[^\/]+\/profile\/[^\/]+$/.test(path);
  const isProtected =
    path === "/console" || (path.includes("/school") && !isProfilePage);

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}
