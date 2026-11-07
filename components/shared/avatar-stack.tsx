import * as React from "react";
import { cn } from "@/lib/utils";

interface UserAvatar {
  id: string;
  name: string;
  avatarUrl?: string;
  status?: "online" | "offline" | "idle";
}

interface AvatarStackProps {
  users: UserAvatar[];
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AvatarStack({ users, max = 3, size = "md", className }: AvatarStackProps) {
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  const sizeClasses = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className={cn("flex items-center -space-x-2 overflow-hidden", className)}>
      {visibleUsers.map((user) => (
        <div
          key={user.id}
          title={user.name}
          className={cn(
            "relative inline-flex items-center justify-center rounded-full font-bold uppercase transition-transform hover:scale-110 hover:z-10 ring-2 ring-card shadow-sm select-none",
            sizeClasses[size],
            "bg-brand-purple-light text-brand-purple"
          )}
        >
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span>{getInitials(user.name)}</span>
          )}

          {user.status && (
            <span
              className={cn(
                "absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-card",
                user.status === "online"
                  ? "bg-status-success-dot"
                  : user.status === "idle"
                  ? "bg-status-warning-dot"
                  : "bg-text-tertiary"
              )}
            />
          )}
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          title={`${remainingCount} more members`}
          className={cn(
            "relative inline-flex items-center justify-center rounded-full font-bold ring-2 ring-card bg-brand-navy text-white text-[11px] shadow-sm select-none",
            sizeClasses[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

