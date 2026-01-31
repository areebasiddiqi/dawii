import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const locales = ['en', 'ar']
const defaultLocale = 'en'

function getLocale(request: NextRequest) {
    // Can be improved to check 'Accept-Language' header
    return defaultLocale
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 1. Check Locale
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (!pathnameHasLocale) {
        const locale = getLocale(request)
        request.nextUrl.pathname = `/${locale}${pathname}`
        return NextResponse.redirect(request.nextUrl)
    }

    // 2. Supabase Session Management
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // This will refresh the session if needed
    const { data: { user } } = await supabase.auth.getUser()

    // 3. Protect routes that require authentication
    const protectedRoutes = ['/dashboard', '/admin']
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.includes(route)
    )

    if (isProtectedRoute && !user) {
        // Extract locale from pathname
        const locale = locales.find(loc => pathname.startsWith(`/${loc}/`)) || defaultLocale
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = `/${locale}/login`
        return NextResponse.redirect(loginUrl)
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
}
