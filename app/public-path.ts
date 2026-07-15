/**
 * Resolve a file from `public/` under the build-time GitHub Pages base path.
 *
 * A project Pages site is hosted at `/<repository>/`, while local development,
 * a user/organization Pages site, and a custom domain normally use `/`.
 */
export function publicPath(path: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const absolutePath = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${absolutePath}`;
}
