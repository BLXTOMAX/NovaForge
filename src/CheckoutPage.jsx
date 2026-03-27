import { useEffect, useMemo, useState } from "react";
import emailjs from "@emailjs/browser";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Wallet,
  MessageCircle,
  Sparkles,
  Mail,
  Copy,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

/* ================= CONFIG ================= */

const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

const packs = [
  {
    name: "Starter",
    price: "99 EUR",
    features: [
      "1 page moderne",
      "Responsive",
      "Animations legeres",
      "Suivi apres livraison si besoin",
    ],
    delay: "2 a 4 jours",
    summary:
      "Une formule simple et propre pour lancer rapidement ton projet avec une vraie presence en ligne.",
    audience: "petit projet, lancement ou page unique",
    promise: "Une base claire, moderne et efficace pour lancer ton projet.",
    details: "Une page unique propre, responsive et accompagnee si tu as un petit besoin apres livraison.",
    outcome: "Ideal pour avoir une presence serieuse rapidement.",
  },
  {
    name: "Pro",
    price: "199 EUR",
    features: [
      "Jusqu'a 5 pages",
      "Identite visuelle premium",
      "Support premium prioritaire",
      "Appels a l'action integres",
    ],
    delay: "3 a 5 jours",
    popular: true,
    summary:
      "Le pack le plus complet pour une image de marque plus forte et un site beaucoup plus pro.",
    audience: "business, serveur, shop ou projet plus serieux",
    promise: "Un site plus complet, plus premium et plus impactant.",
    details: "Plusieurs pages, une meilleure structure et un vrai plus sur l'image, la conversion et le support.",
    outcome: "Le meilleur choix pour un rendu plus pro et plus vendeur.",
  },
  {
    name: "Ultra",
    price: "Sur devis",
    features: [
      "Experience sur mesure",
      "Branding complet",
      "Support premium dedie",
      "Accompagnement sur le concept",
    ],
    delay: "Selon projet",
    summary:
      "Une experience totalement sur mesure pour un projet premium avec accompagnement complet.",
    audience: "projet ambitieux, branding fort ou besoin specifique",
    promise: "Une creation sur mesure avec un niveau de finition plus pousse.",
    details: "Une approche premium, plus libre et plus personnalisee avec accompagnement dedie.",
    outcome: "Parfait pour un projet ambitieux qui doit vraiment se distinguer.",
  },
];

