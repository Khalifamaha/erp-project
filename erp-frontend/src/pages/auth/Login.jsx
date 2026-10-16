import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { BadgeCheck, Mail, UserRound } from "lucide-react";
import { login, loginEmploye } from "@/api/auth";
import { persistAuthSession, getAuthErrorMessage } from "@/lib/authSession";
import { MODULES } from "@/lib/modules";

const MODES = {
  employe: {
    id: "employe",
    label: "Employé",
    subtitle: "Connexion avec votre matricule",
    icon: UserRound,
    module: MODULES.rh,
  },
  admin: {
    id: "admin",
    label: "Administration",
    subtitle: "Connexion avec votre email professionnel",
    icon: Mail,
    module: MODULES.commercial,
  },
};

function LoginForm({ mode, onSubmit, loading }) {
  const isEmploye = mode === "employe";
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isEmploye ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Matricule
          </label>
          <input
            type="text"
            autoComplete="username"
            placeholder="Ex. EMP004"
            {...register("matricule", {
              required: "Le matricule est requis",
              setValueAs: (v) => (typeof v === "string" ? v.trim() : v),
            })}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm uppercase tracking-wide outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          {errors.matricule && (
            <p className="mt-1 text-xs text-rose-500">
              {errors.matricule.message}
            </p>
          )}
        </div>
      ) : (
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            {...register("email", { required: "Ce champ est requis" })}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-rose-500">
              {errors.email.message}
            </p>
          )}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">
          Mot de passe
        </label>
        <input
          type="password"
          autoComplete="current-password"
          {...register("password", { required: "Ce champ est requis" })}
          className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-rose-500">
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg py-2.5 text-sm font-medium text-white disabled:opacity-50"
        style={{
          background: `linear-gradient(135deg, ${MODES[mode].module.from}, ${MODES[mode].module.to})`,
        }}
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("employe");
  const [loading, setLoading] = useState(false);
  const active = MODES[mode];

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const data =
        mode === "employe"
          ? await loginEmploye(values)
          : await login(values);

      persistAuthSession(data);

      if (data.employe) {
        toast.success(`Bienvenue, ${data.employe.nom_complet}`);
      } else {
        toast.success("Connexion réussie");
      }
      navigate("/");
    } catch (err) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
        <div
          className="px-8 py-6 text-white"
          style={{
            background: `linear-gradient(135deg, ${active.module.from}, ${active.module.to})`,
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 font-display text-lg font-bold">
              W
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold">ERP</h1>
              <p className="text-sm text-white/85">{active.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="border-b border-ink-100 p-2">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-canvas p-1">
            {Object.values(MODES).map((m) => {
              const Icon = m.icon;
              const selected = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={
                    "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
                    (selected
                      ? "bg-white text-ink-900 shadow-sm"
                      : "text-ink-500 hover:text-ink-800")
                  }
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 p-8">
          {mode === "employe" && (
            <div
              className="flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs leading-relaxed"
              style={{
                backgroundColor: MODULES.rh.soft,
                color: MODULES.rh.text,
              }}
            >
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Saisissez le matricule figurant sur votre badge (ex.{" "}
                <strong>EMP004</strong>) et le mot de passe de votre compte.
              </span>
            </div>
          )}

          <LoginForm
            key={mode}
            mode={mode}
            onSubmit={handleLogin}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
