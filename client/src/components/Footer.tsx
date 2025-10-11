import { Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="
        border-t border-white/10
        bg-gradient-to-tr from-indigo-950 via-violet-950 to-fuchsia-900
        text-white
      "
      // Prevent iOS Safari bottom bar overlap while keeping footer compact
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      data-testid="footer"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Top row */}
        <div className="flex flex-col gap-5 items-center">
          {/* Ownership + contact (centered) */}
          <div className="space-y-1 text-center">
            {/* Optional: remove logo on mobile for cleaner look */}
            {/* <img src="/logo-odanet.png" alt="Odanet" className="hidden md:block h-7 w-auto" /> */}
            <p className="text-sm text-white/85">
              Odanet,{" "}
              <span className="font-medium text-white">
                Mestok Bilişim ve Teknoloji
              </span>{" "}
              şirketine aittir.
            </p>
            <p className="text-xs text-white/70">
              Ritim İş Merkezi, Maltepe / İstanbul
            </p>
            <a
              href="mailto:admin@odanet.com.tr"
              className="text-xs font-medium text-white hover:text-white/90 underline decoration-white/30 underline-offset-4"
            >
              admin@odanet.com.tr
            </a>
          </div>

          {/* Social icons with strong purple chip */}
          <div className="flex justify-center gap-2">
            {[
              { Icon: Facebook, label: "Facebook", href: "#" },
              { Icon: Twitter, label: "Twitter", href: "#" },
              { Icon: Instagram, label: "Instagram", href: "#" },
            ].map(({ Icon, label, href }, i) => (
              <a
                key={i}
                href={href}
                aria-label={label}
                className="
                  inline-flex h-9 w-9 items-center justify-center
                  rounded-xl bg-violet-600 hover:bg-violet-500
                  shadow-sm ring-1 ring-white/10 transition
                "
              >
                <Icon className="h-4 w-4 text-white" />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom legal line, compact */}
        <p className="mt-4 border-t border-white/10 pt-3 text-[11px] leading-none text-white/60 text-center">
          © {year} Odanet. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
