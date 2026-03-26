import "dotenv/config";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import Stripe from "stripe";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "dist");
const port = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const emailUser = process.env.EMAIL_USER?.trim() || "";
const emailPass = process.env.EMAIL_PASS?.replace(/\s+/g, "") || "";
const smtpHost = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpSecure =
  process.env.SMTP_SECURE != null
    ? process.env.SMTP_SECURE === "true"
    : smtpPort === 465;

/* ================= EMAIL ================= */

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

transporter.verify().then(
  () => console.log(`SMTP ready (${smtpHost}:${smtpPort})`),
  (error) => console.error("SMTP verify error:", error)
);

/* ================= DISCORD ================= */

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK;
const DISCORD_NOTIFY_USER_ID = "1055134531549671474";

/* ================= PRIX ================= */

const PRICES = {
  Starter: 9900,
  Pro: 19900,
};

const PRODUCT_DESCRIPTIONS = {
  Starter: "1 page moderne | Responsive | Animations legeres | Livraison 2 a 4 jours",
  Pro: "Jusqu'a 5 pages | Design premium | Animations avancees | Livraison 3 a 5 jours",
  Ultra: "Sur devis | Branding complet | Effets premium | Accompagnement dedie",
};

/* ================= STRIPE ================= */

app.post("/create-checkout-session", async (req, res) => {
  const { pack, email, ref } = req.body;
  const clientUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get("host")}`;

  try {
    if (!pack || !PRICES[pack]) {
      return res.status(400).json({ error: "Pack invalide" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `NovaForge ${pack}`,
              description: PRODUCT_DESCRIPTIONS[pack] || "Commande NovaForge",
            },
            unit_amount: PRICES[pack],
          },
          quantity: 1,
        },
      ],
      ...(email ? { customer_email: email } : {}),
      metadata: {
        ref,
        pack,
      },
      success_url: `${clientUrl}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/checkout`,
    });

    console.log("SESSION URL =", session.url);
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Stripe error" });
  }
});

/* ================= TEST MAIL ================= */

app.get("/test-mail", async (req, res) => {
  try {
    console.log("Test mail ->", emailUser);

    await transporter.sendMail({
      from: `"NovaForge" <${emailUser}>`,
      to: emailUser,
      subject: "Test mail NovaForge",
      html: `
        <div style="font-family:Arial,sans-serif;background:#0b1020;padding:32px;color:#ffffff;">
          <div style="max-width:600px;margin:0 auto;background:#12182b;border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:32px;">
            <h1 style="margin-top:0;font-size:28px;">Test email ✅</h1>
            <p style="color:#cbd5e1;line-height:1.7;">
              Si tu reçois ce message, le système d'email fonctionne.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Mail de test envoyé");
    res.send("Mail de test envoyé");
  } catch (err) {
    console.error("Mail test error:", err);
    res.status(500).send(`Erreur mail test: ${err.message}`);
  }
});

/* ================= COMMANDE ================= */

