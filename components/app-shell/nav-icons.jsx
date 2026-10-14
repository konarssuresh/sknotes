import {
  Archive,
  FileText,
  Home,
  Plus,
  Settings,
  Tag,
  Trash2,
} from "lucide-react";

const iconMap = {
  home: Home,
  notes: FileText,
  tags: Tag,
  archive: Archive,
  trash: Trash2,
  settings: Settings,
  create: Plus,
};

export function NavIcon({ name, className }) {
  const Icon = iconMap[name] ?? FileText;
  return <Icon className={className} aria-hidden />;
}
