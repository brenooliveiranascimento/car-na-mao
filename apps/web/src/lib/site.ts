/** Public links shown on the site. Set them in .env (NEXT_PUBLIC_*) before building. */
export const site = {
  repositoryUrl: process.env.NEXT_PUBLIC_REPOSITORY_URL ?? "https://github.com/",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
};
