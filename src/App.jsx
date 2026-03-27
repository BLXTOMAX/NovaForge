import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Globe,
  Layers3,
  ShoppingCart,
  Building2,
  Gamepad2,
  ArrowRight,
  Check,
  Palette,
  Sparkles,
  ShieldCheck,
  Zap,
  Menu,
  X,
  Rocket,
  MessageCircle,
  Clock3,
  BadgeCheck,
  LayoutTemplate,
  Gem,
  Star,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

const particles = Array.from({ length: 70 }, (_, i) => ({
  id: i,
  size: 3 + (i % 6) * 4,
  left: `${(i * 9) % 100}%`,
  top: `${(i * 13) % 100}%`,
  duration: 10 + (i % 7) * 2.5,
  delay: (i % 9) * 0.45,
}));

const services = [
  {
    icon: <Gamepad2 className="h-6 w-6" />,
    title: "Site FiveM / Gaming",
    text: "Un site qui met en avant ton serveur, renforce ta communauté et attire de nouveaux joueurs.",
  },
  {
    icon: <Building2 className="h-6 w-6" />,
    title: "Site Entreprise",
    text: "Un site qui rassure tes clients, valorise ton activité et donne une image professionnelle immédiate.",
  },
  {
    icon: <ShoppingCart className="h-6 w-6" />,
    title: "Site Shop / Boutique",
    text: "Une vitrine stylée et claire pour présenter tes produits, tes offres et donner envie d’acheter.",
  },
  {
    icon: <Layers3 className="h-6 w-6" />,
    title: "Site Projet Perso",
    text: "Portfolio, communauté, application web ou concept perso : un rendu sur mesure pensé pour ton univers.",
  },
];

const themes = [
  {
    title: "Neon Pulse ⚡",
    label: "Futuriste",
    desc: "Ambiance sombre, glow coloré, animations premium et rendu ultra moderne.",
  },
  {
    title: "Business Prestige 🏢",
    label: "Professionnel",
    desc: "Design épuré, crédible et structuré pour rassurer et convertir les visiteurs.",
  },
  {
    title: "Gaming Impact 🎮",
    label: "Communauté",
    desc: "Univers visuel fort, dynamique et parfait pour serveurs, teams et projets gaming.",
  },
  {
    title: "Luxury Aura 💎",
    label: "Premium",
    desc: "Finitions haut de gamme, dégradés élégants et image de marque plus luxueuse.",
  },
];

