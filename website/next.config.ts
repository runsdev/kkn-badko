import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enables Next.js integration for React's <ViewTransition>, so <Link>
  // navigations are wrapped in document.startViewTransition and the
  // transitionTypes prop reaches addTransitionType. Still under
  // `experimental` in 16.2.x. The component itself comes from react.
  experimental: {
    viewTransition: true,
  },
  images: {
    // Every archive image is hotlinked from Blogger's CDN. Hostname
    // wildcards match subdomains but never the apex, which is fine — no
    // image is served from the bare domain.
    remotePatterns: [
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "**.blogspot.com" },
      // 2009-era Blogger markup also served photos from Picasa-era hosts
      { protocol: "https", hostname: "**.ggpht.com" },
    ],
    // Next 16 defaults this to [75] and silently coerces anything else to
    // the nearest allowed value, so declare what we actually request.
    qualities: [75],
  },
};

export default nextConfig;
