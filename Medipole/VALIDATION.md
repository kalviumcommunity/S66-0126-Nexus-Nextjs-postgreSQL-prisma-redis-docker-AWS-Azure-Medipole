# Input validation (Zod)

This repository uses Zod to validate request bodies for server POST endpoints. Schemas live in `src/lib/schemas/` and a small helper (`src/lib/validation.ts`) converts Zod errors into consistent JSON responses with HTTP status `400`.

Implemented schemas (files):

- `src/lib/schemas/userSchema.ts` — `signupSchema`, `loginSchema`
- `src/lib/schemas/donorSchema.ts` — `donorSchema`
- `src/lib/schemas/inventorySchema.ts` — `inventorySchema`
- `src/lib/schemas/requestSchema.ts` — `requestSchema`
- `src/lib/schemas/hospitalSchema.ts` — `hospitalSchema`

Example validation failure response:

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    { "field": "email", "message": "Invalid email address" },
    { "field": "name", "message": "Name must be at least 2 characters long" }
  ]
}
```

How to test locally:

```bash
cd Medipole
npm install
npm run build
```

Why this matters:

- Validates user input early and returns clear errors.
- Ensures consistent validation rules across client and server if you reuse schemas.
- Prevents invalid data reaching the database.