app.post("/order", async (req, res) => {
  const { pack, email, ref, method } = req.body;

  try {
    if (!pack || !ref) {
      return res.status(400).json({ error: "Données commande manquantes" });
    }

    if (WEBHOOK_URL) {
      const paymentLabel =
        method === "card"
          ? "Carte bancaire"
          : method === "discord"
            ? "Discord"
            : method === "paypal"
              ? "PayPal"
              : method || "Non renseignÃ©";

      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `<@${DISCORD_NOTIFY_USER_ID}>`,
          allowed_mentions: {
            users: [DISCORD_NOTIFY_USER_ID],
          },
          embeds: [
            {
              title: "🚀 Nouvelle commande",
              description:
                "Une nouvelle commande vient d'Ãªtre validÃ©e. Voici les informations importantes.",
              color: 0x8b5cf6,
              fields: [
                { name: "Pack", value: `\`${pack}\``, inline: true },
                { name: "Paiement", value: `\`${paymentLabel}\``, inline: true },
                { name: "Statut", value: "`Paiement reÃ§u`", inline: true },
                { name: "Email", value: email || "Non renseigné" },
                { name: "Référence", value: ref },
              ],
              footer: {
                text: "NovaForge • Notification automatique",
              },
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });
    }

    if (email && email !== "Non renseigné" && email !== "...") {
      console.log("Envoi mail confirmation à :", email);

      await transporter.sendMail({
        from: `"NovaForge" <${emailUser}>`,
        to: email,
        subject: `Confirmation de commande ${ref} - NovaForge`,
        html: `
          <div style="margin:0;padding:0;background:#0b1020;">
            <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
              Ta commande NovaForge est confirmée. Référence : ${ref}
            </div>

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0b1020;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;">
              <tr>
                <td align="center" style="padding:32px 16px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#12182b;border:1px solid rgba(255,255,255,0.08);border-radius:24px;overflow:hidden;">
                    <tr>
                      <td style="padding:28px 32px;background:linear-gradient(135deg,#0f172a 0%,#111827 60%,#1f1147 100%);border-bottom:1px solid rgba(255,255,255,0.06);">
                        <table role="presentation" width="100%">
                          <tr>
                            <td align="left" style="color:#ffffff;font-size:24px;font-weight:800;">
                              NovaForge
                            </td>
                            <td align="right">
                              <span style="display:inline-block;padding:10px 16px;border-radius:999px;background:rgba(34,211,238,0.10);border:1px solid rgba(34,211,238,0.25);color:#67e8f9;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
                                Confirmée
                              </span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:36px 32px 20px 32px;text-align:center;">
                        <div style="width:72px;height:72px;line-height:72px;margin:0 auto 20px auto;border-radius:22px;background:linear-gradient(135deg,#22d3ee 0%,#8b5cf6 55%,#d946ef 100%);color:#ffffff;font-size:34px;font-weight:700;">
                          ✓
                        </div>

                        <h1 style="margin:0 0 14px 0;color:#ffffff;font-size:34px;line-height:1.15;font-weight:900;">
                          Commande confirmée
                        </h1>

                        <p style="margin:0;color:#cbd5e1;font-size:16px;line-height:1.7;">
                          Merci pour ta commande chez <strong style="color:#ffffff;">NovaForge</strong>.<br>
                          Ton paiement a bien été validé et ton projet peut maintenant être pris en charge.
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:8px 32px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                          <tr>
                            <td style="padding:10px;">
                              <div style="border:1px solid rgba(255,255,255,0.08);background:#0b1226;border-radius:18px;padding:18px;">
                                <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;margin-bottom:10px;">Pack</div>
                                <div style="font-size:22px;font-weight:800;color:#ffffff;">${pack}</div>
                              </div>
                            </td>
                            <td style="padding:10px;">
                              <div style="border:1px solid rgba(255,255,255,0.08);background:#0b1226;border-radius:18px;padding:18px;">
                                <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;margin-bottom:10px;">Paiement</div>
                                <div style="font-size:22px;font-weight:800;color:#67e8f9;">${method || "card"}</div>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:8px 32px;">
                        <div style="border:1px solid rgba(217,70,239,0.20);background:linear-gradient(90deg,rgba(34,211,238,0.08),rgba(139,92,246,0.08),rgba(217,70,239,0.08));border-radius:20px;padding:22px;">
                          <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#cbd5e1;margin-bottom:10px;">
                            Référence de commande
                          </div>
                          <div style="font-size:28px;line-height:1.2;font-weight:900;color:#f0abfc;">
                            ${ref}
                          </div>
                          <div style="margin-top:10px;font-size:14px;color:#cbd5e1;line-height:1.6;">
                            Garde bien cette référence. Elle permet de retrouver rapidement ta commande.
                          </div>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:8px 32px;">
                        <div style="border:1px solid rgba(255,255,255,0.08);background:#0b1226;border-radius:20px;padding:22px;">
                          <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#94a3b8;margin-bottom:14px;">
                            Détails client
                          </div>
                          <div style="font-size:15px;color:#e2e8f0;line-height:1.9;">
                            <strong style="color:#ffffff;">Email :</strong> ${email}<br>
                            <strong style="color:#ffffff;">Statut :</strong> Paiement validé<br>
                            <strong style="color:#ffffff;">Projet :</strong> En attente de prise en charge
                          </div>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:18px 32px 8px 32px;">
                        <div style="font-size:18px;font-weight:800;color:#ffffff;margin-bottom:12px;">
                          Étapes suivantes
                        </div>
                        <div style="color:#cbd5e1;font-size:15px;line-height:1.9;">
                          1. Garde ta référence <strong style="color:#f0abfc;">${ref}</strong><br>
                          2. Ouvre un ticket Discord si nécessaire<br>
                          3. Nous pourrons retrouver ta commande rapidement<br>
                          4. Le projet sera pris en charge selon le pack choisi
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td align="center" style="padding:28px 32px 14px 32px;">
                        <a href="https://discord.com/channels/1461025038231670828/1484300903010799777" style="display:inline-block;background:linear-gradient(90deg,#22d3ee 0%,#8b5cf6 50%,#d946ef 100%);color:#ffffff;text-decoration:none;font-weight:800;font-size:15px;padding:16px 26px;border-radius:16px;">
                          Ouvrir le ticket Discord
                        </a>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:10px 32px 34px 32px;text-align:center;color:#94a3b8;font-size:13px;line-height:1.8;">
                        Cet email a été envoyé automatiquement par NovaForge.<br>
                        Si tu as une question, réponds avec ta référence : <strong style="color:#e9d5ff;">${ref}</strong>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </div>
        `,
      });

      console.log("Mail confirmation envoyé");
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ error: "fail" });
  }
});

/* ================= SUPPORT ================= */

app.post("/support", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await transporter.sendMail({
      from: `"NovaForge" <${emailUser}>`,
      to: emailUser,
      subject: "Support NovaForge",
      html: `
        <h3>Nouveau message</h3>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Message :</strong></p>
        <p>${message}</p>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Support error:", err);
    res.status(500).json({ error: "fail" });
  }
});

/* ================= SESSION STRIPE ================= */

app.get("/session/:id", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.id);

    res.json({
      pack: session.metadata?.pack || "Pack",
      ref: session.metadata?.ref || "NF-XXXXXX",
      email: session.customer_email || "Non renseigné",
    });
  } catch (err) {
    console.error("Session error:", err);
    res.status(500).json({ error: "session error" });
  }
});
app.get("/ping-test-123", (req, res) => {
  res.send("PING OK 123");
});

if (existsSync(distPath)) {
  app.use(express.static(distPath));

  app.use((req, res, next) => {
    if (req.method !== "GET") {
      next();
      return;
    }

    res.sendFile(path.join(distPath, "index.html"));
  });
}

console.log("SERVER FILE OK");

app.listen(port, () => {
  console.log("Server running on " + port);
});

