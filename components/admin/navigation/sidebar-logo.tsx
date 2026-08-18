import Image from "next/image";
import Link from "next/link";

export default function SidebarLogo() {
  return (
    <Link
      href="/admin/dashboard"
      className="flex items-center gap-3 px-2 py-2 group"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/90 text-white font-bold shadow-md shrink-0">
        <Image
          src="/logo.png"
          alt="Nepsole"
          width={36}
          height={36}
          className="rounded object-contain"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = "none";
          }}
        />
      </div>

      <div className="flex flex-col">
        <span className="text-base font-bold text-white tracking-tight">
          Nepsole
        </span>

        <span className="text-xs text-slate-400 font-normal">
          Admin
        </span>
      </div>
    </Link>
  );
}