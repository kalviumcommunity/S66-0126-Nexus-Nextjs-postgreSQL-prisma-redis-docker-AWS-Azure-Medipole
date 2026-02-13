# Testing the Centralized Error Handling System

## 📋 Quick Reference

| Task | Command |
|------|---------|
| **Start dev server** | `npm run dev` |
| **Start prod server** | `npm run build && NODE_ENV=production npm start` |
| **Test success** | `curl http://localhost:3000/api/test-demo?type=success` |
| **Test validation error** | `curl http://localhost:3000/api/test-demo?type=validation-error` |
| **View formatted JSON** | Add `\| jq '.'` to curl command |

---

## 🚀 Step 1: Start Development Server

```bash
npm run dev
```

You'll see output like:
```
> next dev
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  ▲ Ready in 2.5s
```

---

## 🧪 Step 2: Test in New Terminal

### Test 1: Successful Response

```bash
curl http://localhost:3000/api/test-demo?type=success | jq '.'
```

**Expected Response (Development):**
```json
{
  "success": true,
  "message": "Success test passed",
  "data": {
    "message": "Test successful!",
    "timestamp": "2026-02-13T15:30:00.000Z",
    "environment": "development"
  },
  "timestamp": "2026-02-13T15:30:00.000Z"
}
```

### Test 2: Validation Error

```bash
curl http://localhost:3000/api/test-demo?type=validation-error | jq '.'
```

**Expected Response (Development) - Details Shown:**
```json
{
  "success": false,
  "message": "Missing required parameters",
  "error": {
    "code": "E001",
    "details": {
      "message": "Missing required parameters",
      "details": {
        "missing_fields": ["userId", "email"],
        "provided_fields": ["name"]
      },
      "stack": "Error: Missing required parameters\n    at GET (/app/src/app/api/test-demo/route.ts:56:11)"
    }
  },
  "timestamp": "2026-02-13T15:30:05.000Z"
}
```

### Test 3: Database Error

```bash
curl http://localhost:3000/api/test-demo?type=db-error | jq '.'
```

**Expected Response (Development) - Full Context:**
```json
{
  "success": false,
  "message": "Database connection timeout",
  "error": {
    "code": "E301",
    "details": {
      "message": "Database connection timeout",
      "details": {
        "connection_string": "[REDACTED]",
        "timeout_ms": 5000,
        "retry_count": 3
      },
      "stack": "Error: Database connection timeout\n    at GET (/app/src/app/api/test-demo/route.ts:67:11)"
    }
  },
  "timestamp": "2026-02-13T15:30:10.000Z"
}
```

### Test 4: Authentication Error

```bash
curl http://localhost:3000/api/test-demo?type=auth-error | jq '.'
```

**Expected Response (Development):**
```json
{
  "success": false,
  "message": "Invalid authentication token",
  "error": {
    "code": "E101",
    "details": {
      "message": "Invalid authentication token",
      "stack": "Error: Invalid authentication token\n    at GET (/app/src/app/api/test-demo/route.ts:71:11)"
    }
  },
  "timestamp": "2026-02-13T15:30:15.000Z"
}
```

### Test 5: Authorization Error

```bash
curl http://localhost:3000/api/test-demo?type=authorization-error | jq '.'
```

### Test 6: Not Found Error

```bash
curl http://localhost:3000/api/test-demo?type=not-found | jq '.'
```

### Test 7: Business Logic Error

```bash
curl http://localhost:3000/api/test-demo?type=business-error | jq '.message,.error.code'
```

### Test 8: Internal Error

```bash
curl http://localhost:3000/api/test-demo?type=internal-error | jq '.'
```

---

## 🔍 Step 3: Watch Console and Logs

**In the development terminal**, you'll see structured JSON logs like:

```json
{
  "timestamp": "2026-02-13T15:30:05.000Z",
  "level": "error",
  "message": "Error in /api/test-demo",
  "environment": "development",
  "context": {
    "endpoint": "/api/test-demo",
    "method": "GET",
    "testType": "validation-error"
  },
  "errorCode": "E001",
  "category": "VALIDATION",
  "statusCode": 400,
  "details": {
    "message": "Missing required parameters",
    "details": {
      "missing_fields": ["userId", "email"],
      "provided_fields": ["name"]
    },
    "stack": "Error: Missing required parameters\n    at GET (/app/src/app/api/test-demo/route.ts:56:11)"
  },
  "isApplicationError": true
}
```

---

## 🔄 Step 4: Switch to Production Mode

### Build and Start Production

```bash
# Stop the dev server first (Ctrl+C)
npm run build
NODE_ENV=production npm start
```

### Test Same Errors in Production

```bash
# Validation error in production
curl http://localhost:3000/api/test-demo?type=validation-error | jq '.'
```

