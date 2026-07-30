import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/employer", "/api/", "/login", "/register", "/forgot-password"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
