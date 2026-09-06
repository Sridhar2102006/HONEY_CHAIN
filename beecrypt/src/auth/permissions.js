export const ROLE_META = {
  beekeeper: { label: "Beekeeper", route: "beekeeper" },
  processor: { label: "Processor", route: "processor" },
  laboratory: { label: "Laboratory / Verifier", route: "laboratory" },
  retailer: { label: "Retailer", route: "retailer" },
  kvic: { label: "KVIC Admin", route: "kvic" },
};

export const ROLE_PERMISSIONS = {
  beekeeper: ["VIEW_HIVE", "CREATE_HARVEST", "CREATE_BATCH", "VIEW_PROVENANCE", "GENERATE_QR", "SCAN_QR"],
  processor: ["VIEW_BATCH", "PROCESS_BATCH", "VIEW_PROVENANCE", "GENERATE_QR", "SCAN_QR"],
  laboratory: ["VIEW_BATCH", "VERIFY_BATCH", "VIEW_PROVENANCE", "GENERATE_QR", "SCAN_QR"],
  retailer: ["VIEW_BATCH", "SCAN_QR", "VERIFY_BATCH", "VIEW_PROVENANCE", "GENERATE_QR"],
  kvic: ["VIEW_HIVE", "VIEW_BATCH", "VERIFY_BATCH", "VIEW_PROVENANCE", "SCAN_QR", "VIEW_AUDIT_LOG", "MANAGE_USERS"],
};

export const WORKSPACE_ROLES = Object.keys(ROLE_META);

export function hasRole(user, role) {
  return Boolean(user?.roles?.includes(role));
}

export function can(user, permission) {
  return (user?.roles || []).some((role) => ROLE_PERMISSIONS[role]?.includes(permission));
}

export function canEnterWorkspace(user, workspace) {
  return hasRole(user, workspace) && Boolean(ROLE_META[workspace]);
}

export function workspaceFromPath(pathname) {
  const match = pathname.match(/^\/app\/([^/]+)/);
  const candidate = match?.[1];
  return candidate && ROLE_META[candidate] ? candidate : null;
}