function generateRef() {
  return "NF-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

const stepCard =
  "rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm px-4 py-3 transition";

/* ================= PAGE ================= */

export default function CheckoutPage() {
  const location = useLocation();

  const [selectedPack, setSelectedPack] = useState("Pro");
  const [email, setEmail] = useState("");
  const [orderRef, setOrderRef] = useState(generateRef());
  const [copied, setCopied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("paypal");

  const [isSending, setIsSending] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [sendError, setSendError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSelectedPack(params.get("pack") || "Pro");
    setEmail(params.get("email") || "");
    setOrderRef(generateRef());
  }, [location.search]);

  const selectedPlan = useMemo(() => {
    return packs.find((pack) => pack.name === selectedPack) || packs[1];
  }, [selectedPack]);

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(orderRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const sendOrder = async () => {
    if (paymentMethod === "card") {
      if (!email.trim()) {
        alert("Entre ton email avant de payer");
        return;
      }

      const localRef =
        "NF-" + Math.random().toString(36).substring(2, 8).toUpperCase();

      localStorage.setItem(
        "nf_order",
        JSON.stringify({
          pack: selectedPlan.name,
          email,
          ref: localRef,
          method: "card",
        })
      );
      localStorage.removeItem("nf_order_sent");

      try {
        const response = await fetch(`${apiUrl}/create-checkout-session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pack: selectedPlan.name,
            email,
            ref: localRef,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(data);
          alert("Erreur Stripe");
          return;
        }

        if (data.url) {
          window.location.href = data.url;
        }
      } catch (err) {
        console.error(err);
        alert("Impossible de lancer le paiement Stripe.");
      }

      return;
    }

    if (!email.trim()) {
      setSendError("Ajoute ton email.");
      return;
    }

    setIsSending(true);
    setSendError("");
    setOrderSent(false);

    try {
      await emailjs.send(
        "service_pe128kh",
        "template_m767pgq",
        {
          pack: selectedPlan.name,
          email,
          ref: orderRef,
          method: paymentMethod,
        },
        "bS17uC8ls46E4T9hQ"
      );

      const res = await fetch(`${apiUrl}/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pack: selectedPlan.name,
          email,
          ref: orderRef,
          method: paymentMethod,
        }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        console.error(data);
        setSendError("Mail envoye, mais ticket Discord impossible a creer.");
        setOrderSent(true);
        return;
      }

      setOrderSent(true);

      if (paymentMethod === "discord") {
        setTimeout(() => {
          window.open("https://discord.gg/vg9X5n6gyh", "_blank");
        }, 900);
      }
    } catch (err) {
      console.error(err);
      setSendError("Erreur lors de l'envoi.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030714] px-4 py-8 text-white md:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,212,255,0.10),transparent_25%),radial-gradient(circle_at_85%_25%,rgba(168,85,247,0.12),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(139,92,246,0.10),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_20%,transparent_80%,rgba(255,255,255,0.02))]" />

      <div className="relative z-10 mx-auto mb-10 flex max-w-7xl items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-white/60 transition hover:text-white"
        >
          <ArrowLeft size={18} /> Retour
        </Link>

        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-cyan-300 md:text-xs">
          <Sparkles size={14} /> Checkout securise
        </div>
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 xl:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(7,15,44,0.95),rgba(7,10,34,0.88))] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_20px_60px_rgba(0,0,0,0.45)] md:p-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,238,255,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_30%)]" />

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-xs text-cyan-300">
              <ShieldCheck size={14} />
              Paiement encadre
            </div>

            <h1 className="mb-8 text-4xl font-black leading-none tracking-tight md:text-5xl">
              Finaliser ta commande
            </h1>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {packs.map((pack) => {
                const isActive = selectedPack === pack.name;

                return (
                  <button
                    key={pack.name}
                    onClick={() => setSelectedPack(pack.name)}
                    className={`relative overflow-hidden rounded-[22px] border p-5 text-left transition-all duration-300 ${
                      isActive
                        ? "border-cyan-400 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_0_32px_rgba(34,211,238,0.14)]"
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                    }`}
                  >
                    {pack.popular && (
                      <div className="absolute right-3 top-3 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/15 px-2 py-1 text-[10px] font-semibold text-fuchsia-300">
                        Populaire
                      </div>
                    )}

                    <div className="mb-1 text-2xl font-bold">{pack.name}</div>
                    <div className="mb-2 text-2xl font-semibold text-cyan-300">
                      {pack.price}
                    </div>
                    <div className="mb-4 text-xs text-white/50">{pack.delay}</div>

                    <ul className="space-y-2 text-sm text-white/75">
                      {pack.features.slice(0, 3).map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="shrink-0 text-cyan-300" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            <div className="relative mb-4">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                size={18}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ton email"
                className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-12 pr-4 text-white outline-none transition placeholder:text-white/40 focus:border-cyan-400/50 focus:bg-cyan-400/[0.03]"
              />
            </div>

            <div className="mb-6 flex h-14 items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4">
              <span className="font-medium tracking-wide">{orderRef}</span>

              <button
                onClick={copyRef}
                className="flex items-center gap-2 text-cyan-300 transition hover:text-cyan-200"
              >
                <Copy size={16} />
                <span className="text-sm">{copied ? "Copie" : ""}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setPaymentMethod("paypal")}
                className={`relative overflow-hidden rounded-[22px] border p-6 transition-all duration-300 ${
                  paymentMethod === "paypal"
                    ? "border-fuchsia-400 bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 shadow-[0_0_0_1px_rgba(232,121,249,0.12),0_0_40px_rgba(217,70,239,0.18)]"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                }`}
              >
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <Wallet className="h-7 w-7 text-cyan-300" />
                  <span className="text-xl font-semibold">PayPal</span>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod("card")}
                className={`relative overflow-hidden rounded-[22px] border p-6 transition-all duration-300 ${
                  paymentMethod === "card"
                    ? "border-green-400 bg-green-500/20 shadow-[0_0_0_1px_rgba(34,197,94,0.2),0_0_40px_rgba(34,197,94,0.2)]"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                }`}
              >
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <span className="text-2xl">💳</span>
                  <span className="text-xl font-semibold">Carte</span>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod("discord")}
                className={`relative overflow-hidden rounded-[22px] border p-6 transition-all duration-300 ${
                  paymentMethod === "discord"
                    ? "border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_0_40px_rgba(34,211,238,0.18)]"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                }`}
              >
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <MessageCircle className="h-7 w-7 text-cyan-300" />
                  <span className="text-xl font-semibold">Discord</span>
                </div>
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
          className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(7,15,44,0.95),rgba(7,10,34,0.88))] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] md:p-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.10),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(0,238,255,0.06),transparent_25%)]" />

          <div className="relative">
            <h2 className="mb-7 text-3xl font-black tracking-tight md:text-4xl">
              Resume de la commande
            </h2>

            <div className="mb-7 space-y-4">
              <div className="flex h-14 items-center rounded-2xl border border-white/8 bg-[linear-gradient(90deg,rgba(255,255,255,0.04),rgba(168,85,247,0.08))] px-5">
                {selectedPlan.price}
              </div>

              <div className="flex h-14 items-center rounded-2xl border border-white/8 bg-[linear-gradient(90deg,rgba(255,255,255,0.04),rgba(168,85,247,0.08))] px-5">
                {email || "Email"}
              </div>

              <div className="flex h-14 items-center rounded-2xl border border-white/8 bg-[linear-gradient(90deg,rgba(255,255,255,0.04),rgba(168,85,247,0.08))] px-5">
                {orderRef}
              </div>
            </div>

            {paymentMethod === "paypal" && (
              <div className="mb-7 space-y-3">
                <div className={stepCard}>1. Clique sur "Ouvrir PayPal"</div>
                <div className={stepCard}>2. Connecte toi a ton compte PayPal</div>
                <div className={stepCard}>3. Envoie le paiement</div>
                <div className={stepCard}>4. Reviens ici</div>
                <div className={stepCard}>5. Clique sur "J'ai paye"</div>
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="mb-7 space-y-3">
                <div className={stepCard}>
                  <span className="font-semibold text-cyan-300">1.</span> Clique sur{" "}
                  <span className="font-semibold">"Payer par carte"</span>
                </div>

                <div className={stepCard}>
                  <span className="font-semibold text-cyan-300">2.</span> Une page Stripe securisee va s'ouvrir
                </div>

                <div className={stepCard}>
                  <span className="font-semibold text-cyan-300">3.</span> Entre les informations de ta carte
                </div>

                <div className={stepCard}>
                  <span className="font-semibold text-cyan-300">4.</span> Confirme le paiement
                </div>

                <div className={stepCard}>
                  <span className="font-semibold text-cyan-300">5.</span> Tu seras redirige automatiquement
                </div>
              </div>
            )}

            {paymentMethod === "discord" && (
              <div className="mb-7 space-y-3">
                <div className={stepCard}>1. Clique sur "Ouvrir Discord"</div>
                <div className={stepCard}>2. Accepte le reglement du serveur</div>
                <div className={stepCard}>3. Ouvre un ticket</div>
                <div className={stepCard}>4. Envoie ta reference :</div>

                <div className="rounded-2xl border border-cyan-400/15 bg-black/25 px-4 py-4 font-medium tracking-wide text-cyan-300">
                  {orderRef}
                </div>

                <div className={stepCard}>5. Un membre du staff finalisera la commande</div>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {paymentMethod === "discord" ? (
                <a
                  href="https://discord.gg/vg9X5n6gyh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex h-16 items-center justify-center gap-3 overflow-hidden rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-[1.01]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-600" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.22),transparent_25%),radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.18),transparent_25%)] opacity-40 transition group-hover:opacity-70" />
                  <div className="relative z-10 flex items-center gap-3">
                    <MessageCircle className="h-5 w-5" />
                    Ouvrir Discord
                  </div>
                </a>
              ) : paymentMethod === "card" ? (
                <button
                  onClick={sendOrder}
                  className="group relative flex h-16 items-center justify-center gap-3 overflow-hidden rounded-2xl text-lg font-semibold transition hover:scale-[1.01]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500" />
                  <div className="relative z-10">Payer par carte</div>
                </button>
              ) : (
                <a
                  href="https://paypal.me/Tomprs237"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex h-16 items-center justify-center gap-3 overflow-hidden rounded-2xl text-lg font-semibold transition hover:scale-[1.01]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-sky-300 to-fuchsia-500" />
                  <div className="relative z-10">Ouvrir PayPal</div>
                </a>
              )}

              <p className="text-center text-sm text-white/45">
                Envoie la preuve de paiement dans un ticket Discord
              </p>

              <button
                onClick={sendOrder}
                disabled={isSending}
                className="h-16 rounded-2xl border border-white/10 bg-white/[0.02] text-lg font-semibold transition hover:bg-white/[0.05] disabled:opacity-50"
              >
                {isSending ? "Envoi..." : "J'ai paye"}
              </button>
            </div>

            {sendError && (
              <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-red-300">
                {sendError}
              </div>
            )}

            {orderSent && (
              <div className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-4 text-sm text-cyan-100">
                Commande envoyee.
                <br />
                Continue sur Discord avec ta capture ou les infos de paiement.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
