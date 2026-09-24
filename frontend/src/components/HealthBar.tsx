import { useState, useEffect } from "react";

interface HealthStatus {
  status: string;
  services: Record<string, string>;
}

const dotColor: Record<string, string> = {
  ok: "bg-green-500",
  unreachable: "bg-red-500",
  unknown: "bg-yellow-500",
  error: "bg-red-500",
};

export default function HealthBar() {
  const [health, setHealth] = useState<HealthStatus | null>(null);

  const check = async () => {
    try {
      const res = await fetch("/health/");
      if (res.ok) setHealth(await res.json());
    } catch {
      setHealth({ status: "unreachable", services: {} });
    }
  };

  useEffect(() => {
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!health) return null;

  return (
    <div className="flex items-center gap-3 text-xs">
      {Object.entries(health.services).map(([name, status]) => (
        <div key={name} className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${dotColor[status] || "bg-gray-500"}`} />
          <span className="text-gray-400">{name}</span>
        </div>
      ))}
    </div>
  );
}
