Audit de sécurité du code :

**Injection**
- SQL/NoSQL injection
- XSS (innerHTML, dangerouslySetInnerHTML)
- Command injection
- Path traversal

**Auth & Accès**
- Secrets hardcodés
- Contrôles d'autorisation manquants
- Session management

**Data**
- Données sensibles exposées (logs, errors)
- Validation d'input insuffisante
- Sanitization manquante

**Dépendances**
- Packages avec CVE connues (npm audit)
- Versions outdated critiques

Pour chaque finding :
- Sévérité : CRITICAL / HIGH / MEDIUM / LOW
- Exploitation possible
- Remediation recommandée

Cible : $ARGUMENTS
