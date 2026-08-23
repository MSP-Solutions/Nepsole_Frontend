import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export default function SearchCommand() {
  return (
    <div className="relative hidden w-full max-w-sm md:block">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

      <Input
        placeholder="Search jobs, applicants..."
        className="pl-10"
      />
    </div>
  );
}