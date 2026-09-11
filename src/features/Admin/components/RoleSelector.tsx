// RoleSelector — inline dropdown to change a user's role (admin ⇄ user)
import { ShieldCheck, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { USER_ROLE_MAP } from "../constants";

interface RoleSelectorProps {
  userRole: number;
  busy: boolean;
  disabled?: boolean;
  onRoleChange: (role: number) => void;
  /** "badge" shows colored pill (table cell), "icon" shows shield icon + label */
  variant?: "badge" | "icon";
}

export function RoleSelector({
  userRole,
  busy,
  disabled,
  onRoleChange,
  variant = "badge",
}: RoleSelectorProps) {
  const role = USER_ROLE_MAP[userRole] || USER_ROLE_MAP[2];

  if (variant === "icon") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled || busy}>
          <button
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            title="Change role"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{role.label}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </DropdownMenuTrigger>
        <RoleMenu userRole={userRole} onRoleChange={onRoleChange} />
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled || busy}>
        <button
          className="inline-flex items-center focus:outline-none rounded-full hover:opacity-80 transition-opacity disabled:opacity-50"
          title="Click to change role"
        >
          <Badge variant="outline" className={`text-[10px] font-semibold gap-0.5 cursor-pointer ${role.color}`}>
            {role.label}
            <ChevronDown className="w-2.5 h-2.5" />
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <RoleMenu userRole={userRole} onRoleChange={onRoleChange} />
    </DropdownMenu>
  );
}

function RoleMenu({
  userRole,
  onRoleChange,
}: {
  userRole: number;
  onRoleChange: (role: number) => void;
}) {
  return (
    <DropdownMenuContent align="start" className="w-40">
      {Object.entries(USER_ROLE_MAP).map(([id, r]) => (
        <DropdownMenuItem
          key={id}
          onClick={() => onRoleChange(Number(id))}
          disabled={Number(id) === userRole}
          className="gap-2"
        >
          <span className={`w-2 h-2 rounded-full ${r.color.split(" ")[0]}`} />
          {r.label}
          {Number(id) === userRole && (
            <span className="ml-auto text-[10px] text-muted-foreground">current</span>
          )}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  );
}
