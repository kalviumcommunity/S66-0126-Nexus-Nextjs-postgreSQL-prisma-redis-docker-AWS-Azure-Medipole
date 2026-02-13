import { verifyToken } from "./jwt";

export function authenticate(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) throw new Error("No token");

  return verifyToken(token);
}
