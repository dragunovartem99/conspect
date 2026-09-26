import base from "@dragunovartem99/oxlint-config";

// Generated from the API's openapi.json by `npm run types:generate`.
export default { ...base, ignorePatterns: [...(base.ignorePatterns ?? []), "src/api/schema.d.ts"] };