const pricing = [
  {
    name: "Starter",
    oldPrice: "149€",
    price: "99€",
    accent: "Réduction d'ouverture",
    features: [
      {
        label: "1 page moderne",
        included: true,
        note: "Base propre pour lancer rapidement ton projet.",
      },
      {
        label: "Design responsive",
        included: true,
        note: "Lecture fluide sur mobile, tablette et desktop.",
      },
      {
        label: "Animations légères",
        included: true,
        note: "Rendu moderne sans alourdir la page.",
      },
      {
        label: "Structure simple et efficace",
        included: true,
        note: "Idéal pour une présence en ligne claire et rapide.",
      },
      {
        label: "Suivi après livraison si besoin",
        included: true,
        note: "Petit ajustement ou réponse rapide après mise en ligne.",
      },
      {
        label: "Identité visuelle premium",
        included: false,
        note: "Disponible à partir du pack Pro.",
      },
      {
        label: "Pages supplémentaires / structure business",
        included: false,
        note: "Réservé au Pro et au Ultra.",
      },
      {
        label: "Support premium prioritaire",
        included: false,
        note: "Priorité de suivi sur les packs supérieurs.",
      },
      {
        label: "Accompagnement branding / concept",
        included: false,
        note: "Inclus sur le pack Ultra.",
      },
    ],
    target: "Idéal pour petit projet / lancement",
    delivery: "2 à 4 jours",
    popular: false,
  },
  {
    name: "Pro",
    oldPrice: "349€",
    price: "199€",
    accent: "Le plus demandé",
    features: [
      {
        label: "Jusqu'à 5 pages",
        included: true,
        note: "Plus d'espace pour présenter le projet, les services ou le shop.",
      },
      {
        label: "Identité visuelle premium",
        included: true,
        note: "Direction visuelle plus forte pour rassurer et marquer.",
      },
      {
        label: "Animations avancées",
        included: true,
        note: "Rendu plus dynamique et plus impactant.",
      },
      {
        label: "Structure optimisée projet / business",
        included: true,
        note: "Parcours plus propre pour vendre, convertir ou présenter.",
      },
      {
        label: "Intégration d'appel à l'action",
        included: true,
        note: "Boutons et sections pensés pour faire passer à l'action.",
      },
      {
        label: "Suivi après livraison si besoin",
        included: true,
        note: "Ajustements rapides et accompagnement plus confortable.",
      },
      {
        label: "Support premium prioritaire",
        included: true,
        note: "Demandes traitées en priorité par rapport au Starter.",
      },
      {
        label: "Accompagnement branding / concept complet",
        included: false,
        note: "Réservé au pack Ultra.",
      },
      {
        label: "Expérience 100% sur mesure",
        included: false,
        note: "Disponible uniquement sur devis avec Ultra.",
      },
    ],
    target: "Idéal pour business / serveur / shop",
    delivery: "3 à 5 jours",
    popular: true,
  },
  {
    name: "Ultra",
    oldPrice: "Sur devis",
    price: "Sur devis",
    accent: "100% personnalisé",
    features: [
      {
        label: "Expérience 100% sur mesure",
        included: true,
        note: "Conçue autour du besoin exact, sans limite de structure standard.",
      },
      {
        label: "Pages / sections selon le besoin",
        included: true,
        note: "Architecture libre selon le projet et le niveau d'ambition.",
      },
      {
        label: "Animations poussées et effets premium",
        included: true,
        note: "Finitions plus haut de gamme pour un rendu marquant.",
      },
      {
        label: "Branding complet",
        included: true,
        note: "Univers visuel plus poussé pour une image de marque forte.",
      },
      {
        label: "Accompagnement sur le concept",
        included: true,
        note: "On affine ensemble la direction visuelle et la stratégie.",
      },
      {
        label: "Support premium prioritaire",
        included: true,
        note: "Suivi dédié et échanges plus poussés pendant le projet.",
      },
      {
        label: "Suivi dédié après livraison",
        included: true,
        note: "Accompagnement plus complet une fois le site en ligne.",
      },
      {
        label: "Optimisation image / conversion / impact",
        included: true,
        note: "Pensé pour un projet sérieux qui doit vraiment se distinguer.",
      },
    ],
    target: "Idéal pour projet sérieux / image forte",
    delivery: "Selon le projet",
    popular: false,
  },
];

const strengths = [
  {
    icon: <Clock3 className="h-5 w-5" />,
    title: "Livraison rapide",
    text: "Un site propre, moderne et structuré sans perdre des semaines sur un template bancal.",
  },
  {
    icon: <LayoutTemplate className="h-5 w-5" />,
    title: "Design unique",
    text: "Pas de rendu générique. L'objectif est d'avoir une vraie identité visuelle pour ton projet.",
  },
  {
    icon: <BadgeCheck className="h-5 w-5" />,
    title: "Adapté à ton activité",
    text: "FiveM, business, boutique, lancement de projet ou communauté : tout est pensé selon ton besoin.",
  },
  {
    icon: <Gem className="h-5 w-5" />,
    title: "Support après livraison",
    text: "Je reste disponible pour les petites corrections et l'évolution du site après la mise en ligne.",
  },
];

const portfolio = [
  {
    tag: "FiveM",
    title: "Landing serveur immersive",
    text: "Page d'accueil orientée communauté avec mise en avant du serveur, du staff et des appels à l'action.",
    accent: "from-cyan-400/20 via-violet-500/20 to-fuchsia-500/20",
  },
  {
    tag: "Business",
    title: "Présentation entreprise premium",
    text: "Site pro clair et moderne pour vendre des services, rassurer les visiteurs et capter des contacts.",
    accent: "from-emerald-400/20 via-cyan-500/20 to-blue-500/20",
  },
  {
    tag: "Shop",
    title: "Vitrine boutique stylée",
    text: "Design boutique avec sections produit, visuels premium et structure pensée pour mettre en avant les offres.",
    accent: "from-fuchsia-400/20 via-pink-500/20 to-orange-400/20",
  },
];

