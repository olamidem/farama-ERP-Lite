import type { Employee } from "../types/staff";

interface StaffAvatarProps {
  employee: Employee;
  className?: string;
}

export const StaffAvatar = ({
  employee,
  className = "w-9 h-9",
}: StaffAvatarProps) => {
  const getInitials = () => {
    if (employee.full_name) {
      return employee.full_name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    }
    return employee.email?.[0]?.toUpperCase() || "OP";
  };

  return (
    <div
      style={{ backgroundColor: employee.avatar_color || "#8b5cf6" }}
      className={`${className} rounded-full flex items-center justify-center text-[10px] font-black text-white tracking-widest shadow-xs shrink-0`}
    >
      {getInitials()}
    </div>
  );
};
