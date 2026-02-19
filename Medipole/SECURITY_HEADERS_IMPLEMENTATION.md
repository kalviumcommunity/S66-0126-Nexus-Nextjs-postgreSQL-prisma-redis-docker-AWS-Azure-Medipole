# Security Headers Implementation

## Overview

This implementation provides comprehensive HTTP security headers to protect against common web application vulnerabilities. The security headers enforce HTTPS connections, prevent XSS attacks, control cross-origin access, and protect against various other attack vectors.

## Security Headers Implemented

### 1. HSTS (HTTP Strict Transport Security)

**Purpose**: Forces browsers to always use HTTPS connections
**Attack Prevented**: Man-in-the-Middle (MITM) attacks
**Configuration**:

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

**Key Features**:

- `max-age=63072000`: 2-year validity period
- `includeSubDomains`: Applies to all subdomains
- `preload`: Eligible for HSTS preload list in browsers

### 2. CSP (Content Security Policy)

**Purpose**: Restricts allowed sources for scripts, styles, and content
**Attack Prevented**: Cross-Site Scripting (XSS)
**Configuration**:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://apis.google.com; frame-src 'self' https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests
```

**Key Directives**:

- `default-src 'self'`: Only allow resources from same origin by default
- `script-src`: Control script sources (includes Google Analytics)
- `style-src`: Control CSS sources (includes Google Fonts)
- `img-src`: Allow images from self, data URLs, and HTTPS sources
- `font-src`: Allow fonts from self and Google Fonts
- `connect-src`: Control connection sources
- `frame-src`: Control iframe sources
- `object-src 'none'`: Block plugins like Flash
- `upgrade-insecure-requests`: Automatically upgrade HTTP requests to HTTPS

### 3. CORS (Cross-Origin Resource Sharing)

**Purpose**: Controls which domains can access your API
**Attack Prevented**: Unauthorized API access
**Implementation**: Custom CORS utility in `src/lib/cors.ts`

**Key Features**:

- Configurable allowed origins
- Controlled HTTP methods
- Restricted headers
- Credential support
- Preflight request handling

### 4. X-Frame-Options

**Purpose**: Prevents clickjacking attacks
**Configuration**:

```http
X-Frame-Options: DENY
```

### 5. X-Content-Type-Options

**Purpose**: Prevents MIME type sniffing
**Configuration**:

```http
X-Content-Type-Options: nosniff
```

### 6. Referrer-Policy

**Purpose**: Controls referrer information sharing
**Configuration**:

```http
Referrer-Policy: strict-origin-when-cross-origin
```

### 7. Permissions-Policy

**Purpose**: Controls browser feature permissions
**Configuration**:

```http
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=(), fullscreen=self, display-capture=()
```

## Implementation Details

### Next.js Configuration (`next.config.ts`)

All security headers are configured in the Next.js configuration file using the `headers()` async function:

```typescript
async headers() {
  return [
    {
      source: "/(.*)",
      headers: [
        // All security headers defined here
      ],
    },
  ];
}
```

### CORS Utility (`src/lib/cors.ts`)

Custom CORS implementation providing:

- Origin validation
- Preflight request handling
- Configurable security settings
- Development/production environment awareness

### Security Headers API (`src/app/api/security-headers/route.ts`)

API endpoint for testing and verifying security headers:

- GET: Returns detailed security headers information
- POST: Tests CORS configuration
- Real-time header analysis

### Security Headers Test Page (`src/app/security-headers/page.tsx`)

Interactive frontend for testing security headers:

- Real-time header verification
- CORS testing capabilities
- Security score display
- Configuration recommendations

## Testing and Verification

### Local Testing

1. Visit `/security-headers` to test the implementation
2. Check browser DevTools → Network Tab → Response Headers
3. Verify all security headers are present
4. Test CORS functionality with cross-origin requests

### Online Security Scanners

Use these tools to verify your security headers:

- **securityheaders.com**: Comprehensive security header analysis
- **observatory.mozilla.org**: Mozilla's web security observatory
- **SSL Labs**: SSL/TLS configuration testing

### Header Verification Checklist

✅ HSTS header present with 2-year max-age
✅ CSP header configured with appropriate directives
✅ CORS headers properly configured
✅ X-Frame-Options set to DENY
✅ X-Content-Type-Options set to nosniff
✅ Referrer-Policy configured
✅ Permissions-Policy implemented

## Security Best Practices

### 1. HSTS Implementation

- **Production**: Always use 2-year max-age
- **Development**: Consider shorter max-age for testing
- **Preload**: Submit to HSTS preload list for maximum protection
- **Subdomains**: Include subdomains unless specifically needed

### 2. CSP Configuration

- **Start Strict**: Begin with restrictive policy and gradually add trusted sources
- **Report Only**: Use `Content-Security-Policy-Report-Only` during testing
- **Third-Party Integration**: Carefully audit and include trusted third-party sources
- **Regular Updates**: Review and update CSP as application evolves

### 3. CORS Security

- **Explicit Origins**: Never use `*` in production
- **Credential Handling**: Only allow credentials when necessary
- **Method Restrictions**: Limit to required HTTP methods
- **Header Control**: Restrict custom headers to minimum required

### 4. Ongoing Maintenance

- **Regular Audits**: Periodically review security headers
- **Dependency Updates**: Keep security-related packages updated
- **Monitoring**: Monitor for security header violations
- **Documentation**: Maintain clear documentation of security policies

## Impact on Third-Party Integrations

### Potential Affected Services

- **Analytics**: Google Analytics, etc. (requires CSP script-src inclusion)
- **Fonts**: Google Fonts, etc. (requires CSP font-src and style-src)
- **APIs**: External APIs (requires CSP connect-src)
- **Embedded Content**: iframes, etc. (requires CSP frame-src)

### Mitigation Strategies

- **Whitelist Approach**: Explicitly allow trusted third-party domains
- **Testing**: Thoroughly test after CSP changes
- **Fallback Plans**: Have rollback strategies for breaking changes
- **Gradual Implementation**: Roll out changes in stages

## Configuration Examples

### Development vs Production

```typescript
// Development configuration (more permissive)
const devConfig = {
  hsts: "max-age=3600", // 1 hour for development
  csp: "default-src 'self' 'unsafe-inline' 'unsafe-eval'", // More permissive for development
  cors: ["http://localhost:3000", "http://localhost:3001"],
};

