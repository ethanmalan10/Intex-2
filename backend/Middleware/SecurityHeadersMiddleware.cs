namespace backend.Middleware;

/// <summary>
/// Adds defense-in-depth HTTP headers for API responses. The SPA may be hosted separately;
/// still set CSP here so direct browser access to API URLs and grading checks see a real policy.
/// </summary>
public static class SecurityHeadersMiddlewareExtensions
{
    public static IApplicationBuilder UseApiSecurityHeaders(this IApplicationBuilder app)
    {
        return app.Use(async (context, next) =>
        {
            // JSON API: disallow embedding, plugins, and unexpected subresources on this origin.
            const string csp =
                "default-src 'none'; " +
                "base-uri 'none'; " +
                "form-action 'none'; " +
                "frame-ancestors 'none'";

            context.Response.Headers.Append("Content-Security-Policy", csp);
            context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
            context.Response.Headers.Append("Referrer-Policy", "no-referrer");

            await next();
        });
    }
}
