import {
  useState,
  useEffect,
  useRef,
  type ReactNode,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  motion,
  AnimatePresence,
  MotionConfig,
  animate,
  useScroll,
  useMotionValue,
  useMotionValueEvent,
  useMotionTemplate,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  ChefHat,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Coffee,
  CookingPot,
  CreditCard,
  Globe2,
  LayoutDashboard,
  Menu,
  Minus,
  Monitor,
  Plus,
  QrCode,
  ReceiptText,
  Search,
  ShoppingBag,
  Sparkles,
  Table2,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Wallet,
  X,
  Zap,
} from "lucide-react";

type DemoTab = "POS Billing" | "Floor Plan" | "QR Ordering" | "Kitchen" | "Insights";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const menuItems = [
  { id: 1, name: "Classic Cappuccino", category: "Coffee", price: 160, icon: "☕" },
  { id: 2, name: "Iced Latte", category: "Coffee", price: 190, icon: "🧋" },
  { id: 3, name: "Margherita Pizza", category: "Mains", price: 320, icon: "🍕" },
  { id: 4, name: "Truffle Fries", category: "Sides", price: 180, icon: "🍟" },
  { id: 5, name: "Chocolate Brownie", category: "Desserts", price: 150, icon: "🍰" },
  { id: 6, name: "Fresh Lemonade", category: "Drinks", price: 120, icon: "🍋" },
];

const initialTables = [
  { id: 1, name: "T01", seats: 2, status: "Occupied" },
  { id: 2, name: "T02", seats: 2, status: "Available" },
  { id: 3, name: "T03", seats: 4, status: "Occupied" },
  { id: 4, name: "T04", seats: 4, status: "Available" },
  { id: 5, name: "T05", seats: 6, status: "Reserved" },
  { id: 6, name: "T06", seats: 4, status: "Available" },
  { id: 7, name: "T07", seats: 2, status: "Occupied" },
  { id: 8, name: "T08", seats: 4, status: "Available" },
];

const initialKitchenOrders = [
  { id: "#1048", table: "T03", items: "2 × Margherita Pizza, 1 × Iced Latte", status: "Preparing", time: "6 min ago" },
  { id: "#1049", table: "T07", items: "1 × Truffle Fries, 2 × Lemonade", status: "New", time: "2 min ago" },
  { id: "#1050", table: "T01", items: "2 × Cappuccino, 1 × Brownie", status: "Ready", time: "Just now" },
];

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

