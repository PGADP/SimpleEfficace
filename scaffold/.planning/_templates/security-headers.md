# Headers de sécurité — Next.js 15

Bloc `headers()` à copier dans `next.config.ts` **à la première phase qui expose une route publique** — pas avant (rien à protéger), pas après (la fenêtre est ouverte). La gate SECURITY du cycle le rappelle si `next.config.*` n'a pas de `headers()`.

```ts
// next.config.ts
const securityHeaders = [
  {
    // CSP: blocks injected scripts (XSS) — only your own code executes.
    // Strict base: no 'unsafe-inline'. Add it ONLY if a third-party forces you
    // (inline analytics snippet, some CSS-in-JS libs) — it reopens the main
    // XSS vector, so prefer a nonce or the vendor's external script URL.
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'", // no one can embed the site in an iframe (clickjacking)
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  {
    // Forces HTTPS for 2 years, subdomains included — no downgrade to HTTP.
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  {
    // Browser must respect the declared MIME type — stops content sniffing attacks.
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Outbound links only see your origin, never the full URL (paths, tokens, ids).
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
];

const nextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
```

## Ce que chaque header empêche

| Header | Empêche concrètement |
|---|---|
| `Content-Security-Policy` | L'exécution d'un script injecté (XSS) : seul le code servi par ton domaine tourne. |
| `frame-ancestors 'none'` | L'affichage du site dans une iframe tierce (clickjacking : un bouton invisible par-dessus le tien). |
| `Strict-Transport-Security` | Le retour en HTTP clair — interception du trafic sur un réseau public. |
| `X-Content-Type-Options` | Qu'un fichier uploadé soit interprété comme du script par le navigateur. |
| `Referrer-Policy` | La fuite d'URLs complètes (tokens, ids) vers les sites externes visités depuis chez toi. |

## Nuances

- **CSP et Next.js** : en dev, Next injecte des scripts inline (HMR) — la CSP stricte peut casser le dev server. Solution honnête : appliquer les headers seulement en production (`process.env.NODE_ENV === "production"`), ou passer aux nonces ([doc Next.js CSP](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)).
- **Produit embarquable** (widget, iframe voulue) : remplacer `frame-ancestors 'none'` par la liste des domaines autorisés (`frame-ancestors https://partenaire.com`). Jamais `*`.
- **Images/fonts externes** (CDN, avatars OAuth) : ajouter le domaine précis à `img-src` / `font-src`. Toujours un domaine nommé, jamais `*`.
- Vérifier le résultat : `curl -sI https://ton-domaine.tld | grep -iE "content-security|strict-transport|x-content|referrer"` ou [securityheaders.com](https://securityheaders.com).
