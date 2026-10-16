import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { User, Lock, Users, Shield } from "lucide-react";
import client from "@/api/client";
import PageHeader from "@/components/common/PageHeader";

async function getMe() {
  const { data } = await client.get("/auth/me/");
  return data;
}
async function updateMe(payload) {
  const { data } = await client.patch("/users/me/update/", payload);
  return data;
}
async function changePassword(payload) {
  const { data } = await client.post("/auth/change-password/", payload);
  return data;
}
async function getUsers() {
  const { data } = await client.get("/users/", { params: { page_size: 100 } });
  return data?.results ?? data ?? [];
}
async function getRoles() {
  const { data } = await client.get("/roles/", { params: { page_size: 100 } });
  return data?.results ?? data ?? [];
}

const TABS = [
  { id: "profil", label: "Mon profil", icon: User },
  { id: "securite", label: "Sécurité", icon: Lock },
  { id: "utilisateurs", label: "Utilisateurs", icon: Users },
  { id: "roles", label: "Rôles", icon: Shield },
];

function ProfilTab() {
  const queryClient = useQueryClient();
  const { data: me, isLoading } = useQuery({
    queryKey: ["settings", "me"],
    queryFn: getMe,
  });
  const updateMut = useMutation({
    mutationFn: updateMe,
    onSuccess: (data) => {
      // garder le localStorage synchronisé avec le Topbar
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...stored, ...data })
      );
      queryClient.invalidateQueries({ queryKey: ["settings", "me"] });
      toast.success("Profil mis à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    if (me) reset(me);
  }, [me, reset]);

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-ink-500">Chargement...</div>;
  }

  return (
    <form
      onSubmit={handleSubmit((values) => updateMut.mutate(values))}
      className="max-w-xl space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Prénom</label>
          <input
            {...register("prenom")}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Nom</label>
          <input
            {...register("nom")}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Téléphone</label>
          <input
            {...register("telephone")}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Langue</label>
          <select
            {...register("langue")}
            className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">Email</label>
        <input
          value={me?.email || ""}
          disabled
          className="w-full rounded-lg border border-ink-200 bg-ink-100/40 px-3 py-2 text-sm text-ink-500"
        />
        <p className="mt-1 text-xs text-ink-500">L'email ne peut pas être modifié ici.</p>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
      >
        Enregistrer
      </button>
    </form>
  );
}

function SecuriteTab() {
  const changePasswordMut = useMutation({ mutationFn: changePassword });
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    try {
      await changePasswordMut.mutateAsync(values);
      toast.success("Mot de passe modifié");
      reset();
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        typeof data === "object"
          ? Object.values(data).flat().join(" — ")
          : "Une erreur est survenue";
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">
          Ancien mot de passe *
        </label>
        <input
          type="password"
          {...register("ancien_mot_de_passe", { required: "Requis" })}
          className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        {errors.ancien_mot_de_passe && (
          <p className="mt-1 text-xs text-rose-500">{errors.ancien_mot_de_passe.message}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">
          Nouveau mot de passe *
        </label>
        <input
          type="password"
          {...register("nouveau_mot_de_passe", {
            required: "Requis",
            minLength: { value: 8, message: "8 caractères minimum" },
          })}
          className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        {errors.nouveau_mot_de_passe && (
          <p className="mt-1 text-xs text-rose-500">{errors.nouveau_mot_de_passe.message}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">
          Confirmation *
        </label>
        <input
          type="password"
          {...register("confirmation", { required: "Requis" })}
          className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        {errors.confirmation && (
          <p className="mt-1 text-xs text-rose-500">{errors.confirmation.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
      >
        Modifier le mot de passe
      </button>
    </form>
  );
}

function UtilisateursTab() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["settings", "users"],
    queryFn: getUsers,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-ink-500">Chargement...</div>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
      {!users || users.length === 0 ? (
        <div className="p-8 text-center text-sm text-ink-500">Aucun utilisateur.</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-100/40 text-left text-ink-700">
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-ink-100 last:border-0">
                <td className="px-4 py-3 font-medium text-ink-900">
                  {u.nom_complet || `${u.prenom} ${u.nom}`}
                </td>
                <td className="px-4 py-3 text-ink-700">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      u.is_active
                        ? "bg-emerald-400/15 text-emerald-600"
                        : "bg-ink-100 text-ink-700"
                    }`}
                  >
                    {u.is_active ? "Actif" : "Inactif"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function RolesTab() {
  const { data: roles, isLoading } = useQuery({
    queryKey: ["settings", "roles"],
    queryFn: getRoles,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-ink-500">Chargement...</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {(!roles || roles.length === 0) && (
        <p className="col-span-3 p-8 text-center text-sm text-ink-500">
          Aucun rôle défini.
        </p>
      )}
      {(roles || []).map((r) => (
        <div key={r.id} className="rounded-xl border border-ink-100 bg-white p-4">
          <p className="font-medium text-ink-900">{r.nom}</p>
          <p className="text-xs text-ink-500">{r.niveau}</p>
        </div>
      ))}
    </div>
  );
}

export default function Settings() {
  const [tab, setTab] = useState("profil");

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Paramètres" />

      <div className="flex gap-2 border-b border-ink-100">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
              tab === t.id
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-ink-500 hover:text-ink-900"
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profil" && <ProfilTab />}
      {tab === "securite" && <SecuriteTab />}
      {tab === "utilisateurs" && <UtilisateursTab />}
      {tab === "roles" && <RolesTab />}
    </div>
  );
}