/* ------------------------------------------------------------------ */
/* Motion helpers                                                      */
/* ------------------------------------------------------------------ */
function Reveal({
  children,
  delay = 0,
  y = 28,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Magnetic({
  children,
  strength = 0.25,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ x: sx, y: sy }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}

function Tilt({ children, max = 2.5 }: { children: ReactNode; max?: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), { stiffness: 140, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), { stiffness: 140, damping: 20 });

  return (
    <div style={{ perspective: 1400 }}>
      <motion.div
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          x.set((e.clientX - r.left) / r.width - 0.5);
          y.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onMouseLeave={() => {
          x.set(0);
          y.set(0);
        }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function SpotlightCard({
  children,
  className = "",
  color = "rgba(117,128,82,0.14)",
}: {
  children: ReactNode;
  className?: string;
  color?: string;
}) {
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const background = useMotionTemplate`radial-gradient(340px circle at ${mx}px ${my}px, ${color}, transparent 70%)`;

  return (
    <div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      className={`group relative overflow-hidden ${className}`}
    >
      <motion.div
        style={{ background }}
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

function CountUp({ to, prefix = "" }: { to: number; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const mv = useMotionValue(0);

  useMotionValueEvent(mv, "change", (v) => {
    if (ref.current) {
      ref.current.textContent =
        prefix + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(v));
    }
  });

  useEffect(() => {
    const controls = animate(mv, to, { duration: 1.4, ease });
    return () => controls.stop();
  }, [mv, to]);

  return <span ref={ref}>{prefix}0</span>;
}

function Marquee() {
  const items = [
    "POS & Billing",
    "Floor & Tables",
    "QR Ordering",
    "Kitchen Display",
    "Operational Insights",
    "Cafés",
    "Cloud Kitchens",
    "Restaurant Groups",
  ];
  const loop = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-[#E8E3D7] bg-[#F8F5ED] py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#F8F5ED] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#F8F5ED] to-transparent" />
      <motion.div
        className="flex w-max whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 34, ease: "linear", repeat: Infinity }}
      >
        {loop.map((text, i) => (
          <span
            key={i}
            className="flex items-center gap-10 px-5 font-[Manrope,sans-serif] text-xs font-extrabold uppercase tracking-[0.22em] text-[#A8A592] sm:text-sm"
          >
            {text}
            <Sparkles size={14} className="text-[#BD674D]" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Letter-by-letter text animation                                     */
/* ------------------------------------------------------------------ */
function Letters({
  text,
  offset = 0,
  speed = 0.04,
  className = "",
}: {
  text: string;
  offset?: number;
  speed?: number;
  className?: string;
}) {
  let counter = offset;
  const words = text.split(" ");

  return (
    <span className={className} aria-hidden="true">
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {word.split("").map((char, ci) => {
            const delay = counter * speed;
            counter += 1;
            return (
              <motion.span
                key={ci}
                className="inline-block"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay, ease }}
              >
                {char}
              </motion.span>
            );
          })}
          {wi < words.length - 1 && (counter += 1) && <span>&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Back to top                                                         */
/* ------------------------------------------------------------------ */
function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 400);
  });

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          type="button"
          aria-label="Back to top"
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 40, scale: 0.6, rotate: -90 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, y: 40, scale: 0.6, rotate: 90 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="group fixed bottom-5 right-5 z-[60] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-white shadow-[0_14px_40px_rgba(52,56,43,0.22)] transition-colors duration-300 hover:bg-[#BD674D] sm:bottom-8 sm:right-8"
        >
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="25" stroke="#E5E0D4" strokeWidth="2.5" className="transition-colors duration-300 group-hover:stroke-white/30" />
            <motion.circle
              cx="28"
              cy="28"
              r="25"
              stroke="#BD674D"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ pathLength: scrollYProgress }}
              className="transition-colors duration-300 group-hover:stroke-white"
            />
          </svg>
          <span className="relative block h-5 w-5 overflow-hidden text-[#34382B] transition-colors duration-300 group-hover:text-white">
            <ArrowUp
              size={20}
              strokeWidth={2.4}
              className="absolute inset-0 transition-transform duration-300 ease-out group-hover:-translate-y-6"
            />
            <ArrowUp
              size={20}
              strokeWidth={2.4}
              className="absolute inset-0 translate-y-6 transition-transform duration-300 ease-out group-hover:translate-y-0"
            />
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function Button({
  children,
  href,
  secondary = false,
  className = "",
}: {
  children: ReactNode;
  href?: string;
  secondary?: boolean;
  className?: string;
}) {
  const styles = secondary
    ? "border border-[#DCD8CB] bg-white text-[#34382B] hover:border-[#758052] hover:bg-[#F8F5ED] hover:shadow-md"
    : "bg-[#BD674D] text-white hover:bg-[#A9563E] shadow-[0_8px_24px_rgba(189,103,77,0.18)] hover:shadow-[0_14px_34px_rgba(189,103,77,0.34)] [&>svg:last-child]:transition-transform [&>svg:last-child]:duration-300 hover:[&>svg:last-child]:translate-x-1";

  const base = `group relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-3 text-sm font-bold transition duration-300 active:scale-[0.97] ${styles} ${className}`;
  const shine = !secondary && (
    <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full -skew-x-12 bg-white/25 transition-transform duration-700 ease-out group-hover:translate-x-[420%]" />
  );

  if (href) {
    return (
      <a href={href} className={base}>
        {shine}
        {children}
      </a>
    );
  }

  return (
    <button className={base}>
      {shine}
      {children}
    </button>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#D9DDCD] bg-[#EEF0E6] px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.13em] text-[#596442]">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#758052] opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#758052]" />
      </span>
      {children}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = true,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  centered?: boolean;
}) {
  return (
    <div className={`${centered ? "mx-auto text-center" : ""} max-w-2xl`}>
      <Reveal>
        <Eyebrow>{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="mt-5 font-[Manrope,sans-serif] text-3xl font-extrabold leading-tight tracking-[-0.045em] text-[#34382B] sm:text-4xl md:text-5xl">
          {title}
        </h2>
      </Reveal>
      <Reveal delay={0.16}>
        <p className="mt-4 text-base leading-7 text-[#77776B] sm:text-lg">{description}</p>
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Navbar data                                                         */
/* ------------------------------------------------------------------ */
type MenuKey = "platform" | "solutions";

const platformItems = [
  { icon: ReceiptText, title: "POS & Billing", description: "A cleaner counter-to-checkout flow", href: "#platform" },
  { icon: Table2, title: "Floor & Tables", description: "Stay on top of every table", href: "#platform" },
  { icon: QrCode, title: "QR Ordering", description: "Let guests browse and order", href: "#platform" },
  { icon: ChefHat, title: "Kitchen Display", description: "Follow every ticket to completion", href: "#workflow" },
];

const solutionItems = [
  { emoji: "☕", title: "Cafés & coffee shops", description: "Quick service and counter billing" },
  { emoji: "🍽️", title: "Full-service dining", description: "Tables, orders and kitchen flow" },
  { emoji: "🥡", title: "Cloud kitchens", description: "A more organised order queue" },
  { emoji: "🏡", title: "Restaurant groups", description: "A foundation for structured operations" },
];

const navItems: { key: string; label: string; href: string; menu?: MenuKey; section: string }[] = [
  { key: "platform", label: "Platform", href: "#platform", menu: "platform", section: "platform" },
  { key: "solutions", label: "Solutions", href: "#audiences", menu: "solutions", section: "audiences" },
  { key: "features", label: "Features", href: "#features", section: "features" },
  { key: "workflow", label: "How it works", href: "#workflow", section: "workflow" },
  { key: "pricing", label: "Pricing", href: "#pricing", section: "pricing" },
];

const sectionOrder = ["platform", "features", "workflow", "audiences", "pricing", "contact"];

const commands = [
  { icon: Monitor, label: "Interactive preview", hint: "Platform", keywords: "demo try product workspace", href: "#platform" },
  { icon: ReceiptText, label: "POS & billing", hint: "Platform", keywords: "checkout bill order", href: "#platform" },
  { icon: Table2, label: "Floor & tables", hint: "Platform", keywords: "dining seating reservation", href: "#platform" },
  { icon: ChefHat, label: "Kitchen display", hint: "Workflow", keywords: "orders tickets queue", href: "#workflow" },
  { icon: Sparkles, label: "Features", hint: "Section", keywords: "capabilities modules", href: "#features" },
  { icon: Zap, label: "How it works", hint: "Section", keywords: "steps flow process", href: "#workflow" },
  { icon: Users, label: "Solutions", hint: "Section", keywords: "cafe cloud kitchen restaurant group", href: "#audiences" },
  { icon: CircleDollarSign, label: "Pricing plans", hint: "Section", keywords: "cost price plan starter growth scale", href: "#pricing" },
  { icon: CalendarDays, label: "Book a demo", hint: "Action", keywords: "contact talk enquiry email", href: "#contact" },
];

/* ------------------------------------------------------------------ */
/* Active section tracker                                              */
/* ------------------------------------------------------------------ */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => {
      const line = window.scrollY + 160;
      let current = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top + window.scrollY <= line) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ids]);

  return active;
}

/* ------------------------------------------------------------------ */
/* Announcement bar                                                    */
/* ------------------------------------------------------------------ */
function AnnouncementBar() {
  const [open, setOpen] = useState(true);

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease }}
          className="relative overflow-hidden bg-[#34382B] text-[#F8F5ED]"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-10 py-2.5 text-center text-xs font-semibold sm:text-[13px]">
            <span className="hidden items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-[#E8B09D] sm:inline-flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D98A70]" /> NEW
            </span>
            <span className="text-[#E7E7DC]">
              The interactive Restora preview is live — try billing, tables and kitchen flow.
            </span>
            <a
              href="#platform"
              className="group inline-flex cursor-pointer items-center gap-1 whitespace-nowrap font-extrabold text-white underline-offset-4 hover:underline"
            >
              Try it <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
          <button
            aria-label="Dismiss announcement"
            onClick={() => setOpen(false)}
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[#BEBFB2] transition hover:rotate-90 hover:bg-white/10 hover:text-white"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Mega menus                                                          */
/* ------------------------------------------------------------------ */
function PlatformMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="grid w-[680px] grid-cols-[1.15fr_0.85fr] gap-2 p-2">
      <div className="space-y-0.5 p-1">
        <p className="px-3 pb-1 pt-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#989587]">
          Modules
        </p>
        {platformItems.map(({ icon: Icon, title, description, href }, i) => (
          <motion.a
            key={title}
            href={href}
            onClick={onNavigate}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.05 + i * 0.05, ease }}
            className="group/item flex cursor-pointer items-center gap-3 rounded-2xl p-3 transition hover:bg-[#F1F2E9]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF0E6] text-[#758052] transition duration-300 group-hover/item:rotate-6 group-hover/item:bg-[#758052] group-hover/item:text-white">
              <Icon size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-extrabold text-[#34382B]">{title}</span>
              <span className="mt-0.5 block text-xs leading-5 text-[#858475]">{description}</span>
            </span>
            <ArrowRight
              size={14}
              className="-translate-x-1 text-[#758052] opacity-0 transition duration-300 group-hover/item:translate-x-0 group-hover/item:opacity-100"
            />
          </motion.a>
        ))}
      </div>

      <a
        href="#platform"
        onClick={onNavigate}
        className="group/card relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl bg-[#34382B] p-5 text-white"
      >
        <span className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#758052] opacity-50 blur-3xl transition duration-500 group-hover/card:scale-125" />
        <span className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-[#BD674D] opacity-30 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-extrabold tracking-[0.14em] text-[#E8E9DC]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9FB06F]" /> LIVE PREVIEW
          </span>
          <h4 className="mt-3 font-[Manrope,sans-serif] text-lg font-extrabold leading-snug">
            See Restora in action
          </h4>
          <p className="mt-1.5 text-xs leading-5 text-[#C5C7BA]">
            Tap through billing, tables and the kitchen queue with sample data.
          </p>
        </div>

        <div className="relative mt-4 space-y-1.5 rounded-xl bg-white/10 p-3 text-[11px] backdrop-blur">
          <p className="text-[9px] font-bold uppercase tracking-wider text-[#BEBFB2]">Sample bill</p>
          {[
            ["Cappuccino × 2", "₹320"],
            ["Margherita Pizza", "₹320"],
            ["Fresh Lemonade", "₹120"],
          ].map(([name, price]) => (
            <div key={name} className="flex justify-between text-[#E7E7DC]">
              <span>{name}</span>
              <span>{price}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-white/15 pt-1.5 font-extrabold text-white">
            <span>Total</span>
            <span>₹760</span>
          </div>
        </div>

        <span className="relative mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#E8B09D]">
          Open interactive preview
          <ArrowRight size={13} className="transition-transform duration-300 group-hover/card:translate-x-1" />
        </span>
      </a>
    </div>
  );
}

function SolutionsMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="w-[560px] p-3">
      <p className="px-3 pb-2 pt-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#989587]">
        Built around how you serve
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {solutionItems.map((item, i) => (
          <motion.a
            key={item.title}
            href="#audiences"
            onClick={onNavigate}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.04 + i * 0.05, ease }}
            className="group/item flex cursor-pointer items-start gap-3 rounded-2xl p-3 transition hover:bg-[#F1F2E9]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F3E4DE] text-xl transition duration-300 group-hover/item:-rotate-6 group-hover/item:scale-110">
              {item.emoji}
            </span>
            <span>
              <span className="block text-sm font-extrabold text-[#34382B]">{item.title}</span>
              <span className="mt-0.5 block text-xs leading-5 text-[#858475]">{item.description}</span>
            </span>
          </motion.a>
        ))}
      </div>
      <a
        href="#contact"
        onClick={onNavigate}
        className="group/foot mt-2 flex cursor-pointer items-center justify-between rounded-2xl bg-[#F8F5ED] px-4 py-3 text-xs font-extrabold text-[#34382B] transition hover:bg-[#EEF0E6]"
      >
        Not sure which fits? Talk to our team about your setup
        <ArrowRight size={14} className="text-[#BD674D] transition-transform duration-300 group-hover/foot:translate-x-1" />
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Command palette (Ctrl/⌘ + K)                                        */
/* ------------------------------------------------------------------ */
function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = commands.filter((c) =>
    `${c.label} ${c.hint} ${c.keywords}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setIndex(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, [open]);

  const go = (href: string) => {
    onClose();
    window.setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 140);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[index]) {
      e.preventDefault();
      go(results[index].href);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="palette"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[14vh]"
        >
          <div className="absolute inset-0 bg-[#34382B]/45 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Quick search"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease }}
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/80 bg-[#FFFEFB] shadow-[0_40px_100px_rgba(52,56,43,0.35)]"
          >
            <div className="flex items-center gap-3 border-b border-[#EAE6DC] px-5 py-4">
              <Search size={18} className="text-[#758052]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIndex(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search sections, modules, pricing…"
                className="flex-1 bg-transparent text-sm font-semibold text-[#34382B] outline-none placeholder:text-[#AAA696]"
              />
              <kbd className="rounded-md border border-[#E5E0D4] bg-[#F8F5ED] px-1.5 py-0.5 text-[10px] font-bold text-[#989587]">
                ESC
              </kbd>
            </div>

            <div className="max-h-[340px] overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-[#898779]">No matches found.</p>
              ) : (
                results.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onMouseEnter={() => setIndex(i)}
                      onClick={() => go(item.href)}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                        i === index ? "bg-[#F1F2E9]" : ""
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                          i === index ? "bg-[#758052] text-white" : "bg-[#EEF0E6] text-[#758052]"
                        }`}
                      >
                        <Icon size={16} />
                      </span>
                      <span className="flex-1 text-sm font-bold text-[#34382B]">{item.label}</span>
                      <span className="rounded-full bg-[#F0EEE5] px-2 py-0.5 text-[10px] font-bold text-[#898779]">
                        {item.hint}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-[#EAE6DC] bg-[#FBFAF6] px-5 py-3 text-[10px] font-semibold text-[#989587]">
              <span>↑ ↓ navigate</span>
              <span>↵ open</span>
              <span className="ml-auto">Restora quick search</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile drawer                                                       */
/* ------------------------------------------------------------------ */
function MobileDrawer({
  open,
  onClose,
  onSearch,
}: {
  open: boolean;
  onClose: () => void;
  onSearch: () => void;
}) {
  const [expanded, setExpanded] = useState<MenuKey | null>("platform");

  const list: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
  };
  const row: Variants = {
    hidden: { opacity: 0, x: 24 },
    show: { opacity: 1, x: 0, transition: { duration: 0.35, ease } },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-[#34382B]/40 backdrop-blur-sm lg:hidden"
          />
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
            className="fixed right-0 top-0 z-[71] flex h-full w-[88%] max-w-sm flex-col bg-[#F8F5ED] shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-[#E8E3D7] px-5 py-4">
              <a href="#home" onClick={onClose} className="flex cursor-pointer items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#758052] text-white">
                  <UtensilsCrossed size={20} strokeWidth={2.2} />
                </span>
                <span className="font-[Manrope,sans-serif] text-xl font-extrabold tracking-tight text-[#34382B]">
                  restora<span className="text-[#BD674D]">.</span>
                </span>
              </a>
              <button
                aria-label="Close menu"
                onClick={onClose}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#E1DDCF] bg-white transition hover:rotate-90"
              >
                <X size={20} />
              </button>
            </div>

            <motion.div
              variants={list}
              initial="hidden"
              animate="show"
              className="flex-1 space-y-2 overflow-y-auto px-5 py-5"
            >
              <motion.button
                variants={row}
                onClick={() => {
                  onClose();
                  onSearch();
                }}
                className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-[#E5E0D4] bg-white px-4 py-3 text-left text-sm font-semibold text-[#898779]"
              >
                <Search size={16} className="text-[#758052]" /> Search Restora…
              </motion.button>

              {(["platform", "solutions"] as const).map((key) => {
                const isOpen = expanded === key;
                const items =
                  key === "platform"
                    ? platformItems.map((it) => ({
                        title: it.title,
                        description: it.description,
                        href: it.href,
                        visual: <it.icon size={17} />,
                      }))
                    : solutionItems.map((it) => ({
                        title: it.title,
                        description: it.description,
                        href: "#audiences",
                        visual: <span className="text-lg">{it.emoji}</span>,
                      }));

                return (
                  <motion.div key={key} variants={row} className="overflow-hidden rounded-2xl border border-[#E5E0D4] bg-white">
                    <button
                      onClick={() => setExpanded(isOpen ? null : key)}
                      aria-expanded={isOpen}
                      className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-left"
                    >
                      <span className="text-sm font-extrabold capitalize text-[#34382B]">{key}</span>
                      <ChevronDown
                        size={18}
                        className={`text-[#758052] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-0.5 px-2 pb-2">
                            {items.map((it) => (
                              <a
                                key={it.title}
                                href={it.href}
                                onClick={onClose}
                                className="flex cursor-pointer items-center gap-3 rounded-xl p-2.5 transition hover:bg-[#F1F2E9]"
                              >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF0E6] text-[#758052]">
                                  {it.visual}
                                </span>
                                <span>
                                  <span className="block text-sm font-extrabold text-[#34382B]">{it.title}</span>
                                  <span className="block text-xs text-[#858475]">{it.description}</span>
                                </span>
                              </a>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {navItems
                .filter((it) => !it.menu)
                .map((it, i) => (
                  <motion.a
                    key={it.key}
                    variants={row}
                    href={it.href}
                    onClick={onClose}
                    className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#E5E0D4] bg-white px-4 py-3.5 text-sm font-extrabold text-[#34382B]"
                  >
                    {it.label}
                    <span className="text-[10px] font-extrabold tracking-widest text-[#C5C0B2]">
                      0{i + 1}
                    </span>
                  </motion.a>
                ))}
            </motion.div>

            <div className="border-t border-[#E8E3D7] p-5">
              <a
                href="#contact"
                onClick={onClose}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#BD674D] px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_8px_24px_rgba(189,103,77,0.25)] transition hover:bg-[#A9563E] active:scale-[0.97]"
              >
                Book a demo <ArrowRight size={16} />
              </a>
              <a
                href="mailto:info@softrenix.com"
                className="mt-3 block cursor-pointer text-center text-xs font-semibold text-[#898779] hover:text-[#758052]"
              >
                info@softrenix.com
              </a>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Navbar                                                              */
/* ------------------------------------------------------------------ */
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);

  const activeSection = useActiveSection(sectionOrder);
  const isMac = typeof navigator !== "undefined" && /Mac/i.test(navigator.userAgent);

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.3 });

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(latest > 24);
    setHidden(latest > previous && latest > 480);
  });

  const openNow = (menu: MenuKey | null) => {
    window.clearTimeout(closeTimer.current);
    setOpenMenu(menu);
  };
  const closeSoon = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 140);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        setOpenMenu(null);
        setMobileOpen(false);
      }
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || paletteOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, paletteOpen]);

  const shouldHide = hidden && !openMenu && !mobileOpen && !paletteOpen;
  const pillKey = hovered ?? openMenu;

  return (
    <>
      <AnnouncementBar />

      <motion.header
        animate={{ y: shouldHide ? "-130%" : 0 }}
        transition={{ duration: 0.35, ease }}
        className={`sticky top-0 z-50 transition-colors duration-500 ${
          scrolled
            ? "border-b border-transparent bg-transparent"
            : "border-b border-[#E8E3D7]/80 bg-[#F8F5ED]/90 backdrop-blur-xl"
        }`}
      >
        <div
          className={`mx-auto transition-all duration-500 ease-out ${
            scrolled ? "max-w-6xl px-3 pt-3 sm:px-5" : "max-w-7xl px-0 pt-0"
          }`}
        >
          <nav
            onMouseLeave={() => {
              setHovered(null);
              closeSoon();
            }}
            className={`relative flex items-center justify-between transition-all duration-500 ease-out ${
              scrolled
                ? "rounded-full border border-white/80 bg-white/75 px-4 py-2 shadow-[0_18px_50px_rgba(52,56,43,0.13)] backdrop-blur-2xl sm:px-6"
                : "border border-transparent px-5 py-4 sm:px-8 lg:px-10"
            }`}
          >
            {/* Logo */}
            <a href="#home" className="group flex cursor-pointer items-center gap-2.5">
              <span
                className={`flex items-center justify-center rounded-2xl bg-[#758052] text-white shadow-sm transition-all duration-500 group-hover:-rotate-6 group-hover:scale-105 group-hover:bg-[#34382B] ${
                  scrolled ? "h-9 w-9" : "h-10 w-10"
                }`}
              >
                <UtensilsCrossed size={20} strokeWidth={2.2} />
              </span>
              <span>
                <span className="block font-[Manrope,sans-serif] text-xl font-extrabold tracking-tight text-[#34382B]">
                  restora<span className="text-[#BD674D]">.</span>
                </span>
                {!scrolled && (
                  <span className="-mt-0.5 block text-[10px] font-semibold tracking-[0.15em] text-[#858475]">
                    BY SOFTRENIX
                  </span>
                )}
              </span>
            </a>

            {/* Desktop links */}
            <div className="hidden items-center gap-0.5 lg:flex">
              {navItems.map((item) => {
                const isActive = activeSection === item.section;
                return (
                  <div
                    key={item.key}
                    className="relative"
                    onMouseEnter={() => {
                      setHovered(item.key);
                      openNow(item.menu ?? null);
                    }}
                  >
                    {pillKey === item.key && (
                      <motion.span
                        layoutId="nav-hover"
                        className="absolute inset-0 rounded-full bg-[#758052]/10"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <a
                      href={item.href}
                      onFocus={() => openNow(item.menu ?? null)}
                      aria-haspopup={item.menu ? "true" : undefined}
                      aria-expanded={item.menu ? openMenu === item.menu : undefined}
                      className={`relative z-10 inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                        isActive || pillKey === item.key ? "text-[#596442]" : "text-[#5F6253]"
                      }`}
                    >
                      {item.label}
                      {item.menu && (
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-300 ${openMenu === item.menu ? "rotate-180" : ""}`}
                        />
                      )}
                    </a>
                    {isActive && (
                      <motion.span
                        layoutId="nav-dot"
                        className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#BD674D]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setPaletteOpen(true)}
                aria-label="Search"
                className="hidden cursor-pointer items-center gap-2 rounded-full border border-[#E5E0D4] bg-white/70 px-3 py-2.5 text-xs font-semibold text-[#77776B] transition hover:border-[#758052] hover:bg-white hover:text-[#34382B] lg:flex"
              >
                <Search size={15} />
                <span className="hidden xl:inline">Search</span>
                <kbd className="hidden rounded-md border border-[#E5E0D4] bg-[#F8F5ED] px-1.5 py-0.5 text-[10px] font-bold text-[#989587] xl:inline">
                  {isMac ? "⌘K" : "Ctrl K"}
                </kbd>
              </button>

              <a
                href="#contact"
                className="group relative hidden cursor-pointer items-center gap-2 overflow-hidden rounded-full bg-[#BD674D] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(189,103,77,0.25)] transition duration-300 hover:bg-[#A9563E] hover:shadow-[0_12px_30px_rgba(189,103,77,0.35)] active:scale-[0.97] lg:inline-flex"
              >
                <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full -skew-x-12 bg-white/30 transition-transform duration-700 ease-out group-hover:translate-x-[420%]" />
                <span className="relative">Book a demo</span>
                <ArrowRight size={15} className="relative transition-transform duration-300 group-hover:translate-x-1" />
              </a>

              <button
                aria-label="Search"
                onClick={() => setPaletteOpen(true)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#E1DDCF] bg-white transition active:scale-95 lg:hidden"
              >
                <Search size={18} />
              </button>
              <button
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#E1DDCF] bg-white transition active:scale-95 lg:hidden"
              >
                <Menu size={20} />
              </button>
            </div>

            {/* Scroll progress */}
            <motion.span
              style={{ scaleX: progress }}
              className="pointer-events-none absolute bottom-0 left-6 right-6 h-[2px] origin-left rounded-full bg-gradient-to-r from-[#758052] to-[#BD674D]"
            />

            {/* Mega menus */}
            <AnimatePresence>
              {openMenu && (
                <motion.div
                  key={openMenu}
                  initial={{ opacity: 0, y: 10, scale: 0.97, x: "-50%" }}
                  animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                  exit={{ opacity: 0, y: 6, scale: 0.98, x: "-50%" }}
                  transition={{ duration: 0.22, ease }}
                  style={{ transformOrigin: "top center" }}
                  onMouseEnter={() => openNow(openMenu)}
                  onMouseLeave={closeSoon}
                  className="absolute left-1/2 top-full z-50 hidden pt-4 lg:block"
                >
                  <div className="overflow-hidden rounded-3xl border border-white/80 bg-[#FFFEFB]/95 shadow-[0_30px_80px_rgba(52,56,43,0.2)] backdrop-blur-2xl">
                    {openMenu === "platform" ? (
                      <PlatformMenu onNavigate={() => setOpenMenu(null)} />
                    ) : (
                      <SolutionsMenu onNavigate={() => setOpenMenu(null)} />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>
        </div>
      </motion.header>

      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onSearch={() => setPaletteOpen(true)}
      />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Product demo                                                        */
/* ------------------------------------------------------------------ */
function DemoTabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative shrink-0 cursor-pointer rounded-xl px-3 py-2.5 text-xs font-bold transition-colors active:scale-95 sm:px-4 ${
        active ? "text-white" : "text-[#79796C] hover:bg-[#F0EEE5] hover:text-[#34382B]"
      }`}
    >
      {active && (
        <motion.span
          layoutId="demo-tab-pill"
          className="absolute inset-0 rounded-xl bg-[#758052] shadow-sm"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}

function POSDemo() {
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [category, setCategory] = useState("All");
  const [paymentDone, setPaymentDone] = useState(false);

  const categories = ["All", "Coffee", "Mains", "Sides", "Desserts", "Drinks"];
  const filteredItems =
    category === "All" ? menuItems : menuItems.filter((item) => item.category === category);

  const count = Object.keys(quantities).reduce((sum, key) => sum + quantities[Number(key)], 0);
  const subtotal = menuItems.reduce((sum, item) => sum + item.price * (quantities[item.id] || 0), 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  const updateQuantity = (id: number, change: number) => {
    setPaymentDone(false);
    setQuantities((current) => {
      const next = Math.max(0, (current[id] || 0) + change);
      return { ...current, [id]: next };
    });
  };

  return (
    <div className="grid min-h-[475px] grid-cols-1 md:grid-cols-[1fr_240px]">
      <div className="min-w-0 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#989587]">Current order</p>
            <h3 className="mt-1 text-lg font-extrabold text-[#34382B]">Walk-in · Table 04</h3>
          </div>
          <span className="rounded-full bg-[#EEF0E6] px-3 py-1.5 text-[11px] font-bold text-[#68734D]">Dine-in</span>
        </div>

        <div className="mt-5 flex gap-1.5 overflow-x-auto pb-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`cursor-pointer whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold transition active:scale-95 ${
                category === item ? "bg-[#34382B] text-white" : "bg-[#F1EEE5] text-[#77776B] hover:bg-[#E7E3D8]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {filteredItems.map((item, i) => (
            <motion.button
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.04, ease }}
              onClick={() => updateQuantity(item.id, 1)}
              className="group cursor-pointer rounded-2xl border border-[#EAE6DC] bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-[#C8CEB6] hover:shadow-md active:scale-95"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F1E8] text-2xl transition duration-300 group-hover:rotate-6 group-hover:scale-110">
                {item.icon}
              </span>
              <p className="mt-3 line-clamp-2 min-h-9 text-xs font-bold leading-4 text-[#34382B]">{item.name}</p>
              <div className="mt-2 flex items-center justify-between gap-1">
                <span className="text-xs font-extrabold text-[#758052]">{money(item.price)}</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F3E4DE] text-[#BD674D] transition group-hover:rotate-90 group-hover:bg-[#BD674D] group-hover:text-white">
                  <Plus size={13} />
                </span>
              </div>
            </motion.button>
          ))}
        </div>
        <p className="mt-4 text-[10px] text-[#999587]">Sample menu · Tap an item to add it to the bill.</p>
      </div>

      <aside className="flex flex-col border-t border-[#EAE6DC] bg-[#FBFAF6] p-4 md:border-l md:border-t-0">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-[#34382B]">Order summary</h3>
          <span className="rounded-lg bg-[#F0EEE5] px-2 py-1 text-[10px] font-bold text-[#77776B]">{count} items</span>
        </div>

        <div className="mt-4 flex-1 space-y-3">
          {menuItems.filter((item) => quantities[item.id] > 0).length === 0 ? (
            <div className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-[#DCD8CB] px-3 text-center">
              <ShoppingBag size={22} className="text-[#A4A18F]" />
              <p className="mt-2 text-xs font-bold text-[#77776B]">Your order is empty</p>
              <p className="mt-1 text-[10px] text-[#A19D8E]">Add menu items to begin.</p>
            </div>
          ) : (
            menuItems
              .filter((item) => quantities[item.id] > 0)
              .map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, ease }}
                  className="flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#34382B]">{item.name}</p>
                    <p className="mt-1 text-[11px] text-[#898779]">{money(item.price)} each</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        aria-label={`Remove one ${item.name}`}
                        onClick={() => updateQuantity(item.id, -1)}
                        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border border-[#E3DFD4] bg-white transition hover:bg-[#F3E4DE] active:scale-90"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="min-w-3 text-center text-xs font-bold">{quantities[item.id]}</span>
                      <button
                        aria-label={`Add one ${item.name}`}
                        onClick={() => updateQuantity(item.id, 1)}
                        className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border border-[#E3DFD4] bg-white transition hover:bg-[#EEF0E6] active:scale-90"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-[#34382B]">{money(item.price * quantities[item.id])}</span>
                </motion.div>
              ))
          )}
        </div>

        <div className="mt-4 border-t border-[#E6E1D6] pt-4">
          <div className="flex justify-between text-xs text-[#898779]">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-xs text-[#898779]">
            <span>Sample tax (5%)</span>
            <span>{money(tax)}</span>
          </div>
          <div className="mt-3 flex justify-between text-sm font-extrabold text-[#34382B]">
            <span>Total</span>
            <span>{money(total)}</span>
          </div>
          <button
            onClick={() => setPaymentDone(total > 0)}
            disabled={total === 0}
            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#BD674D] px-3 py-3 text-xs font-extrabold text-white transition hover:bg-[#A9563E] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {paymentDone ? <Check size={15} /> : <CreditCard size={15} />}
            {paymentDone ? "Demo payment recorded" : "Complete sample bill"}
          </button>
          {paymentDone && (
            <p className="mt-2 text-center text-[10px] font-semibold text-[#758052]">
              Preview only — no real payment was taken.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

function FloorDemo() {
  const [tables, setTables] = useState(initialTables);
  const [selected, setSelected] = useState(2);

  const current = tables.find((table) => table.id === selected);
  const occupied = tables.filter((table) => table.status === "Occupied").length;
  const available = tables.filter((table) => table.status === "Available").length;

  const toggleTable = () => {
    setTables((previous) =>
      previous.map((table) =>
        table.id === selected
          ? { ...table, status: table.status === "Available" ? "Occupied" : "Available" }
          : table
      )
    );
  };

  const statusStyles: Record<string, string> = {
    Occupied: "border-[#D9A28F] bg-[#F7E8E1] text-[#A95A42]",
    Available: "border-[#CDD4BC] bg-[#EDF0E5] text-[#63704A]",
    Reserved: "border-[#E5D4A9] bg-[#F8F0D9] text-[#9B7C35]",
  };

  return (
    <div className="grid min-h-[475px] grid-cols-1 md:grid-cols-[1fr_230px]">
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#989587]">Restaurant floor</p>
            <h3 className="mt-1 text-lg font-extrabold text-[#34382B]">Main dining area</h3>
          </div>
          <span className="rounded-full bg-[#EEF0E6] px-3 py-1.5 text-[11px] font-bold text-[#68734D]">8 tables</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {tables.map((table, i) => (
            <motion.button
              key={table.id}
              initial={{ opacity: 0, y: 14, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, delay: i * 0.045, ease }}
              onClick={() => setSelected(table.id)}
              className={`relative flex min-h-[102px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 p-2 transition hover:-translate-y-0.5 active:scale-95 ${
                selected === table.id
                  ? "border-[#758052] bg-[#F1F2E9] shadow-[0_0_0_3px_rgba(117,128,82,0.10)]"
                  : "border-[#EAE6DC] bg-white hover:border-[#C9CFB9]"
              }`}
            >
              <Table2
                size={24}
                strokeWidth={1.7}
                className={
                  table.status === "Occupied"
                    ? "text-[#BD674D]"
                    : table.status === "Reserved"
                    ? "text-[#B18A38]"
                    : "text-[#758052]"
                }
              />
              <span className="mt-2 text-xs font-extrabold text-[#34382B]">{table.name}</span>
              <span className="mt-1 text-[10px] text-[#898779]">{table.seats} seats</span>
              <span className={`mt-2 rounded-full px-2 py-1 text-[9px] font-bold ${statusStyles[table.status]}`}>
                {table.status}
              </span>
            </motion.button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-semibold text-[#898779]">
          {[
            ["bg-[#BD674D]", "Occupied"],
            ["bg-[#758052]", "Available"],
            ["bg-[#C9A54D]", "Reserved"],
          ].map(([color, label]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${color}`} />
              {label}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-[#999587]">Sample floor plan · Select any table to view or update its status.</p>
      </div>

      <aside className="border-t border-[#EAE6DC] bg-[#FBFAF6] p-4 md:border-l md:border-t-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#989587]">Selected table</p>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF0E6] text-[#758052]">
            <Table2 size={23} />
          </span>
          <div>
            <h3 className="text-lg font-extrabold text-[#34382B]">{current?.name}</h3>
            <p className="text-xs text-[#898779]">{current?.seats} seats</p>
          </div>
        </div>

        <motion.div
          key={selected + (current?.status ?? "")}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease }}
          className="mt-5 rounded-2xl border border-[#EAE6DC] bg-white p-4"
        >
          <p className="text-xs text-[#898779]">Current status</p>
          <span className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${statusStyles[current?.status || "Available"]}`}>
            {current?.status}
          </span>
          <p className="mt-4 text-xs leading-5 text-[#77776B]">
            {current?.status === "Occupied"
              ? "This table is currently in use. Update its status when the guests leave."
              : current?.status === "Reserved"
              ? "This table is marked as reserved in the sample floor plan."
              : "This table is available for the next guests."}
          </p>
        </motion.div>

        <button
          onClick={toggleTable}
          disabled={current?.status === "Reserved"}
          className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#758052] px-3 py-3 text-xs font-extrabold text-white transition hover:bg-[#626C44] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Check size={14} />
          {current?.status === "Occupied" ? "Mark available" : current?.status === "Reserved" ? "Reserved table" : "Start sample order"}
        </button>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-[#EDF0E5] p-3">
            <p className="text-[10px] text-[#77776B]">Occupied</p>
            <p className="mt-1 text-xl font-extrabold text-[#63704A]">{occupied}</p>
          </div>
          <div className="rounded-xl bg-[#F7E8E1] p-3">
            <p className="text-[10px] text-[#77776B]">Available</p>
            <p className="mt-1 text-xl font-extrabold text-[#A95A42]">{available}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function KitchenDemo() {
  const [orders, setOrders] = useState(initialKitchenOrders);

  const nextStatus = (status: string) => {
    if (status === "New") return "Preparing";
    if (status === "Preparing") return "Ready";
    return "Served";
  };

  const statusStyle: Record<string, string> = {
    New: "bg-[#F8F0D9] text-[#9B7C35]",
    Preparing: "bg-[#F7E8E1] text-[#A95A42]",
    Ready: "bg-[#EDF0E5] text-[#63704A]",
    Served: "bg-[#EAE8E0] text-[#77776B]",
  };

  return (
    <div className="min-h-[475px] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#989587]">Kitchen display</p>
          <h3 className="mt-1 text-lg font-extrabold text-[#34382B]">Order queue</h3>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-[#EEF0E6] px-3 py-1.5 text-[11px] font-bold text-[#68734D]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#758052]" />
          Sample service
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {orders.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08, ease }}
            className="flex flex-col rounded-2xl border border-[#EAE6DC] bg-white p-4 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-lg font-extrabold text-[#34382B]">{order.id}</p>
                <p className="mt-1 text-xs text-[#898779]">Table {order.table}</p>
              </div>
              <motion.span
                key={order.status}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle[order.status]}`}
              >
                {order.status}
              </motion.span>
            </div>

            <div className="mt-5 flex-1 rounded-xl bg-[#F8F5ED] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#989587]">Items</p>
              <p className="mt-2 text-sm leading-6 text-[#555648]">{order.items}</p>
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-[10px] text-[#898779]">
              <Clock3 size={12} /> {order.time}
            </p>

            <button
              onClick={() =>
                setOrders((previous) =>
                  previous.map((item) =>
                    item.id === order.id ? { ...item, status: nextStatus(item.status) } : item
                  )
                )
              }
              disabled={order.status === "Served"}
              className="group mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#DCD8CB] px-3 py-2.5 text-xs font-bold text-[#596442] transition hover:border-[#758052] hover:bg-[#EEF0E6] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {order.status === "New"
                ? "Start preparation"
                : order.status === "Preparing"
                ? "Mark ready"
                : order.status === "Ready"
                ? "Mark served"
                : "Order completed"}
              {order.status !== "Served" && (
                <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
              )}
            </button>
          </motion.div>
        ))}
      </div>

      <p className="mt-4 text-[10px] text-[#999587]">Sample orders only · Progress an order through the kitchen workflow.</p>
    </div>
  );
}

function InsightsDemo() {
  const days = [
    { day: "Mon", value: 42 },
    { day: "Tue", value: 61 },
    { day: "Wed", value: 48 },
    { day: "Thu", value: 75 },
    { day: "Fri", value: 57 },
    { day: "Sat", value: 91 },
    { day: "Sun", value: 72 },
  ];

  const stats = [
    { label: "Sample sales", to: 48650, prefix: "₹", change: "+12.8%", icon: Wallet },
    { label: "Orders", to: 186, prefix: "", change: "+8.2%", icon: ReceiptText },
    { label: "Avg. order", to: 262, prefix: "₹", change: "+4.6%", icon: CircleDollarSign },
    { label: "Tables served", to: 64, prefix: "", change: "+10.1%", icon: Users },
  ];

  return (
    <div className="min-h-[475px] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#989587]">Business overview</p>
          <h3 className="mt-1 text-lg font-extrabold text-[#34382B]">Your restaurant at a glance</h3>
        </div>
        <span className="rounded-full bg-[#F0EEE5] px-3 py-1.5 text-[10px] font-bold text-[#77776B]">Illustrative data</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07, ease }}
              className="rounded-2xl border border-[#EAE6DC] bg-white p-3.5 transition duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF0E6] text-[#758052]">
                <Icon size={16} />
              </span>
              <p className="mt-3 text-[10px] text-[#898779]">{stat.label}</p>
              <p className="mt-1 text-xl font-extrabold tracking-tight text-[#34382B]">
                <CountUp to={stat.to} prefix={stat.prefix} />
              </p>
              <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#758052]">
                <TrendingUp size={11} /> {stat.change}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-[#EAE6DC] bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-extrabold text-[#34382B]">Weekly sales overview</h4>
            <p className="mt-1 text-[10px] text-[#898779]">Illustrative trend · Not actual business data</p>
          </div>
          <BarChart3 size={20} className="text-[#758052]" />
        </div>
        <div className="mt-6 flex h-36 items-end justify-between gap-2 sm:gap-4">
          {days.map((item, i) => (
            <div key={item.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div className="flex h-full w-full items-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${item.value}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.07, ease }}
                  whileHover={{ scaleY: 1.04 }}
                  style={{ originY: 1 }}
                  className={`w-full cursor-pointer rounded-t-lg ${item.day === "Sat" ? "bg-[#BD674D]" : "bg-[#A9B18F] hover:bg-[#758052]"} transition-colors`}
                />
              </div>
              <span className="text-[10px] font-semibold text-[#898779]">{item.day}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-[10px] text-[#999587]">
        Analytics preview · Final reports and available metrics depend on your plan and implementation.
      </p>
    </div>
  );
}

function QROrderingDemo() {
  const [table, setTable] = useState("T04");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [placed, setPlaced] = useState(false);
  const categories = ["All", "Coffee", "Mains", "Sides", "Desserts", "Drinks"];
  const filtered = category === "All" ? menuItems : menuItems.filter((item) => item.category === category);
  const count = Object.keys(cart).reduce((sum, key) => sum + cart[Number(key)], 0);
  const total = menuItems.reduce((sum, item) => sum + item.price * (cart[item.id] || 0), 0);
  const add = (id: number, delta: number) => {
    setPlaced(false);
    setCart((current) => ({ ...current, [id]: Math.max(0, (current[id] || 0) + delta) }));
  };

  return (
    <div className="grid min-h-[475px] gap-5 p-4 sm:p-5 lg:grid-cols-[0.72fr_1.28fr]">
      <div className="flex flex-col items-center justify-center rounded-[24px] border border-white/80 bg-gradient-to-br from-[#F4F3EA] via-white/90 to-[#F3E4DE]/70 p-5 text-center shadow-inner backdrop-blur-xl sm:p-7">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#D9DDCD] bg-white/80 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#68734D]">
          <QrCode size={13} /> Guest-side preview
        </span>
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative mt-6 flex h-40 w-40 items-center justify-center overflow-hidden rounded-[22px] border border-[#E5E0D4] bg-white p-3 shadow-[0_16px_40px_rgba(52,56,43,0.10)]"
        >
          <div className="grid h-full w-full grid-cols-7 grid-rows-7 gap-1">
            {Array.from({ length: 49 }, (_, i) => {
              const isFinder = [0, 1, 2, 7, 9, 14, 15, 16, 4, 5, 6, 11, 13, 18, 19, 20, 28, 29, 30, 35, 37, 42, 43, 44].includes(i);
              const filled = isFinder || ((i * 7 + i * i + 3) % 5 !== 0 && i % 3 !== 1);
              return <span key={i} className={`rounded-[2px] ${filled ? "bg-[#34382B]" : "bg-transparent"}`} />;
            })}
          </div>
          <motion.span
            animate={{ top: ["8%", "88%", "8%"] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute left-2 right-2 h-0.5 rounded-full bg-[#BD674D] shadow-[0_0_14px_rgba(189,103,77,0.8)]"
          />
        </motion.div>
        <p className="mt-5 font-[Manrope,sans-serif] text-xl font-extrabold text-[#34382B]">Scan. Choose. Enjoy.</p>
        <p className="mt-2 max-w-xs text-xs leading-5 text-[#858475]">
          A visual mock-up of a table QR touchpoint. This illustration is not a scannable live QR code.
        </p>
        <label className="mt-5 flex w-full max-w-xs cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#E5E0D4] bg-white/85 px-3 py-2.5 text-left">
          <span>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#989587]">Table</span>
            <span className="mt-1 block text-sm font-extrabold text-[#34382B]">Guest is seated at</span>
          </span>
          <select
            value={table}
            onChange={(e) => {
              setTable(e.target.value);
              setPlaced(false);
            }}
            className="cursor-pointer rounded-lg border border-[#E5E0D4] bg-[#F8F5ED] px-3 py-2 text-sm font-bold text-[#34382B] outline-none focus:border-[#758052]"
          >
            {["T01", "T02", "T03", "T04", "T05", "T06"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="min-w-0 rounded-[24px] border border-white/80 bg-white/75 p-4 backdrop-blur-xl sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#989587]">Digital menu</p>
            <h3 className="mt-1 font-[Manrope,sans-serif] text-xl font-extrabold text-[#34382B]">The Garden Table</h3>
            <p className="mt-1 text-xs text-[#858475]">Table {table} · Sample guest ordering</p>
          </div>
          <span className="rounded-full bg-[#EEF0E6] px-3 py-1.5 text-[10px] font-extrabold text-[#68734D]">Demo menu</span>
        </div>
        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`cursor-pointer whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-bold transition active:scale-95 ${
                category === item ? "bg-[#34382B] text-white" : "bg-[#F1EEE5] text-[#77776B] hover:bg-[#E7E3D8]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04, ease }}
              className="flex items-center gap-3 rounded-2xl border border-[#EAE6DC] bg-white/90 p-3 transition duration-300 hover:-translate-y-0.5 hover:border-[#CDD4BC] hover:shadow-md"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5F1E8] text-2xl">{item.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-extrabold text-[#34382B]">{item.name}</p>
                <p className="mt-1 text-xs font-bold text-[#758052]">{money(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  aria-label={`Remove ${item.name}`}
                  onClick={() => add(item.id, -1)}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-[#E3DFD4] bg-white transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
                  disabled={!cart[item.id]}
                >
                  <Minus size={12} />
                </button>
                <span className="min-w-3 text-center text-xs font-bold">{cart[item.id] || 0}</span>
                <button
                  aria-label={`Add ${item.name}`}
                  onClick={() => add(item.id, 1)}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-[#EEF0E6] text-[#63704A] transition hover:bg-[#758052] hover:text-white active:scale-90"
                >
                  <Plus size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-[#F8F5ED] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-[#858475]">
              {count} item{count === 1 ? "" : "s"} in your order
            </p>
            <p className="mt-1 text-xl font-extrabold text-[#34382B]">{money(total)}</p>
          </div>
          <button
            onClick={() => setPlaced(total > 0)}
            disabled={total === 0}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#BD674D] px-5 py-3 text-xs font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#A9563E] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {placed ? <Check size={14} /> : <ShoppingBag size={14} />}
            {placed ? `Sample order sent · ${table}` : "Place sample order"}
          </button>
        </div>
        {placed && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-xl bg-[#E9ECDD] p-3 text-xs leading-5 text-[#596442]"
          >
            Demo only: this order stays in the preview and is not sent to a real kitchen or restaurant system.
          </motion.p>
        )}
      </div>
    </div>
  );
}

function ProductDemo() {
  const [activeTab, setActiveTab] = useState<DemoTab>("POS Billing");

  return (
    <div
      id="platform"
      className="scroll-mt-28 overflow-hidden rounded-[24px] border border-[#E3DFD4] bg-white shadow-[0_25px_80px_rgba(52,56,43,0.12)] sm:rounded-[30px]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE6DC] bg-[#FCFBF8] px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#758052] text-white">
            <UtensilsCrossed size={15} />
          </span>
          <div>
            <p className="text-sm font-extrabold text-[#34382B]">Restora Workspace</p>
            <p className="text-[10px] text-[#898779]">Interactive product preview</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D9DDCD] bg-[#EEF0E6] px-2.5 py-1.5 text-[10px] font-bold text-[#596442]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#758052]" />
          Sample environment
        </span>
      </div>

      <div className="flex gap-1.5 overflow-x-auto border-b border-[#EAE6DC] px-3 py-3 sm:px-5">
        <DemoTabButton active={activeTab === "POS Billing"} onClick={() => setActiveTab("POS Billing")}>
          <ReceiptText size={14} /> POS Billing
        </DemoTabButton>
        <DemoTabButton active={activeTab === "Floor Plan"} onClick={() => setActiveTab("Floor Plan")}>
          <Table2 size={14} /> Floor Plan
        </DemoTabButton>
        <DemoTabButton active={activeTab === "QR Ordering"} onClick={() => setActiveTab("QR Ordering")}>
          <QrCode size={14} /> QR Ordering
        </DemoTabButton>
        <DemoTabButton active={activeTab === "Kitchen"} onClick={() => setActiveTab("Kitchen")}>
          <ChefHat size={14} /> Kitchen
        </DemoTabButton>
        <DemoTabButton active={activeTab === "Insights"} onClick={() => setActiveTab("Insights")}>
          <BarChart3 size={14} /> Insights
        </DemoTabButton>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease }}
        >
          {activeTab === "POS Billing" && <POSDemo />}
          {activeTab === "Floor Plan" && <FloorDemo />}
          {activeTab === "QR Ordering" && <QROrderingDemo />}
          {activeTab === "Kitchen" && <KitchenDemo />}
          {activeTab === "Insights" && <InsightsDemo />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      <motion.div
        animate={{ y: [0, -34, 0], x: [0, 22, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-28 -top-24 h-[420px] w-[420px] rounded-full bg-[#E7E9DC] opacity-70 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 30, 0], x: [0, -18, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-40 top-[450px] h-[360px] w-[360px] rounded-full bg-[#F1DDD3] opacity-50 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-1/2 top-24 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-[#DDE3C8] blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-24 lg:px-10 lg:pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Eyebrow>
              <Sparkles size={13} /> Restaurant operations, reimagined
            </Eyebrow>

            <h1
              aria-label="Less chaos behind the counter. More joy in every service."
              className="mt-7 font-[Manrope,sans-serif] text-[2.65rem] font-extrabold leading-[1.08] tracking-[-0.065em] text-[#34382B] sm:text-6xl lg:text-[4.65rem]"
            >
              <span className="block">
                <Letters text="Less chaos behind" offset={0} />
              </span>
              <span className="block">
                <Letters text="the counter." offset={17} />{" "}
                <span className="relative inline-block text-[#BD674D]">
                  <Letters text="More joy" offset={30} />
                  <motion.span
                    className="absolute -bottom-1 left-0 h-1 w-full origin-left rounded-full bg-[#BD674D]/30"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 38 * 0.04 + 0.2, ease }}
                  />
                </span>
              </span>
              <span className="block">
                <Letters text="in every service." offset={38} />
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2, ease }}
              className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#77776B] sm:text-lg sm:leading-8"
            >
              Bring billing, tables, orders and daily operations into one thoughtful workspace. Meet the
              restaurant management platform designed to help your team serve better.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.35, ease }}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Magnetic>
                <Button href="#contact" className="px-7 py-3.5">
                  Book your free demo <ArrowRight size={16} />
                </Button>
              </Magnetic>
              <Magnetic>
                <Button href="#platform" secondary className="px-7 py-3.5">
                  <Monitor size={16} /> Try the interactive preview
                </Button>
              </Magnetic>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.55 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-[#898779]"
            >
              <span className="flex items-center gap-1.5"><Check size={14} className="text-[#758052]" /> Explore real interactions</span>
              <span className="flex items-center gap-1.5"><Check size={14} className="text-[#758052]" /> Restaurant-first workflows</span>
              <span className="flex items-center gap-1.5"><Check size={14} className="text-[#758052]" /> Built for growing teams</span>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 44, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.5, ease }}
          className="mx-auto mt-14 max-w-6xl sm:mt-16"
        >
          <Tilt>
            <ProductDemo />
          </Tilt>
          <p className="mt-4 text-center text-[11px] text-[#969283]">
            This is an interactive sample experience, not a connected live restaurant account.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-3 sm:mt-20 sm:grid-cols-4 sm:gap-5">
          {[
            { icon: ReceiptText, title: "Faster billing", text: "A smoother checkout flow" },
            { icon: Table2, title: "Clearer floor", text: "Know every table's status" },
            { icon: ChefHat, title: "Kitchen flow", text: "Track orders at a glance" },
            { icon: BarChart3, title: "Better visibility", text: "Understand daily operations" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={i * 0.08} y={20}>
                <div className="group flex h-full cursor-pointer items-start gap-3 rounded-2xl border border-[#E7E2D6] bg-white/75 p-4 transition duration-300 hover:-translate-y-1 hover:border-[#C9CFB9] hover:bg-white hover:shadow-lg">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF0E6] text-[#758052] transition duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-[#758052] group-hover:text-white">
                    <Icon size={17} />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-[#34382B]">{item.title}</p>
                    <p className="mt-1 text-[10px] leading-4 text-[#898779]">{item.text}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */
function FeatureSection() {
  const features = [
    {
      icon: ReceiptText,
      number: "01",
      title: "Billing that keeps the line moving",
      description:
        "Build orders, adjust quantities and calculate the bill in one clear workflow. Keep the checkout experience simple for your staff and your guests.",
      tags: ["Quick order entry", "Item-level totals", "Dine-in workflow"],
      color: "bg-[#F3E4DE] text-[#BD674D]",
      glow: "rgba(189,103,77,0.13)",
    },
    {
      icon: Table2,
      number: "02",
      title: "A floor your whole team understands",
      description:
        "Get a visual view of table availability, occupancy and reservations. Give the front-of-house team a clearer picture of what's happening.",
      tags: ["Visual floor plan", "Table statuses", "Service visibility"],
      color: "bg-[#EEF0E6] text-[#758052]",
      glow: "rgba(117,128,82,0.15)",
    },
    {
      icon: ChefHat,
      number: "03",
      title: "A more organised kitchen",
      description:
        "Make order progress easier to follow, from new tickets to preparation and ready-to-serve orders.",
      tags: ["Order queue", "Preparation stages", "Status tracking"],
      color: "bg-[#F6EFD9] text-[#A1843D]",
      glow: "rgba(201,165,77,0.16)",
    },
    {
      icon: BarChart3,
      number: "04",
      title: "See beyond today's rush",
      description:
        "Bring operational summaries and useful business metrics into view so owners can make more informed decisions.",
      tags: ["Sales summaries", "Order insights", "Performance trends"],
      color: "bg-[#E8E9E0] text-[#596442]",
      glow: "rgba(89,100,66,0.14)",
    },
    {
      icon: QrCode,
      number: "05",
      title: "Connect the guest experience",
      description:
        "Explore the potential for QR menus, digital ordering and a more convenient way for guests to interact with your restaurant.",
      tags: ["QR menu capability", "Digital guest journey", "Order convenience"],
      color: "bg-[#F3E4DE] text-[#BD674D]",
      glow: "rgba(189,103,77,0.13)",
    },
    {
      icon: Users,
      number: "06",
      title: "Create a better team workflow",
      description:
        "Build a more consistent operating routine with the right tools for your restaurant's front-of-house and back-of-house teams.",
      tags: ["Role-based workflows", "Team coordination", "Operational clarity"],
      color: "bg-[#EEF0E6] text-[#758052]",
      glow: "rgba(117,128,82,0.15)",
    },
  ];

  return (
    <section id="features" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeading
          eyebrow="Made for restaurant life"
          title={<>Everything in sync. <span className="text-[#758052]">Service in flow.</span></>}
          description="Restaurant work gets complicated quickly. Restora brings essential workflows together in a cleaner, more connected experience."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={(index % 3) * 0.1} className="h-full">
                <SpotlightCard
                  color={feature.glow}
                  className="h-full cursor-pointer rounded-[24px] border border-[#EEEAE0] bg-white p-6 shadow-[0_8px_30px_rgba(52,56,43,0.035)] transition duration-500 hover:-translate-y-1.5 hover:border-[#D4D8C7] hover:shadow-[0_22px_55px_rgba(52,56,43,0.10)] sm:p-7"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl transition duration-500 group-hover:-rotate-6 group-hover:scale-110 ${feature.color}`}
                    >
                      <Icon size={22} />
                    </span>
                    <span className="font-[Manrope,sans-serif] text-xs font-extrabold tracking-widest text-[#C5C0B2] transition-colors duration-300 group-hover:text-[#BD674D]">
                      {feature.number}
                    </span>
                  </div>
                  <h3 className="mt-6 font-[Manrope,sans-serif] text-xl font-extrabold leading-snug tracking-tight text-[#34382B]">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#77776B]">{feature.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {feature.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#E8E3D7] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#77776B] transition duration-300 group-hover:border-[#C9CFB9]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a
                    href="#platform"
                    className="mt-6 inline-flex cursor-pointer items-center gap-2 text-xs font-extrabold text-[#758052] transition-all duration-300 group-hover:gap-3"
                  >
                    Explore preview <ArrowRight size={14} />
                  </a>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  const steps = [
    {
      number: "01",
      title: "Set up your restaurant",
      description: "Organise your menu, dining areas, tables and the workflows your team needs.",
      icon: LayoutDashboard,
    },
    {
      number: "02",
      title: "Take orders with clarity",
      description: "Create bills and coordinate service with a more consistent process.",
      icon: ShoppingBag,
    },
    {
      number: "03",
      title: "Keep the kitchen moving",
      description: "Follow order progress and help front-of-house and kitchen teams stay aligned.",
      icon: CookingPot,
    },
    {
      number: "04",
      title: "Review and improve",
      description: "Use available operational insights to understand activity and plan your next move.",
      icon: TrendingUp,
    },
  ];

  return (
    <section id="workflow" className="scroll-mt-20 bg-[#F0EEE5] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-32">
            <Reveal>
              <Eyebrow>From order to insight</Eyebrow>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5 font-[Manrope,sans-serif] text-3xl font-extrabold leading-tight tracking-[-0.045em] text-[#34382B] sm:text-4xl md:text-5xl">
                One connected flow.
                <span className="text-[#BD674D]"> Fewer loose ends.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-5 max-w-lg text-base leading-7 text-[#77776B]">
                Give your team a clearer way to work through the service, without juggling disconnected processes.
              </p>
              <Button href="#platform" className="mt-7">
                Explore the workflow <ArrowRight size={16} />
              </Button>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="group mt-9 rounded-3xl border border-[#DEDACD] bg-[#F8F5ED] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#758052] text-white transition duration-300 group-hover:rotate-12 group-hover:scale-110">
                  <Zap size={19} />
                </span>
                <h3 className="mt-4 font-[Manrope,sans-serif] text-lg font-extrabold text-[#34382B]">
                  Designed around service
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#77776B]">
                  Start with the workflows that matter most to your restaurant, then explore the modules that fit your operation.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: 40, filter: "blur(6px)" }}
                  whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.08, ease }}
                  whileHover={{ x: 6 }}
                  className="group relative flex cursor-pointer gap-4 rounded-[24px] border border-[#E1DDCF] bg-white p-5 transition-shadow duration-300 hover:border-[#C9CFB9] hover:shadow-[0_18px_45px_rgba(52,56,43,0.09)] sm:gap-6 sm:p-7"
                >
                  <div className="flex shrink-0 flex-col items-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF0E6] text-[#758052] transition duration-300 group-hover:rotate-6 group-hover:bg-[#758052] group-hover:text-white">
                      <Icon size={21} />
                    </span>
                    {index < steps.length - 1 && (
                      <motion.span
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 + index * 0.1, ease }}
                        style={{ originY: 0 }}
                        className="mt-3 h-full w-px bg-[#DCD8CB]"
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[10px] font-extrabold tracking-[0.15em] text-[#BD674D]">STEP {step.number}</span>
                      {index === 0 && (
                        <span className="rounded-full bg-[#EEF0E6] px-2.5 py-1 text-[9px] font-bold text-[#63704A]">GET STARTED</span>
                      )}
                    </div>
                    <h3 className="mt-2 font-[Manrope,sans-serif] text-lg font-extrabold text-[#34382B] sm:text-xl">{step.title}</h3>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-[#77776B]">{step.description}</p>
                  </div>
                  <span className="hidden text-2xl font-extrabold text-[#E5E1D6] transition-colors duration-300 group-hover:text-[#BD674D]/50 sm:block">
                    {step.number}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function AudienceSection() {
  const audiences = [
    { icon: Coffee, title: "Cafés & coffee shops", description: "Keep counter orders, drinks and daily service organised.", emoji: "☕" },
    { icon: UtensilsCrossed, title: "Full-service restaurants", description: "Connect tables, billing and order flow across the floor.", emoji: "🍽️" },
    { icon: Globe2, title: "Cloud kitchens", description: "Bring order handling and kitchen visibility into focus.", emoji: "🥡" },
    { icon: Users, title: "Growing restaurant groups", description: "Build a foundation for more structured operations as you grow.", emoji: "🏡" },
  ];

  return (
    <section id="audiences" className="scroll-mt-20 bg-[#F8F5ED] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeading
          eyebrow="For the way you serve"
          title={<>Your restaurant has its own rhythm. <span className="text-[#758052]">Restora fits the flow.</span></>}
          description="From a neighbourhood café to a growing food business, explore a platform direction built around everyday restaurant operations."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={index * 0.09} className="h-full">
                <SpotlightCard
                  color="rgba(189,103,77,0.12)"
                  className="h-full cursor-pointer rounded-[24px] border border-[#E7E2D6] bg-white p-6 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(52,56,43,0.10)]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3E4DE] text-2xl transition duration-500 group-hover:-rotate-12 group-hover:scale-125">
                    {item.emoji}
                  </span>
                  <h3 className="mt-5 font-[Manrope,sans-serif] text-lg font-extrabold text-[#34382B]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#77776B]">{item.description}</p>
                  <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#758052] transition-all duration-300 group-hover:gap-3">
                    <Icon size={15} /> Explore your workflow
                  </div>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const plans = [
    { name: "Starter", description: "For small cafés and new restaurant teams.", monthly: 1499, annual: 14990, features: ["Core POS workflow", "Menu and item management", "Basic order handling", "Essential sales overview"], button: "Explore Starter", featured: false },
    { name: "Growth", description: "For busy restaurants connecting front-of-house and kitchen.", monthly: 2999, annual: 29999, features: ["Everything in Starter", "Floor and table management", "QR ordering workflow preview", "Kitchen order workflow", "Operational insights"], button: "Book a demo", featured: true },
    { name: "Scale", description: "For larger operations that need a considered rollout.", monthly: 4999, annual: 34999, features: ["Everything in Growth", "Advanced workflow planning", "Outlet and role requirements review", "Custom setup consultation", "Implementation planning"], button: "Discuss your needs", featured: false },
  ];

  return (
    <section id="pricing" className="relative scroll-mt-20 overflow-hidden bg-white py-20 sm:py-24">
      <motion.div
        animate={{ y: [0, 28, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-36 top-20 h-80 w-80 rounded-full bg-[#EEF0E6] blur-3xl"
      />
      <motion.div
        animate={{ y: [0, -28, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-36 bottom-0 h-80 w-80 rounded-full bg-[#F3E4DE]/70 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <SectionHeading
          eyebrow="Plans designed to grow with you"
          title={<>A smoother service is <span className="text-[#BD674D]">worth investing in.</span></>}
          description="Choose a billing preference to explore proposed plans. We’ll confirm the final scope, feature availability and commercial terms before onboarding."
        />

        <Reveal delay={0.1}>
          <div className="mx-auto mt-8 flex w-fit items-center gap-1 rounded-full border border-[#E5E0D4] bg-[#F8F5ED]/90 p-1.5 shadow-sm backdrop-blur-xl">
            {(["monthly", "annual"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setBilling(key)}
                className={`relative inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-xs font-extrabold capitalize transition-colors duration-300 ${
                  billing === key ? "text-white" : "text-[#77776B] hover:text-[#34382B]"
                }`}
              >
                {billing === key && (
                  <motion.span
                    layoutId="billing-pill"
                    className="absolute inset-0 rounded-full bg-[#34382B] shadow-md"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative z-10">{key}</span>
                {key === "annual" && (
                  <span
                    className={`relative z-10 rounded-full px-2 py-0.5 text-[9px] ${
                      billing === "annual" ? "bg-white/20 text-white" : "bg-[#E7EBDD] text-[#63704A]"
                    }`}
                  >
                    SAVE MORE
                  </span>
                )}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-3 lg:gap-6">
          {plans.map((plan, index) => {
            const price = billing === "monthly" ? plan.monthly : plan.annual;
            const monthlyEquivalent = Math.round(plan.annual / 12);
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.7, delay: index * 0.12, ease }}
                whileHover={{ y: -8 }}
                className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-[30px] border p-6 backdrop-blur-2xl transition-shadow duration-500 sm:p-8 ${
                  plan.featured
                    ? "border-[#758052]/60 bg-gradient-to-br from-[#F1F3E8]/95 via-white/90 to-[#F8F5ED]/80 shadow-[0_22px_70px_rgba(117,128,82,0.17)] hover:shadow-[0_30px_80px_rgba(117,128,82,0.28)]"
                    : "border-white/90 bg-white/75 shadow-[0_14px_45px_rgba(52,56,43,0.07)] hover:shadow-[0_25px_60px_rgba(52,56,43,0.13)]"
                }`}
              >
                <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#E7EBDD]/70 blur-3xl transition duration-500 group-hover:scale-150" />
                {plan.featured && (
                  <motion.span
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute right-5 top-5 rounded-full bg-[#758052] px-3 py-1.5 text-[9px] font-extrabold tracking-wider text-white"
                  >
                    RECOMMENDED
                  </motion.span>
                )}
                <div className="relative flex flex-1 flex-col">
                  <div className="flex items-center gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF0E6] text-[#758052] transition duration-500 group-hover:rotate-12 group-hover:scale-110">
                      <Sparkles size={18} />
                    </span>
                    <p className="text-sm font-extrabold text-[#758052]">{plan.name}</p>
                  </div>
                  <p className="mt-4 min-h-12 max-w-xs text-sm leading-6 text-[#77776B]">{plan.description}</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="relative inline-flex h-11 overflow-hidden">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={billing}
                          initial={{ y: "100%", opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: "-100%", opacity: 0 }}
                          transition={{ duration: 0.25, ease }}
                          className="font-[Manrope,sans-serif] text-4xl font-extrabold tracking-[-0.06em] text-[#34382B]"
                        >
                          {money(price)}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                    <span className="text-xs text-[#898779]">/{billing === "monthly" ? "month" : "year"}</span>
                  </div>
                  {billing === "annual" ? (
                    <p className="mt-2 text-xs font-semibold text-[#758052]">About {money(monthlyEquivalent)} / month, billed annually</p>
                  ) : (
                    <p className="mt-2 text-xs text-[#999587]">Flexible monthly billing</p>
                  )}
                  <div className="my-6 h-px bg-[#E5E1D6]" />
                  <p className="text-xs font-extrabold text-[#34382B]">Plan highlights</p>
                  <ul className="mt-4 flex-1 space-y-3.5">
                    {plan.features.map((feature, fi) => (
                      <motion.li
                        key={feature}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.3 + fi * 0.06, ease }}
                        className="flex items-start gap-2.5 text-sm text-[#68695D]"
                      >
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#E7EBDD] text-[#758052]">
                          <Check size={11} strokeWidth={3} />
                        </span>
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <Button href="#contact" secondary={!plan.featured} className="mt-8 w-full">
                    {plan.button} <ArrowRight size={15} />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-7 max-w-3xl rounded-2xl border border-[#E5E0D4]/80 bg-[#F8F5ED]/75 px-5 py-4 text-center backdrop-blur-xl">
            <p className="text-xs leading-5 text-[#77776B]">
              <strong className="text-[#34382B]">Indicative pricing only.</strong> These are proposed pricing points for discussion, not a final offer. Hardware, GST, integrations, onboarding, support commitments, outlet limits and production-ready feature availability must be confirmed in writing.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { question: "What is Restora?", answer: "Restora is a restaurant management platform being developed by Softrenix Technologies. Its product direction includes POS billing, floor and table management, kitchen order workflows and operational insights." },
    { question: "Can I try the product before booking a demo?", answer: "Yes. The interactive preview on this page lets you explore sample billing, tables, kitchen orders and analytics. It uses demonstration data and does not connect to a real restaurant account." },
    { question: "Can I use Restora for my café or cloud kitchen?", answer: "The platform is being designed around different restaurant workflows, including cafés, full-service restaurants and cloud kitchens. Contact us to discuss your operating model and the features you need." },
    { question: "Does the listed pricing represent the final price?", answer: "No. The displayed prices are proposed starting points. Final pricing, feature availability, onboarding, supported hardware and integrations will be confirmed before any purchase." },
    { question: "Will I need to install software?", answer: "The intended experience is browser-based access for the management interface, with device and hardware requirements depending on the final deployment. We will confirm supported setups as the product becomes available." },
    { question: "How do I request a demo or discuss a custom setup?", answer: "Use the contact form below to share your restaurant name, business type and requirements. The team can then discuss the suitable setup, timeline and next steps." },
  ];

  return (
    <section className="bg-[#F8F5ED] py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20 lg:px-10">
        <div>
          <Reveal>
            <Eyebrow>Questions, answered</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 font-[Manrope,sans-serif] text-3xl font-extrabold leading-tight tracking-[-0.045em] text-[#34382B] sm:text-4xl">
              A little more clarity before you begin.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-4 text-base leading-7 text-[#77776B]">
              Need to understand how Restora could fit into your restaurant? Start here, or speak with us about your specific workflow.
            </p>
            <a href="#contact" className="group mt-6 inline-flex cursor-pointer items-center gap-2 text-sm font-extrabold text-[#BD674D]">
              Ask us a question <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </Reveal>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <Reveal key={faq.question} delay={index * 0.06} y={18}>
                <div
                  className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
                    isOpen ? "border-[#C9CFB9] shadow-[0_12px_32px_rgba(52,56,43,0.07)]" : "border-[#E5E0D4] hover:border-[#C9CFB9]"
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                  >
                    <span className="text-sm font-extrabold leading-6 text-[#34382B]">{faq.question}</span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                        isOpen ? "bg-[#758052] text-white" : "bg-[#EEF0E6] text-[#758052]"
                      }`}
                    >
                      <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm leading-6 text-[#77776B] sm:px-6">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    restaurant: "",
    email: "",
    type: "Full-service restaurant",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setSubmitted(false);
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = encodeURIComponent(`Restora demo enquiry — ${form.restaurant}`);
    const body = encodeURIComponent(
      `Hello Softrenix Technologies,\n\nI'd like to discuss Restora for my restaurant.\n\nName: ${form.name}\nRestaurant: ${form.restaurant}\nEmail: ${form.email}\nBusiness type: ${form.type}\nRequirements: ${form.message || "Not specified"}\n\nPlease contact me about the next steps.\n`
    );

    window.location.href = `mailto:info@softrenix.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  const inputClass =
    "w-full rounded-xl border border-[#DFDACC] bg-white px-3.5 py-3 text-sm text-[#34382B] outline-none transition duration-300 placeholder:text-[#AAA696] hover:border-[#C9CFB9] focus:-translate-y-0.5 focus:border-[#758052] focus:shadow-[0_8px_20px_rgba(117,128,82,0.12)] focus:ring-2 focus:ring-[#758052]/10";

  return (
    <section id="contact" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal y={40}>
          <div className="relative overflow-hidden rounded-[30px] bg-[#34382B]">
            <motion.div
              animate={{ y: [0, 30, 0], x: [0, -20, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-[#758052] opacity-40 blur-3xl"
            />
            <motion.div
              animate={{ y: [0, -30, 0], x: [0, 24, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute -bottom-36 left-1/3 h-80 w-80 rounded-full bg-[#BD674D] opacity-25 blur-3xl"
            />

            <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:p-14">
              <div className="flex flex-col justify-center">
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#E8E9DC]">
                  <Sparkles size={13} /> Let's talk restaurant operations
                </span>
                <h2 className="mt-6 font-[Manrope,sans-serif] text-3xl font-extrabold leading-tight tracking-[-0.045em] text-white sm:text-4xl md:text-5xl">
                  Your next service could run a little smoother.
                </h2>
                <p className="mt-5 max-w-lg text-sm leading-7 text-[#D0D0C5] sm:text-base">
                  Tell us about your restaurant and the challenges you want to solve. Let's explore whether Restora is the right fit for your team.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    { icon: Check, text: "Discuss your current workflow" },
                    { icon: Monitor, text: "Explore the product experience" },
                    { icon: Users, text: "Plan the right setup for your team" },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.text}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 + i * 0.1, ease }}
                        className="group flex items-center gap-3 text-sm font-medium text-[#E7E7DC]"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-[#D7DDBF] transition duration-300 group-hover:rotate-6 group-hover:bg-[#758052] group-hover:text-white">
                          <Icon size={15} />
                        </span>
                        {item.text}
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-9 border-t border-white/15 pt-6">
                  <p className="text-xs text-[#BEBFB2]">Developed by</p>
                  <p className="mt-1 text-base font-extrabold text-white">Softrenix Technologies</p>
                  <p className="mt-1 text-xs text-[#BEBFB2]">Engineering Beyond Boundaries</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="rounded-[24px] bg-[#F8F5ED] p-5 sm:p-7">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#758052]">Request a conversation</p>
                  <h3 className="mt-2 font-[Manrope,sans-serif] text-2xl font-extrabold tracking-tight text-[#34382B]">
                    Let's get to know your restaurant.
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-[#898779]">
                    Share a few details and your email app will open with a pre-filled enquiry.
                  </p>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-[#555648]">Your name *</span>
                    <input name="name" value={form.name} onChange={handleChange} required placeholder="Full name" className={inputClass} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-[#555648]">Restaurant name *</span>
                    <input name="restaurant" value={form.restaurant} onChange={handleChange} required placeholder="Your business" className={inputClass} />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-bold text-[#555648]">Business email *</span>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@restaurant.com" className={inputClass} />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-bold text-[#555648]">Business type *</span>
                    <select name="type" value={form.type} onChange={handleChange} required className={`${inputClass} cursor-pointer`}>
                      <option>Full-service restaurant</option>
                      <option>Café or coffee shop</option>
                      <option>Cloud kitchen</option>
                      <option>Quick-service restaurant</option>
                      <option>Restaurant group / multiple outlets</option>
                      <option>Other food business</option>
                    </select>
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-bold text-[#555648]">What would you like to improve?</span>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Billing, tables, kitchen orders, reporting..."
                      className={`${inputClass} resize-y`}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="group relative mt-5 flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full bg-[#BD674D] px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_8px_24px_rgba(189,103,77,0.18)] transition duration-300 hover:bg-[#A9563E] hover:shadow-[0_14px_34px_rgba(189,103,77,0.34)] active:scale-[0.98]"
                >
                  <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full -skew-x-12 bg-white/25 transition-transform duration-700 ease-out group-hover:translate-x-[420%]" />
                  <span className="relative">Request a demo</span>
                  <ArrowRight size={16} className="relative transition-transform duration-300 group-hover:translate-x-1" />
                </button>

                <AnimatePresence>
                  {submitted && (
                    <motion.p
                      initial={{ opacity: 0, y: 8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 overflow-hidden rounded-xl bg-[#E9ECDD] p-3 text-xs leading-5 text-[#596442]"
                    >
                      Your email app should open with the enquiry prepared. Please send the email to complete your request. If nothing opens, email info@softrenix.com directly.
                    </motion.p>
                  )}
                </AnimatePresence>

                <p className="mt-3 text-center text-[10px] leading-4 text-[#999587]">
                  This form prepares an email on your device. It does not submit to a server or store your details.
                </p>
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  const columns = [
    { title: "EXPLORE", links: [["Product preview", "#platform"], ["Features", "#features"], ["How it works", "#workflow"], ["Pricing plans", "#pricing"], ["Request a demo", "#contact"]] },
    { title: "WORKFLOWS", links: [["POS & billing", "#platform"], ["Floor & tables", "#platform"], ["QR ordering", "#platform"], ["Kitchen display", "#platform"], ["Operational insights", "#platform"]] },
    { title: "COMPANY", links: [["About Softrenix", "https://www.softrenix.com"], ["Our process", "https://www.softrenix.com"], ["Contact", "#contact"], ["Softrenix website", "https://www.softrenix.com"]] },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#292D22] text-[#F8F5ED]">
      <motion.div
        animate={{ y: [0, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-[#758052]/25 blur-[100px]"
      />
      <motion.div
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#BD674D]/20 blur-[100px]"
      />
      <div className="relative mx-auto max-w-7xl px-5 pb-6 pt-14 sm:px-8 sm:pt-20 lg:px-10">
        <div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.15fr_1.85fr] lg:gap-20 lg:pb-16">
          <Reveal>
            <a href="#home" className="group inline-flex cursor-pointer items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-[#E7EBDD] shadow-lg backdrop-blur-xl transition duration-300 group-hover:-rotate-6 group-hover:bg-[#758052]">
                <UtensilsCrossed size={22} />
              </span>
              <span>
                <span className="block font-[Manrope,sans-serif] text-2xl font-extrabold tracking-[-0.05em] text-white">
                  restora<span className="text-[#D98A70]">.</span>
                </span>
                <span className="mt-0.5 block text-[9px] font-bold tracking-[0.2em] text-[#BFC3B1]">BY SOFTRENIX TECHNOLOGIES</span>
              </span>
            </a>
            <p className="mt-6 max-w-md text-sm leading-7 text-[#C5C7BA]">
              A more considered way to run restaurant operations — from the first order to the final service update.
            </p>
            <a
              href="#contact"
              className="group mt-7 inline-flex cursor-pointer items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-3.5 text-xs font-extrabold text-white shadow-lg backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[#D98A70]/60 hover:bg-white/15"
            >
              LET'S TALK RESTAURANT OPERATIONS
              <ArrowUpRight size={15} className="text-[#D98A70] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <div className="mt-8 flex flex-wrap items-center gap-2 text-[9px] font-bold tracking-[0.17em] text-[#AEB2A1]">
              {["POS", "TABLES", "QR ORDERING", "KITCHEN", "INSIGHTS"].map((item) => (
                <span key={item} className="cursor-pointer rounded-full border border-white/10 px-3 py-1.5 transition duration-300 hover:border-[#D98A70]/60 hover:text-white">
                  {item}
                </span>
              ))}
            </div>
          </Reveal>

          <div className="grid grid-cols-2 gap-x-7 gap-y-9 sm:grid-cols-3 sm:gap-x-8">
            {columns.map((column, ci) => (
              <Reveal key={column.title} delay={0.1 + ci * 0.1}>
                <p className="text-[10px] font-extrabold tracking-[0.2em] text-[#D5D9C7]">{column.title}</p>
                <div className="mt-5 space-y-3.5">
                  {column.links.map(([label, href]) => (
                    <a
                      key={label}
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noreferrer" : undefined}
                      className="group flex w-fit cursor-pointer items-center gap-1.5 text-xs text-[#B6BAAB] transition duration-200 hover:translate-x-1 hover:text-white"
                    >
                      {label}
                      {href.startsWith("http") && (
                        <ArrowUpRight size={11} className="opacity-0 transition group-hover:opacity-100" />
                      )}
                    </a>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-7 border-b border-white/10 py-8 md:flex-row md:items-end">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-[#AEB2A1]">HAVE A RESTAURANT IN MIND?</p>
            <a
              href="#contact"
              className="group mt-2 inline-flex cursor-pointer items-center gap-3 font-[Manrope,sans-serif] text-2xl font-extrabold tracking-[-0.04em] text-white transition hover:text-[#E8B09D] sm:text-3xl"
            >
              Let's make service flow.
              <ArrowUpRight size={22} className="text-[#D98A70] transition group-hover:-translate-y-1 group-hover:translate-x-1" />
            </a>
          </div>
          <a
            href="https://www.softrenix.com"
            target="_blank"
            rel="noreferrer"
            className="cursor-pointer text-xs font-bold text-[#B6BAAB] transition hover:text-white"
          >
            Engineering Beyond Boundaries <ArrowUpRight size={12} className="inline" />
          </a>
        </div>

        <div className="flex flex-col justify-between gap-5 pt-6 text-[10px] leading-5 text-[#AEB2A1] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Restora · By Softrenix Technologies. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href="https://www.softrenix.com" target="_blank" rel="noreferrer" className="cursor-pointer transition hover:text-white">Privacy</a>
            <a href="https://www.softrenix.com" target="_blank" rel="noreferrer" className="cursor-pointer transition hover:text-white">Terms</a>
            <a href="https://www.softrenix.com" target="_blank" rel="noreferrer" className="cursor-pointer transition hover:text-white">
              Softrenix website <ArrowUpRight size={10} className="inline" />
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 overflow-hidden sm:flex-row sm:items-end">
          <p
            aria-label="RESTORA."
            className="font-[Manrope,sans-serif] text-[clamp(3rem,11vw,9rem)] font-extrabold leading-[0.8] tracking-[-0.09em] text-white/[0.06]"
          >
            {"RESTORA.".split("").map((char, i) => (
              <motion.span
                key={i}
                aria-hidden="true"
                className="inline-block"
                initial={{ y: "70%", opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7, delay: i * 0.07, ease }}
              >
                {char}
              </motion.span>
            ))}
          </p>
          <p className="pb-1 text-[9px] font-extrabold tracking-[0.25em] text-[#D5D9C7]">
            INDIA <span className="mx-2 text-[#D98A70]">→</span> GLOBAL
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#F8F5ED] font-sans text-[#34382B]">
        <Navbar />
        <main>
          <Hero />
          <Marquee />
          <FeatureSection />
          <WorkflowSection />
          <AudienceSection />
          <PricingSection />
          <FAQSection />
          <ContactSection />
        </main>
        <Footer />
        <BackToTop />
      </div>
    </MotionConfig>
  );
}