// Production configuration (strict)
const prodConfig = {
  hsts: "max-age=63072000; includeSubDomains; preload", // 2 years
  csp: "default-src 'self'", // Very restrictive
  cors: ["https://your-production-domain.com"],
};
```

### Environment-Specific Headers

```typescript
// In next.config.ts
async headers() {
  const isProduction = process.env.NODE_ENV === "production";

  return [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Strict-Transport-Security",
          value: isProduction
            ? "max-age=63072000; includeSubDomains; preload"
            : "max-age=3600"
        }
      ]
    }
  ];
}
```

## Future Enhancements

### Planned Improvements

- **Dynamic CSP**: Runtime CSP generation based on page requirements
- **Advanced Monitoring**: Real-time security header violation detection
- **Automated Testing**: Integration with CI/CD security scanning
- **Policy Management**: Centralized security policy configuration
- **Advanced Features**: Feature-Policy expansion, COOP/COEP headers

### Security Headers Roadmap

1. **COOP (Cross-Origin-Opener-Policy)**
2. **COEP (Cross-Origin-Embedder-Policy)**
3. **Reporting API** integration for CSP violations
4. **Advanced CORS** policies with regex origin matching
5. **Security Header** automation tools

## Conclusion

The security headers implementation provides robust protection against common web application vulnerabilities through a layered security approach. By enforcing HTTPS, controlling content sources, and restricting cross-origin access, the application maintains a strong security posture while preserving functionality for legitimate use cases.

Regular monitoring, testing, and updates ensure that the security headers continue to provide effective protection as new threats emerge and the application evolves.
