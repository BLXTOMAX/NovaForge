import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle, ArrowLeft, Sparkles, Copy, Check } from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

function AmbientGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[10%] top-[10%] h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="absolute right-[10%] top-[18%] h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl" />
      <div className="absolute bottom-[8%] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />
    </div>
  );
}

export default function ConfirmationPage() {
  const location = useLocation();
  const [pack, setPack] = useState("...");
  const [email, setEmail] = useState("...");
  const [ref, setRef] = useState("...");
  const [method, setMethod] = useState("card");
  const [sendError, setSendError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function syncOrder() {
      try {
        const sessionId = new URLSearchParams(location.search).get("session_id");
        const raw = localStorage.getItem("nf_order");
        const fallbackOrder = raw
          ? JSON.parse(raw)
          : {
              pack: "...",
              email: "...",
              ref: "...",
              method: "card",
            };

        let order = {
          pack: fallbackOrder.pack || "...",
          email: fallbackOrder.email || "...",
          ref: fallbackOrder.ref || "...",
          method: fallbackOrder.method || "card",
        };

        if (sessionId) {
          const sessionResponse = await fetch(`${apiUrl}/session/${sessionId}`, {
            signal: controller.signal,
          });

          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            order = {
              pack: sessionData.pack || order.pack,
              email: sessionData.email || order.email,
              ref: sessionData.ref || order.ref,
              method: "card",
            };

            localStorage.setItem("nf_order", JSON.stringify(order));
          }
        }

        if (
          (!sessionId && !raw) ||
          !order.pack ||
          !order.ref ||
          order.pack === "..." ||
          order.ref === "..."
        ) {
          setSendError("Commande introuvable pour le suivi.");
          return;
        }

        setPack(order.pack);
        setEmail(order.email);
        setRef(order.ref);
        setMethod(order.method);

        const sentKey = `nf_order_sent_${order.ref}`;
        if (localStorage.getItem(sentKey)) {
          setEmailSent(true);
          return;
        }

        const response = await fetch(`${apiUrl}/order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(order),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Le serveur n'a pas pu enregistrer la commande.");
        }

        localStorage.setItem(sentKey, "true");
        localStorage.removeItem("nf_order_sent");
        setEmailSent(true);
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }

        console.error("Erreur envoi commande :", err);
        setSendError(err.message || "Impossible d'enregistrer la commande.");
      }
    }

    syncOrder();

    return () => {
      controller.abort();
    };
  }, [location.search]);

  const copyReference = async () => {
    if (!ref || ref === "...") {
      return;
    }

    try {
      await navigator.clipboard.writeText(ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="relative min-h-screen">
        <AmbientGlow />

        <div className="relative z-10 mx-auto max-w-4xl px-6 py-10 lg:px-8">
          <div className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au site
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-cyan-300">
              <Sparkles className="h-4 w-4" />
              Commande confirmée
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl md:p-10"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.8rem] bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 shadow-[0_0_40px_rgba(168,85,247,0.35)]">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>

            <div className="text-center">
              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Commande envoyée avec succès
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
                Ta demande a bien été enregistrée. Il ne te reste plus qu'à suivre les
                étapes ci-dessous pour finaliser le paiement et lancer le projet.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/45">Pack</div>
                <div className="mt-2 text-lg font-semibold text-white">{pack}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/45">Email</div>
                <div className="mt-2 truncate text-sm font-semibold text-white">{email}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/45">Référence</div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-fuchsia-300">{ref}</div>
                  <button
                    type="button"
                    onClick={copyReference}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
                  >
                    {copied ? <Check className="h-4 w-4 text-cyan-300" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copie" : "Copier"}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/45">Paiement</div>
                <div className="mt-2 text-sm font-semibold text-cyan-300">
                  {method === "discord"
                    ? "Discord / Virement"
                    : method === "card"
                      ? "Carte bancaire"
                      : "PayPal"}
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-cyan-400/15 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-fuchsia-500/10 p-6">
              <div className="mb-3 text-sm font-semibold text-white">Étapes suivantes</div>
              <div className="space-y-3 text-sm leading-7 text-white/75">
                <div>1. Ton paiement a bien été validé.</div>
                <div>
                  2. Garde la référence de commande :{" "}
                  <span className="font-semibold text-fuchsia-300">{ref}</span>
                </div>
                <div>
                  3. {emailSent
                    ? "La commande a bien ete enregistree."
                    : "Si besoin, ouvre un ticket Discord avec ta reference."}
                </div>
                <div>4. Nous pouvons retrouver rapidement ta commande avec cette référence.</div>
              </div>
            </div>

            {sendError && (
              <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {sendError}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="https://discord.com/channels/1461025038231670828/1484300903010799777"
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-fuchsia-500/20 transition hover:scale-[1.02]"
              >
                Ouvrir le ticket Discord
                <MessageCircle className="h-4 w-4" />
              </a>

              <Link
                to="/checkout"
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white/85 transition hover:bg-white/10"
              >
                Retour au checkout
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}




