import { useState, type CSSProperties } from "react";
import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DEPLOYMENT_ENVIRONMENT_OPTIONS, hasDeploymentEnvironment, setDeploymentEnvironmentChecked } from "@shared/deploymentEnvironments";

export default function DeploymentEnvironmentSelect({ id, value, onChange, style, disabled = false }: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  style?: CSSProperties;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button id={id} type="button" disabled={disabled} aria-label={`Environment: ${value || "Select environments"}`} style={{ ...style, alignItems: "center", cursor: disabled ? "not-allowed" : "pointer", display: "flex", gap: "6px", justifyContent: "space-between", textAlign: "left" }}>
          <span>{value || "Select environments"}</span><ChevronDown size={14} style={{ flexShrink: 0 }} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" style={{ background: "#ffffff", color: "#0f172a", minWidth: "var(--radix-dropdown-menu-trigger-width)", zIndex: 80 }}>
        {DEPLOYMENT_ENVIRONMENT_OPTIONS.map((environment) => (
          <DropdownMenuCheckboxItem
            key={environment}
            checked={hasDeploymentEnvironment(value, environment)}
            onCheckedChange={(checked) => onChange(setDeploymentEnvironmentChecked(value, environment, checked === true))}
            onSelect={(event) => event.preventDefault()}
            className="cursor-pointer text-xs [&>span]:rounded-[3px] [&>span]:border [&>span]:border-slate-400 data-[state=checked]:[&>span]:border-teal-700 data-[state=checked]:[&>span]:bg-teal-700 data-[state=checked]:[&>span]:text-white"
          >
            {environment}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-end text-xs font-semibold text-teal-700 cursor-pointer" onSelect={() => setOpen(false)}>Done</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
