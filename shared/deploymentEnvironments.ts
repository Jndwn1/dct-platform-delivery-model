export const DEPLOYMENT_ENVIRONMENT_OPTIONS = ["Production", "UAT", "QA", "Dev", "Perf"] as const;

/** Keep existing single-environment records readable without a schema migration. */
export function parseDeploymentEnvironments(value: string): string[] {
  return Array.from(new Set(value.split(",").map((item) => item.trim()).filter(Boolean)));
}

export function setDeploymentEnvironmentChecked(value: string, environment: string, checked: boolean): string {
  const selected = new Set(parseDeploymentEnvironments(value));
  if (checked) selected.add(environment);
  else selected.delete(environment);
  return DEPLOYMENT_ENVIRONMENT_OPTIONS.filter((option) => selected.has(option)).join(", ");
}

export function hasDeploymentEnvironment(value: string, environment: string): boolean {
  return parseDeploymentEnvironments(value).includes(environment);
}
