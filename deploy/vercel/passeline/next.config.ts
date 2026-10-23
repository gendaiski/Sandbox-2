import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Le formulaire partenaire accepte une photo (compressée dans le
      // navigateur, 5 Mo au maximum avant compression).
      bodySizeLimit: "6mb",
    },
  },
  async headers() {
    return [
      {
        // Liens universels iOS : Apple exige un JSON servi sans extension.
        source: "/.well-known/apple-app-site-association",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
    ]
  },
}

export default nextConfig