const faqs = [
  {
    question: "Combien de temps faut-il pour créer un site ?",
    answer:
      "Selon le pack et la complexité du projet, le délai tourne généralement entre 2 et 5 jours pour une formule classique.",
  },
  {
    question: "Le site sera-t-il adapté au mobile ?",
    answer:
      "Oui, chaque site est pensé pour être responsive et rester propre sur ordinateur, tablette et mobile.",
  },
  {
    question: "Peut-on faire un site pour FiveM, une entreprise ou une boutique ?",
    answer:
      "Oui, NovaForge s’adapte aussi bien aux serveurs FiveM qu’aux projets business, shops, communautés et concepts personnalisés.",
  },
  {
    question: "Est-ce qu'il y a une réduction de lancement ?",
    answer:
      "Oui, pour l'ouverture du site, certaines formules profitent d'un prix réduit par rapport au tarif classique affiché barré.",
  },
  {
    question: "Puis-je demander des modifications ?",
    answer:
      "Oui, des ajustements sont prévus selon le pack choisi et le projet peut évoluer par la suite si besoin.",
  },
  {
    question: "Comment se passe le paiement ?",
    answer:
      "Le paiement passe via le checkout, puis par PayPal ou via Discord selon le mode choisi. Le parcours est guidé étape par étape.",
  },
];

const supportTopics = [
  "Prix d'un site",
  "Modele specifique",
  "Pack Starter / Pro / Ultra",
  "Avantages du site",
  "Moyen de paiement",
  "Delai de livraison",
  "Modification apres commande",
  "Autre question",
];

function AnimatedParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full bg-white/10 blur-[1px]"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.left,
            top: particle.top,
          }}
          animate={{
            y: [0, -30, 12, -18, 0],
            x: [0, 16, -12, 10, 0],
            opacity: [0.12, 0.55, 0.25, 0.5, 0.15],
            scale: [1, 1.25, 0.9, 1.12, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        animate={{ opacity: [0.22, 0.5, 0.22], scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[8%] top-[4%] h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl"
      />
      <motion.div
        animate={{ opacity: [0.18, 0.45, 0.18], scale: [1, 1.1, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[8%] top-[18%] h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl"
      />
      <motion.div
        animate={{ opacity: [0.16, 0.4, 0.16], scale: [1, 1.07, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[15%] top-[42%] h-64 w-64 rounded-full bg-violet-500/12 blur-3xl"
      />
      <motion.div
        animate={{ opacity: [0.16, 0.42, 0.16], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[12%] top-[55%] h-72 w-72 rounded-full bg-fuchsia-500/12 blur-3xl"
      />
      <motion.div
        animate={{ opacity: [0.14, 0.38, 0.14], scale: [1, 1.06, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-[72%] h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/12 blur-3xl"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,7,18,0.05)_60%,rgba(3,7,18,0.22)_100%)]" />
    </div>
  );
}

function SectionTitle({ badge, title, text }) {
  return (
    <div className="mx-auto mb-14 max-w-2xl text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-cyan-300 backdrop-blur">
        <Sparkles className="h-4 w-4" />
        {badge}
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-white/65 md:text-base">{text}</p>
    </div>
  );
}

function GlowCard({ children, className = "" }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.25 }}
      className={`group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 backdrop-blur-xl ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(217,70,239,0.14),transparent_35%)]" />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [supportEmail, setSupportEmail] = useState("");
  const [supportTopic, setSupportTopic] = useState("Prix d'un site");
  const [supportMessage, setSupportMessage] = useState("");
  const [isSupportSending, setIsSupportSending] = useState(false);
  const [supportFeedback, setSupportFeedback] = useState("");
  const navigate = useNavigate();

  const goToCheckout = (pack, method = "paypal", email = "") => {
    setIsRedirecting(true);

    const params = new URLSearchParams();
    if (pack) params.set("pack", pack);
    if (method) params.set("method", method);
    if (email) params.set("email", email);

    setTimeout(() => {
      navigate(`/checkout?${params.toString()}`);
    }, 900);
  };

  const submitSupport = async () => {
    if (!supportEmail.trim() || !supportMessage.trim()) {
      setSupportFeedback("Ajoute ton email et ton message.");
      return;
    }

    setIsSupportSending(true);
    setSupportFeedback("");

    try {
      const response = await fetch(`${apiUrl}/support`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Support site",
          email: supportEmail,
          topic: supportTopic,
          message: supportMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Impossible d'envoyer le message.");
      }

      setSupportEmail("");
      setSupportTopic("Prix d'un site");
      setSupportMessage("");
      setSupportFeedback("Message envoye. On te repondra au plus vite.");
    } catch (error) {
      console.error(error);
      setSupportFeedback("Erreur pendant l'envoi. Utilise le bouton Discord juste en dessous.");
    } finally {
      setIsSupportSending(false);
    }
  };

  const navItems = useMemo(
    () => [
      { href: "#services", label: "Services" },
      { href: "#themes", label: "Themes" },
      { href: "#portfolio", label: "Portfolio" },
      { href: "#pricing", label: "Tarifs" },
      { href: "#faq", label: "FAQ" },
      { href: "#support", label: "Support" },
    ],
    []
  );
  return (
    <div
      id="top"
      className="min-h-screen overflow-hidden bg-[#050816] text-white selection:bg-fuchsia-500/30 selection:text-white"
    >
      <div className="relative">
        <AnimatedParticles />

        <div className="relative z-20 border-b border-cyan-400/10 bg-gradient-to-r from-cyan-500/10 via-fuchsia-500/10 to-violet-500/10 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-6 py-2 text-center text-xs font-medium text-cyan-200 lg:px-8">
            <Rocket className="h-4 w-4" />
            Offre d'ouverture : prix réduits sur les formules Starter et Pro pour le lancement du site.
          </div>
        </div>

        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
            <a href="#top" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/20">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-semibold tracking-wide">NovaForge</div>
                <div className="text-xs text-white/45">Sites premium modernes & animés</div>
              </div>
            </a>

            <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="transition hover:text-white">
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="hidden md:block">
              <a
                href="https://discord.gg/vg9X5n6gyh"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
              >
                Rejoindre Discord
              </a>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 md:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {menuOpen && (
            <div className="border-t border-white/10 bg-black/40 px-6 py-4 backdrop-blur-xl md:hidden">
              <div className="flex flex-col gap-3">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                  >
                    {item.label}
                  </a>
                ))}
                <a
                  href="https://discord.gg/vg9X5n6gyh"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Rejoindre Discord
                </a>
              </div>
            </div>
          )}
        </header>

        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-8 lg:pb-32 lg:pt-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-cyan-300"
              >
                <Zap className="h-4 w-4" />
                Offre de lancement • prix réduits
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="max-w-4xl text-5xl font-black leading-[1.02] tracking-tight md:text-7xl"
              >
                Un site qui donne une vraie image{" "}
                <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                  PRO
                </span>{" "}
                à ton projet.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-6 max-w-2xl text-base leading-8 text-white/70 md:text-lg"
              >
                Design premium, animations modernes et structure pensée pour convertir tes visiteurs dès les premières secondes.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mt-10 flex flex-col gap-4 sm:flex-row"
              >
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 px-6 py-4 text-sm font-semibold text-white shadow-2xl shadow-fuchsia-500/20 transition hover:scale-[1.02]"
                >
                  Voir les offres
                  <ArrowRight className="h-4 w-4" />
                </a>

                <button
                  onClick={() => goToCheckout("Pro", "paypal")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white/85 backdrop-blur transition hover:bg-white/10"
                >
                  <MessageCircle className="h-4 w-4" />
                  Commander maintenant
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-6 flex flex-wrap gap-4 text-xs text-white/50"
              >
                <span>✔ Livraison rapide</span>
                <span>✔ Design sur mesure</span>
                <span>✔ Support Discord</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3"
              >
                {[
                  ["100% responsive", "Desktop, tablette, mobile"],
                  ["Design premium", "Couleurs, glow, animations"],
                  ["Adapté au projet", "Gaming, business, shop"],
                ].map(([title, desc]) => (
                  <GlowCard key={title} className="p-4">
                    <div className="text-sm font-semibold text-white">{title}</div>
                    <div className="mt-1 text-sm text-white/55">{desc}</div>
                  </GlowCard>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="relative"
            >
              <motion.div
                animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.03, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-cyan-500/20 via-violet-500/20 to-fuchsia-500/20 blur-2xl"
              />
              <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/40 backdrop-blur-2xl">
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400/80" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                  <span className="h-3 w-3 rounded-full bg-green-400/80" />
                </div>
                <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#071021] p-5">
                  <div className="mb-5 rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-400/10 via-violet-500/10 to-fuchsia-500/10 p-4">
                    <div className="text-xs uppercase tracking-[0.25em] text-cyan-300">NovaForge</div>
                    <div className="mt-2 text-2xl font-bold">Ton projet mérite mieux qu’un site basique.</div>
                  </div>

                  <div className="grid gap-4">
                    <GlowCard className="p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                        <Palette className="h-4 w-4 text-fuchsia-300" />
                        Branding visuel
                      </div>
                      <div className="text-sm text-white/60">
                        Palette cohérente, dégradés, ambiance sombre et rendu haut de gamme.
                      </div>
                    </GlowCard>

                    <GlowCard className="p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                        <Zap className="h-4 w-4 text-cyan-300" />
                        Animations fluides
                      </div>
                      <div className="text-sm text-white/60">
                        Hero animé, particules flottantes, blocs interactifs et transitions premium.
                      </div>
                    </GlowCard>

                    <GlowCard className="p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                        <ShieldCheck className="h-4 w-4 text-violet-300" />
                        Structure claire
                      </div>
                      <div className="text-sm text-white/60">
                        Message fort, offres lisibles, thèmes variés et sections pensées pour convertir.
                      </div>
                    </GlowCard>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <section id="services" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <SectionTitle
          badge="Services"
          title="Des sites pensés pour plusieurs univers"
          text="Que ce soit pour un serveur FiveM, une activité professionnelle, une boutique ou un projet perso, le site s'adapte à l'objectif et au style visuel recherché."
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service, i) => (
            <GlowCard key={service.title} className="p-6">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/15 via-violet-500/15 to-fuchsia-500/15 text-cyan-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-white">{service.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/65">{service.text}</p>
              </motion.div>
            </GlowCard>
          ))}
        </div>
      </section>

      <section id="themes" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <SectionTitle
          badge="Thèmes"
          title="Plusieurs styles, plusieurs ambiances réelles"
          text="Chaque direction visuelle a sa propre énergie : futuriste, business, gaming ou premium. Le but est d'avoir un style plus concret et plus mémorable qu'une simple variation numérotée."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {themes.map((theme, i) => (
            <motion.div
              key={theme.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
            >
              <GlowCard className="p-7">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />
                <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl" />
                <div className="relative">
                  <div className="mb-3 text-sm uppercase tracking-[0.25em] text-cyan-300">{theme.label}</div>
                  <h3 className="text-2xl font-bold text-white">{theme.title}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-white/65">{theme.desc}</p>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <SectionTitle
          badge="Pourquoi moi"
          title="Une création pensée pour faire plus qu'être jolie"
          text="L'objectif n'est pas juste d'avoir un beau rendu, mais un site qui met en valeur ton projet, inspire confiance et donne envie de te contacter."
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {strengths.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <GlowCard className="h-full p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-cyan-300">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/65">{item.text}</p>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="portfolio" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <SectionTitle
          badge="Portfolio"
          title="Des previews plus réalistes pour mieux projeter le client"
          text="Au lieu de simples blocs abstraits, ces aperçus donnent une vraie sensation de rendu final selon le type de projet."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {portfolio.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
            >
              <GlowCard className="h-full p-6">
                <div className="mb-5 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-300">
                  {item.tag}
                </div>
                <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/65">{item.text}</p>

                <div
                  className={`mt-8 overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br ${item.accent} p-5`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-red-400/80" />
                      <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                      <span className="h-3 w-3 rounded-full bg-green-400/80" />
                    </div>
                    <Star className="h-4 w-4 text-white/70" />
                  </div>

                  {item.tag === "FiveM" && (
                    <div className="rounded-[1.25rem] border border-white/10 bg-[#08101d]/90 p-4 backdrop-blur-xl">
                      <div className="rounded-2xl border border-cyan-400/15 bg-gradient-to-r from-cyan-400/10 via-violet-500/10 to-fuchsia-500/10 p-4">
                        <div className="h-4 w-1/2 rounded-full bg-white/20" />
                        <div className="mt-3 h-3 w-1/3 rounded-full bg-white/10" />
                        <div className="mt-5 flex gap-3">
                          <div className="h-9 w-28 rounded-xl bg-cyan-400/20" />
                          <div className="h-9 w-24 rounded-xl bg-white/10" />
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="h-24 rounded-2xl bg-white/10" />
                        <div className="h-24 rounded-2xl bg-white/10" />
                        <div className="h-24 rounded-2xl bg-white/10" />
                      </div>
                    </div>
                  )}

                  {item.tag === "Business" && (
                    <div className="rounded-[1.25rem] border border-white/10 bg-[#08101d]/90 p-4 backdrop-blur-xl">
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <div className="h-4 w-28 rounded-full bg-white/20" />
                        <div className="flex gap-2">
                          <div className="h-3 w-12 rounded-full bg-white/10" />
                          <div className="h-3 w-12 rounded-full bg-white/10" />
                          <div className="h-3 w-12 rounded-full bg-white/10" />
                        </div>
                      </div>
                      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="h-5 w-2/3 rounded-full bg-white/20" />
                        <div className="mt-3 h-3 w-1/2 rounded-full bg-white/10" />
                        <div className="mt-5 h-10 w-32 rounded-xl bg-cyan-400/20" />
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="h-24 rounded-2xl bg-white/10" />
                        <div className="h-24 rounded-2xl bg-white/10" />
                      </div>
                    </div>
                  )}

                  {item.tag === "Shop" && (
                    <div className="rounded-[1.25rem] border border-white/10 bg-[#08101d]/90 p-4 backdrop-blur-xl">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between">
                          <div className="h-4 w-24 rounded-full bg-white/20" />
                          <div className="h-9 w-24 rounded-xl bg-fuchsia-400/20" />
                        </div>
                        <div className="mt-4 h-24 rounded-2xl bg-white/10" />
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                          <div className="h-20 rounded-xl bg-white/10" />
                          <div className="mt-3 h-3 w-2/3 rounded-full bg-white/15" />
                          <div className="mt-2 h-3 w-1/3 rounded-full bg-fuchsia-300/25" />
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                          <div className="h-20 rounded-xl bg-white/10" />
                          <div className="mt-3 h-3 w-2/3 rounded-full bg-white/15" />
                          <div className="mt-2 h-3 w-1/3 rounded-full bg-fuchsia-300/25" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-white/50">
          Adapté aux serveurs FiveM, projets business et boutiques modernes.
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-5xl px-6 py-24 lg:px-8">
        <SectionTitle
          badge="FAQ"
          title="Les questions qu'on peut te poser le plus souvent"
          text="Une section simple et propre pour rassurer les visiteurs avant qu'ils te contactent."
        />

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
              >
                <GlowCard className="p-0">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-base font-semibold text-white md:text-lg">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-cyan-300 transition ${
                        isOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-sm leading-7 text-white/65">{faq.answer}</div>
                  </motion.div>
                </GlowCard>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <SectionTitle
          badge="Tarifs"
          title="Des offres claires avec réduction de lancement"
          text="Pour l'ouverture du site, les offres Starter et Pro sont disponibles à tarif réduit. C'est le bon moment pour lancer ton projet avec un design premium à meilleur prix."
        />

        <div className="mb-8 rounded-[1.75rem] border border-fuchsia-400/20 bg-gradient-to-r from-fuchsia-500/10 via-violet-500/10 to-cyan-500/10 p-5 text-center text-sm text-white/80 backdrop-blur-xl">
          Offre d'ouverture active : au lieu du tarif classique, tu profites du prix réduit affiché ci-dessous.
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {pricing.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="h-full"
            >
              <GlowCard
                className={`h-full p-8 ${
                  plan.popular
                    ? "border-fuchsia-400/40 bg-gradient-to-b from-fuchsia-500/10 to-cyan-500/10 shadow-2xl shadow-fuchsia-500/10"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute right-6 top-6 rounded-full border border-fuchsia-300/20 bg-fuchsia-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-fuchsia-200">
                    Populaire
                  </div>
                )}

                <div className="text-sm uppercase tracking-[0.25em] text-cyan-300">{plan.accent}</div>
                <h3 className="mt-4 text-3xl font-bold text-white">{plan.name}</h3>

                <div className="mt-4 flex items-end gap-3">
                  {plan.oldPrice !== plan.price && (
                    <span className="text-lg text-white/35 line-through">{plan.oldPrice}</span>
                  )}
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                </div>

                <p className="mt-2 text-xs text-cyan-300">⚠️ Prix de lancement (limité)</p>
                <p className="mt-1 text-xs text-white/50">⏱ Livraison : {plan.delivery}</p>
                <p className="mt-3 text-sm text-fuchsia-200">{plan.target}</p>

                <div className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <div
                      key={feature.label}
                      className={`rounded-2xl border px-4 py-3 ${
                        feature.included
                          ? "border-cyan-400/15 bg-white/[0.04] text-white/80"
                          : "border-white/8 bg-white/[0.02] text-white/35"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            feature.included ? "bg-cyan-400/15" : "bg-white/5"
                          }`}
                        >
                          {feature.included ? (
                            <Check className="h-3.5 w-3.5 text-cyan-300" />
                          ) : (
                            <X className="h-3.5 w-3.5 text-white/35" />
                          )}
                        </div>

                        <div>
                          <p
                            className={`text-sm ${
                              feature.included
                                ? "text-white/80"
                                : "text-white/40 line-through decoration-white/15"
                            }`}
                          >
                            {feature.label}
                          </p>
                          <p
                            className={`mt-1 text-xs ${
                              feature.included ? "text-cyan-100/60" : "text-white/30"
                            }`}
                          >
                            {feature.note}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <button
                    onClick={() => goToCheckout(plan.name, "paypal")}
                    className={`inline-flex w-full items-center justify-center rounded-2xl px-5 py-4 text-sm font-semibold transition ${
                      plan.popular
                        ? "bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 text-white hover:scale-[1.02]"
                        : "border border-white/10 bg-white/5 text-white/90 hover:bg-white/10"
                    }`}
                  >
                    Payer
                  </button>

                  <button
                    onClick={() => goToCheckout(plan.name, "discord")}
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white/85 transition hover:bg-white/10"
                  >
                    Discord
                  </button>
                </div>

                <p className="mt-4 text-xs text-white/40">Paiement sécurisé via PayPal ou Discord</p>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-5xl px-6 pb-24 text-center lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-14 backdrop-blur-2xl">
          <h2 className="text-3xl font-bold text-white md:text-5xl">Prêt à passer au niveau supérieur ?</h2>
          <p className="mt-4 text-white/60">Offre de lancement encore disponible.</p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <button
              onClick={() => goToCheckout("Pro", "paypal")}
              className="rounded-2xl bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 px-6 py-4 font-semibold text-white shadow-xl shadow-fuchsia-500/20 transition hover:scale-[1.02]"
            >
              Commander maintenant
            </button>

            <a
              href="https://discord.gg/vg9X5n6gyh"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white/80 transition hover:bg-white/10"
            >
              Rejoindre Discord
            </a>
          </div>
        </div>
      </section>

      <section id="support" className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(7,15,44,0.95),rgba(23,12,44,0.9))] shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="border-b border-white/10 px-8 py-10 lg:border-b-0 lg:border-r">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-cyan-300">
                <MessageCircle className="h-4 w-4" />
                Support
              </div>

              <h2 className="mt-6 text-4xl font-black tracking-tight text-white md:text-5xl">
                Une question ?
              </h2>

              <p className="mt-5 max-w-xl text-base leading-8 text-white/68">
                Envoie directement ton message depuis le site avec ton email, ou utilise le
                support Discord si tu veux une rÃ©ponse plus rapide.
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                  <div className="text-sm font-semibold text-white">Message direct</div>
                  <p className="mt-2 text-sm leading-7 text-white/60">
                    Laisse ton email et explique ton besoin. On pourra te recontacter proprement.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-fuchsia-400/15 bg-fuchsia-500/[0.08] p-5">
                  <div className="text-sm font-semibold text-fuchsia-100">Support Discord</div>
                  <p className="mt-2 text-sm leading-7 text-white/65">
                    Ouvre directement le salon support si tu prÃ©fÃ¨res un canal interne.
                  </p>
                </div>
              </div>

              <a
                href="https://discord.com/channels/1461025038231670828/1484300903010799777"
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-fuchsia-500/20 transition hover:scale-[1.02]"
              >
                Ouvrir le support Discord
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <div className="px-8 py-10">
              <div className="grid gap-5">
                <div>
                  <label className="mb-3 block text-sm font-semibold text-white/80">Ton email</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(event) => setSupportEmail(event.target.value)}
                    placeholder="tonmail@email.com"
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-white outline-none transition placeholder:text-white/35 focus:border-cyan-400/40"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-white/80">
                    Quel est le probleme ?
                  </label>
                  <select
                    value={supportTopic}
                    onChange={(event) => setSupportTopic(event.target.value)}
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-white outline-none transition focus:border-cyan-400/40"
                  >
                    {supportTopics.map((topic) => (
                      <option key={topic} value={topic} className="bg-[#0b1226] text-white">
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-white/80">Ton message</label>
                  <textarea
                    value={supportMessage}
                    onChange={(event) => setSupportMessage(event.target.value)}
                    placeholder="Decris ici ton probleme ou ta question en detail."
                    className="min-h-[180px] w-full rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-5 py-4 text-white outline-none transition placeholder:text-white/35 focus:border-cyan-400/40"
                  />
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={submitSupport}
                    disabled={isSupportSending}
                    className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-fuchsia-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSupportSending ? "Envoi..." : "Envoyer le message"}
                  </button>

                  <a
                    href="https://discord.com/channels/1461025038231670828/1484300903010799777"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white/85 transition hover:bg-white/[0.08]"
                  >
                    Support Discord
                  </a>
                </div>

                {supportFeedback && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/78">
                    {supportFeedback}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.1fr_0.8fr_0.8fr] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/20">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-semibold tracking-wide">NovaForge</div>
                <div className="text-xs text-white/45">Sites premium modernes & animés</div>
              </div>
            </div>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
              Sites modernes, sombres, animés et pensés pour vendre une vraie image de marque à ton projet.
            </p>

            <div className="mt-5 inline-flex rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-fuchsia-200">
              Offre d'ouverture active
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Navigation</div>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/65">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="transition hover:text-white">
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">Contact</div>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/65">
              <a href="mailto:paristom356@gmail.com" className="transition hover:text-white">
                paristom356@gmail.com
              </a>
              <a
                href="https://discord.gg/vg9X5n6gyh"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 transition hover:text-white"
              >
                Discord
                <ExternalLink className="h-4 w-4" />
              </a>
              <a href="/checkout" className="transition hover:text-white">
                Checkout
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 text-sm text-white/45 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>© 2026 NovaForge. Tous droits réservés.</div>
            <div>Design sombre • animations premium • checkout rapide</div>
          </div>
        </div>
      </footer>

      <a
        href="https://discord.gg/vg9X5n6gyh"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-[#091120]/90 px-5 py-3 text-sm font-semibold text-white shadow-2xl shadow-cyan-500/10 backdrop-blur-xl transition hover:scale-[1.03] hover:border-cyan-400/40"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500">
          <MessageCircle className="h-4 w-4" />
        </div>
        <div className="hidden sm:block">
          <div>Parler sur Discord</div>
          <div className="text-xs font-normal text-white/55">Réponse rapide</div>
        </div>
      </a>

      {isRedirecting && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(14px)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-[#050816]/75"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 18, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1224]/90 p-8 text-center shadow-2xl"
          >
            <motion.div
              animate={{
                opacity: [0.35, 0.75, 0.35],
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(217,70,239,0.18),transparent_35%)]"
            />

            <motion.div
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5"
            />

            <div className="relative">
              <motion.div
                initial={{ scale: 0.85, rotate: -8 }}
                animate={{
                  scale: [1, 1.08, 1],
                  rotate: [0, 4, -4, 0],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.6rem] bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 shadow-[0_0_35px_rgba(168,85,247,0.35)]"
              >
                <Sparkles className="h-8 w-8 text-white" />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.35 }}
                className="text-2xl font-bold tracking-tight text-white"
              >
                Redirection sécurisée
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.35 }}
                className="mt-3 text-sm leading-7 text-white/65"
              >
                Préparation de ton checkout premium...
              </motion.p>

              <div className="mt-7 overflow-hidden rounded-full bg-white/10 p-[2px]">
                <div className="h-2 rounded-full bg-black/20">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      duration: 1.1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="h-full w-1/2 rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 shadow-[0_0_16px_rgba(34,211,238,0.35)]"
                  />
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="mt-4 text-xs uppercase tracking-[0.28em] text-cyan-300"
              >
                Checkout • NovaForge
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}



