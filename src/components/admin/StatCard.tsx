import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
}

const StatCard = ({ title, value, icon: Icon, trend }: StatCardProps) => (
  <div className="glass-card p-6 hover-lift">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-muted-foreground text-sm mb-1">{title}</p>
        <p className="text-3xl font-display font-bold text-foreground">{value}</p>
        {trend && <p className="text-xs text-primary mt-2">{trend}</p>}
      </div>
      <div className="p-3 rounded-lg bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
    </div>
  </div>
);

export default StatCard;
