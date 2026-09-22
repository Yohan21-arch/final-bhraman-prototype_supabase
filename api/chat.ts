import app from "./_app.ts";
import type { Request, Response } from "express";

export default function handler(req: Request, res: Response) {
  // If Vercel stripped the function path so req.url is / or starts with /?, normalize to /api/chat
  if (req.url === "/" || req.url.startsWith("/?")) {
    req.url = "/api/chat" + (req.url.startsWith("/?") ? req.url.substring(1) : "");
  }
  return app(req, res);
}
