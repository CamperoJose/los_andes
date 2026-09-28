"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Briefcase, CheckCircle, GraduationCap, MapPin, PaperPlaneTilt, Sparkle, User, X } from "@phosphor-icons/react";

type Job = {
  id: string;
  title: string;
  area: string;
  modality: string;
  location: string;
  description: string;
  detail: string;
  tags: string[];
};

type ApiJob = {
  oportunidad_id: string;
  titulo: string;
  area?: string;
  modalidad?: string;
  ubicacion?: string;
  descripcion_corta?: string;
  descripcion_detalle?: string;
  requisitos?: string;
};

const profileFeatures = [
  { icon: User, title: "Datos personales", text: "Información básica para poder contactarte." },
  { icon: GraduationCap, title: "Formación", text: "Cuéntanos qué estudiaste y dónde." },
  { icon: Briefcase, title: "Experiencia", text: "Describe tu experiencia profesional más relevante." },
];

const emptyForm = { nombres: "", apellidos: "", email: "", telefono: "", ciudad: "", genero: "", fecha_nacimiento: "", educacion: "", experiencia: "" };

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadJobs() {
      try {
        setLoadingJobs(true);
        const response = await fetch("/api/oportunidades", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.message || "No se pudieron cargar las oportunidades");
        const mapped = (payload.data as ApiJob[]).map((item) => ({
          id: item.oportunidad_id,
          title: item.titulo,
          area: item.area || "",
          modality: item.modalidad || "",
          location: item.ubicacion || "",
          description: item.descripcion_corta || "",
          detail: item.descripcion_detalle || "",
          tags: String(item.requisitos || "").split(";").map((tag) => tag.trim()).filter(Boolean),
        }));
        if (active) setJobs(mapped);
      } catch (error) {
        if (active) setJobsError(error instanceof Error ? error.message : "No se pudieron cargar las oportunidades");
      } finally {
        if (active) setLoadingJobs(false);
      }
    }
    loadJobs();
    return () => { active = false; };
  }, []);

  const selectedTitle = useMemo(() => selectedJob?.title ?? "Selecciona un cargo", [selectedJob]);

  function openApplication(job: Job) {
    setSelectedJob(job);
    setSubmitted(false);
    setSubmitError("");
    setForm(emptyForm);
    window.setTimeout(() => document.getElementById("postulacion")?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitApplication(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedJob || submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/postulaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oportunidad_id: selectedJob.id, ...form }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || "No se pudo registrar la postulación");
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No se pudo registrar la postulación");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen">
      <section className="hero-grid relative overflow-hidden bg-[#101a34] text-white">
        <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-8 lg:px-8 lg:pb-28">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15"><Briefcase size={21} weight="duotone" /></div><span className="font-semibold tracking-tight">Oportunidades</span></div>
            <div className="flex items-center gap-2"><a href="/home" className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">Inicio</a><a href="/admin" className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">Administración</a></div>
          </nav>
          <div className="max-w-3xl pt-20 lg:pt-24">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm text-blue-100"><Sparkle size={16} weight="fill" />Estamos buscando talento</div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">Encuentra el próximo desafío de tu carrera.</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">Conoce nuestras oportunidades, elige el cargo que más se ajuste a tu perfil y déjanos tus datos para conocerte.</p>
            <a href="#vacantes" className="mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-[#101a34] shadow-lg transition hover:-translate-y-0.5">Explorar oportunidades <ArrowRight size={19} weight="bold" /></a>
          </div>
        </div>
      </section>

      <section id="vacantes" className="mx-auto max-w-6xl scroll-mt-8 px-6 py-20 lg:px-8">
        <div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">Vacantes abiertas</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Elige tu oportunidad</h2><p className="mt-3 text-slate-600">Revisa los cargos disponibles y selecciona uno para iniciar tu postulación.</p></div>
        {loadingJobs && <div className="mt-10 grid gap-5 md:grid-cols-2">{[1,2].map((n) => <div key={n} className="h-72 animate-pulse rounded-2xl bg-slate-100" />)}</div>}
        {!loadingJobs && jobsError && <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{jobsError}</div>}
        {!loadingJobs && !jobsError && jobs.length === 0 && <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">Actualmente no hay vacantes abiertas.</div>}
        {!loadingJobs && !jobsError && <div className="mt-10 grid gap-5 md:grid-cols-2">{jobs.map((job) => (
          <article key={job.id} className="card-hover soft-shadow rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-start justify-between gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-[var(--primary)]"><Briefcase size={22} weight="duotone" /></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Abierto</span></div>
            <h3 className="mt-5 text-xl font-semibold">{job.title}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{job.description}</p>
            {job.detail && <p className="mt-3 text-sm leading-6 text-slate-500">{job.detail}</p>}
            <div className="mt-5 flex flex-wrap gap-2">{job.tags.map((tag) => <span key={tag} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{tag}</span>)}</div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-5 text-sm text-slate-500"><span className="inline-flex items-center gap-1.5"><MapPin size={16} />{job.location}</span><span className="inline-flex items-center gap-1.5"><Briefcase size={16} />{job.modality}</span></div>
            <button type="button" onClick={() => openApplication(job)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110">Postularme a este cargo <ArrowRight size={18} weight="bold" /></button>
          </article>
        ))}</div>}
      </section>

      <section id="postulacion" className="scroll-mt-8 border-t border-slate-200 bg-white"><div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div><p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">Tu perfil</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Cuéntanos sobre ti</h2><p className="mt-4 leading-7 text-slate-600">Completa tus datos y comparte tu experiencia profesional. Tu postulación será registrada para que el equipo pueda revisarla.</p><div className="mt-8 space-y-4">{profileFeatures.map(({ icon: ItemIcon, title, text }) => <div key={title} className="flex gap-3"><div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-[var(--primary)]"><ItemIcon size={18} weight="duotone" /></div><div><p className="font-semibold">{title}</p><p className="mt-0.5 text-sm leading-5 text-slate-500">{text}</p></div></div>)}</div></div>
        <div className="soft-shadow rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8">{submitted ? (
          <div className="flex min-h-[430px] flex-col items-center justify-center text-center"><div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle size={34} weight="fill" /></div><h3 className="mt-5 text-2xl font-semibold">¡Postulación enviada!</h3><p className="mt-3 max-w-md leading-6 text-slate-600">Registramos correctamente tu postulación para <strong>{selectedTitle}</strong>.</p><button type="button" onClick={() => { setSubmitted(false); setSelectedJob(null); setForm(emptyForm); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="mt-7 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-slate-50">Volver a las oportunidades</button></div>
        ) : <><div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cargo seleccionado</p><h3 className="mt-1 text-lg font-semibold">{selectedTitle}</h3></div>{selectedJob && <button type="button" aria-label="Quitar cargo seleccionado" onClick={() => setSelectedJob(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700"><X size={20} /></button>}</div>
          <form onSubmit={submitApplication} className="mt-6 space-y-5"><div className="grid gap-5 sm:grid-cols-2"><Field label="Nombres" required value={form.nombres} onChange={(v) => updateField("nombres", v)} /><Field label="Apellidos" required value={form.apellidos} onChange={(v) => updateField("apellidos", v)} /></div><div className="grid gap-5 sm:grid-cols-2"><Field label="Correo electrónico" type="email" required value={form.email} onChange={(v) => updateField("email", v)} /><Field label="Teléfono" value={form.telefono} onChange={(v) => updateField("telefono", v)} /></div><Field label="Ciudad de residencia" value={form.ciudad} onChange={(v) => updateField("ciudad", v)} /><div className="grid gap-5 sm:grid-cols-2"><div><label className="mb-2 block text-sm font-medium text-slate-700">Género <span className="text-slate-400">(opcional)</span></label><select value={form.genero} onChange={e=>updateField("genero",e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm"><option value="">Prefiero no indicar</option><option>Femenino</option><option>Masculino</option><option>Otro</option></select></div><Field label="Fecha de nacimiento (opcional)" type="date" value={form.fecha_nacimiento} onChange={v=>updateField("fecha_nacimiento",v)} /></div>
            <div><label className="mb-2 block text-sm font-medium text-slate-700">Educación <span className="text-slate-400">(opcional)</span></label><textarea rows={3} value={form.educacion} onChange={(e) => updateField("educacion", e.target.value)} placeholder="Ej.: Ingeniería de Sistemas — Universidad..." className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></div>
            <div><label className="mb-2 block text-sm font-medium text-slate-700">Experiencia profesional <span className="text-red-500">*</span></label><textarea rows={6} required value={form.experiencia} onChange={(e) => updateField("experiencia", e.target.value)} placeholder="Cuéntanos sobre tus cargos anteriores, responsabilidades, proyectos y tecnologías..." className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></div>
            {submitError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>}
            <button type="submit" disabled={!selectedJob || submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3.5 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"><PaperPlaneTilt size={19} weight="fill" />{submitting ? "Enviando..." : selectedJob ? "Enviar postulación" : "Selecciona un cargo primero"}</button><p className="text-center text-xs leading-5 text-slate-500">Tus datos serán utilizados exclusivamente para gestionar tu postulación.</p>
          </form></>}
        </div>
      </div></section>
      <footer className="border-t border-slate-200 bg-slate-50"><div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-slate-500 lg:px-8">Portal de oportunidades profesionales</div></footer>
    </main>
  );
}

function Field({ label, value, onChange, required = false, type = "text" }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string }) {
  return <div><label className="mb-2 block text-sm font-medium text-slate-700">{label} {required && <span className="text-red-500">*</span>}</label><input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></div>;
}