**Expected Response (Production) - Safe Message:**
```json
{
  "success": false,
  "message": "Invalid request. Please check your input.",
  "error": {
    "code": "E001"
  },
  "timestamp": "2026-02-13T15:35:00.000Z"
}
```

**Notice the differences:**
- ✓ No detailed error message shown
- ✓ No stack trace
- ✓ Only error code (E001) for support reference
- ✓ Generic, user-friendly message

### Check Production Logs

**In the production terminal**, logs show full details server-side:

```json
{
  "timestamp": "2026-02-13T15:35:00.000Z",
  "level": "error",
  "message": "Error in /api/test-demo",
  "environment": "production",
  "context": {
    "endpoint": "/api/test-demo",
    "method": "GET",
    "testType": "validation-error"
  },
  "errorCode": "E001",
  "category": "VALIDATION",
  "statusCode": 400,
  "stack": "[REDACTED]"
}
```

**Notice:**
- ✓ Full context still logged server-side
- ✓ Stack trace marked as [REDACTED]
- ✓ Details not exposed to client

---

## 📊 Test All Error Types

Run this to test all error types quickly:

```bash
for type in success validation-error db-error auth-error authorization-error not-found business-error internal-error; do
    echo ""
    echo "Testing: $type"
    curl -s "http://localhost:3000/api/test-demo?type=$type" | jq '{success, message, code: .error.code}'
done
```

---

## 📈 Test Real API Routes

### Users Endpoint

**Success:**
```bash
curl http://localhost:3000/api/users?page=1&limit=10 | jq '.success,.message'
```

**Invalid pagination:**
```bash
curl http://localhost:3000/api/users?page=-1&limit=abc | jq '{success, message}'
```

### Donors Endpoint

**Success:**
```bash
curl http://localhost:3000/api/donors | jq '.success,.message'
```

**Missing required field:**
```bash
curl -X POST http://localhost:3000/api/donors \
  -H "Content-Type: application/json" \
  -d '{"bloodGroup":"O+"}' | jq '{success, message, code: .error.code}'
```

---

## 🎯 Key Observations

### Development Mode
```bash
NODE_ENV=development npm run dev
curl http://localhost:3000/api/test-demo?type=validation-error
```

✓ Full error message  
✓ Complete stack trace  
✓ Detailed context  
✓ Easy to debug  

### Production Mode
```bash
NODE_ENV=production npm start
curl http://localhost:3000/api/test-demo?type=validation-error
```

✓ Generic message  
✓ No stack trace  
✓ Error code for support  
✓ User trust maintained  

---

## 🎬 Video Demo Script

If recording a demo, follow this flow:

1. **Setup (0-10 seconds)**
   - Show folder structure
   - Show test-demo/route.ts

2. **Development Test (10-30 seconds)**
   - Start dev server
   - Run: `curl http://localhost:3000/api/test-demo?type=validation-error | jq '.'`
   - Show: Full error details in response
   - Show: Full stack trace in console

3. **Production Test (30-50 seconds)**
   - Build and start production
   - Run: Same curl command
   - Show: Generic message in response
   - Show: [REDACTED] stack in logs

4. **Comparison (50-60 seconds)**
   - Side-by-side comparison
   - Highlight security improvement
   - Mention user trust

5. **Reflection (60-90 seconds)**
   - "How would this help in production?"
   - Show how error codes enable support
   - Show how logs help debugging
   - Emphasize security vs debuggability balance

---

## ✅ Success Criteria

All tests pass when you see:

- [ ] Development: Full error details with stack trace
- [ ] Production: Safe messages, error codes only
- [ ] HTTP status codes correct (400, 401, 403, 404, 500)
- [ ] JSON responses well-formed
- [ ] Console logs structured JSON
- [ ] Sensitive fields redacted in production
- [ ] No errors during TypeScript compilation

---

## 🆘 Troubleshooting

**Server won't start**
```bash
# Kill any existing process
lsof -i :3000
kill -9 <PID>

# Try again
npm run dev
```

**JSON formatting issues**
```bash
# Install jq if missing
brew install jq  # macOS
apt-get install jq  # Linux
```

**Different response in dev/prod?**
```bash
# Verify NODE_ENV
echo $NODE_ENV

# Set explicitly
NODE_ENV=production npm start
```

---

## 📚 See Also

- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Complete overview
- [README.md](./README.md#-centralized-error-handling--structured-logging) - Usage guide
- [src/lib/logger.ts](./src/lib/logger.ts) - Logger implementation
- [src/lib/errorHandler.ts](./src/lib/errorHandler.ts) - Error handler implementation
- [src/app/api/test-demo/route.ts](./src/app/api/test-demo/route.ts) - Test endpoint

---

**Navigation:**
- [← Back to Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [← Back to README](./README.md)
