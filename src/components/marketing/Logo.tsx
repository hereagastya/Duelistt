import Image from "next/image";
import Link from "next/link";

import logo from "../../../public/logo.png";

/*
  The real mark: two blades crossed, already drawn on its own dark tile. It is
  used at one size in two places, so it is loaded eagerly and never lazily --
  a logo that pops in after the fold is a logo that looks broken.
*/
export function Logo({ size = 30 }: { size?: number }) {
  return (
    <Image
      src={logo}
      alt=""
      width={size}
      height={size}
      priority
      className="rounded-[9px] ring-1 ring-white/10"
      style={{ width: size, height: size }}
    />
  );
}

export function Wordmark({
  size = 30,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2.5 rounded-lg transition-opacity duration-150 hover:opacity-85 ${className}`}
    >
      <Logo size={size} />
      <span className="text-[15px] font-semibold tracking-[-0.03em]">
        Duelistt
      </span>
      <span className="sr-only">home</span>
    </Link>
  );
}
