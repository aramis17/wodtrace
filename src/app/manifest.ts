import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WodTrace",
    short_name: "WodTrace",
    description: "Registra WODs, PRs y progreso de entrenamiento",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0C10",
    theme_color: "#0B0C10",
    orientation: "portrait-primary",
    lang: "es",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
