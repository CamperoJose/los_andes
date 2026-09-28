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
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("Todas");
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

  const areas = useMemo(() => ["Todas", ...new Set(jobs.map(job => job.area).filter(Boolean))], [jobs]);
  const visibleJobs = useMemo(() => jobs.filter(job => (area === "Todas" || job.area === area) && `${job.title} ${job.area} ${job.description}`.toLowerCase().includes(query.toLowerCase())), [jobs, area, query]);
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
    <main className="site-shell min-h-screen">
      <section className="relative overflow-hidden border-b border-[#173c34]/10 bg-[#e6eadd] text-[var(--ink)]">
        <div className="site-noise" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-6 lg:px-10 lg:pb-24">
          <nav className="flex items-center justify-between"><a href="/home" className="site-brand"><span className="site-brand-mark">LA<span>.</span></span><span className="hidden text-[11px] font-bold uppercase leading-tight tracking-[.18em] sm:block">Los Andes<br/>Talento</span></a><div className="flex items-center gap-4 text-sm font-semibold"><a href="/home" className="hover:text-[var(--accent-dark)]">Inicio</a><a href="/admin" className="site-nav-cta">RR. HH.</a></div></nav>
          <div className="mt-20 grid items-end gap-10 lg:grid-cols-[1fr_.7fr]"><div><div className="site-eyebrow"><span className="site-dot"/> Oportunidades abiertas · Bolivia</div><h1 className="site-display mt-6 max-w-3xl text-[clamp(4.5rem,8vw,8rem)] leading-[.9]">Un futuro<br/>con <em>propósito.</em></h1><p className="mt-8 max-w-xl text-lg leading-8 text-[var(--ink-soft)]">Tu experiencia puede transformar lo que hacemos. Encuentra una oportunidad que conecte con lo que te mueve.</p><a href="#vacantes" className="site-button mt-9">Ver posiciones <ArrowRight size={19}/></a></div><div className="relative hidden h-[350px] lg:block"><div className="absolute right-3 top-1 h-72 w-72 rounded-full border border-[var(--ink)]/20"/><div className="absolute right-12 top-10 grid h-72 w-72 place-items-center rounded-full bg-[var(--ink)] text-[var(--accent)]"><Sparkle size={110} weight="thin"/></div><div className="site-serif absolute bottom-3 left-0 rotate-[-8deg] rounded-2xl bg-[var(--accent)] px-7 py-4 text-3xl shadow-xl">Atrévete a crecer</div></div></div>
        </div>
      </section>

      <section id="vacantes" className="mx-auto max-w-7xl scroll-mt-8 px-6 py-20 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-5"><div className="max-w-2xl"><p className="site-eyebrow">Elige tu siguiente paso</p><h2 className="site-serif mt-3 text-5xl">Posiciones <em>abiertas.</em></h2><p className="mt-3 text-[var(--ink-soft)]">Explora, filtra y encuentra el equipo indicado para ti.</p></div><div className="rounded-full border border-[#173c34]/20 px-4 py-2 text-sm font-bold">{jobs.length} oportunidades</div></div><div className="mt-9 flex flex-col gap-3 sm:flex-row"><input aria-label="Buscar cargos" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por cargo, área o palabra clave…" className="site-input w-full px-5 py-3.5 sm:max-w-md"/><select aria-label="Filtrar por área" value={area} onChange={e=>setArea(e.target.value)} className="site-input px-5 py-3.5">{areas.map(a=><option key={a}>{a}</option>)}</select></div>
        {loadingJobs && <div className="mt-10 grid gap-5 md:grid-cols-2">{[1,2].map((n) => <div key={n} className="h-72 animate-pulse rounded-2xl bg-slate-100" />)}</div>}
        {!loadingJobs && jobsError && <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{jobsError}</div>}
        {!loadingJobs && !jobsError && jobs.length === 0 && <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">Actualmente no hay vacantes abiertas.</div>}
        {!loadingJobs && !jobsError && <div className="mt-10 grid gap-5 md:grid-cols-2">{visibleJobs.map((job) => (
          <article key={job.id} className="site-card group flex flex-col p-7 transition hover:-translate-y-1">
            <div className="flex items-start justify-between gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#e3eadd] text-[var(--ink)]"><Briefcase size={22} weight="duotone" /></div><span className="rounded-full bg-[#e3eadd] px-3 py-1 text-xs font-semibold text-[var(--ink)]">Abierto</span></div>
            <p className="mt-8 text-xs font-bold uppercase tracking-[.16em] text-[var(--accent-dark)]">{job.area}</p><h3 className="site-serif mt-2 text-3xl">{job.title}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{job.description}</p>
            {job.detail && <p className="mt-3 text-sm leading-6 text-slate-500">{job.detail}</p>}
            <div className="mt-5 flex flex-wrap gap-2">{job.tags.map((tag) => <span key={tag} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{tag}</span>)}</div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-5 text-sm text-slate-500"><span className="inline-flex items-center gap-1.5"><MapPin size={16} />{job.location}</span><span className="inline-flex items-center gap-1.5"><Briefcase size={16} />{job.modality}</span></div>
            <button type="button" onClick={() => openApplication(job)} className="mt-auto flex w-full items-center justify-between gap-2 border-t border-[#173c34]/15 pt-5 text-sm font-bold text-[var(--ink)] transition group-hover:text-[var(--accent-dark)]">Postularme a este cargo <ArrowRight size={18} weight="bold" /></button>
          </article>
        ))}</div>}
      </section>

      <section id="postulacion" className="scroll-mt-8 border-t border-[#173c34]/10 bg-[#e6eadd]"><div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div><p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">Tu perfil</p><h2 className="site-serif mt-2 text-5xl">Tu historia comienza aquí</h2><p className="mt-4 leading-7 text-slate-600">Completa tus datos y comparte tu experiencia profesional. Tu postulación será registrada para que el equipo pueda revisarla.</p><div className="mt-8 space-y-4">{profileFeatures.map(({ icon: ItemIcon, title, text }) => <div key={title} className="flex gap-3"><div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-[var(--primary)]"><ItemIcon size={18} weight="duotone" /></div><div><p className="font-semibold">{title}</p><p className="mt-0.5 text-sm leading-5 text-slate-500">{text}</p></div></div>)}</div></div>
        <div className="site-card p-6 sm:p-9">{submitted ? (
          <div className="flex min-h-[430px] flex-col items-center justify-center text-center"><div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle size={34} weight="fill" /></div><h3 className="mt-5 text-2xl font-semibold">¡Postulación enviada!</h3><p className="mt-3 max-w-md leading-6 text-slate-600">Registramos correctamente tu postulación para <strong>{selectedTitle}</strong>.</p><button type="button" onClick={() => { setSubmitted(false); setSelectedJob(null); setForm(emptyForm); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="mt-7 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-slate-50">Volver a las oportunidades</button></div>
        ) : <><div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cargo seleccionado</p><h3 className="mt-1 text-lg font-semibold">{selectedTitle}</h3></div>{selectedJob && <button type="button" aria-label="Quitar cargo seleccionado" onClick={() => setSelectedJob(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700"><X size={20} /></button>}</div>
          <form onSubmit={submitApplication} className="mt-6 space-y-5"><div className="grid gap-5 sm:grid-cols-2"><Field label="Nombres" required value={form.nombres} onChange={(v) => updateField("nombres", v)} /><Field label="Apellidos" required value={form.apellidos} onChange={(v) => updateField("apellidos", v)} /></div><div className="grid gap-5 sm:grid-cols-2"><Field label="Correo electrónico" type="email" required value={form.email} onChange={(v) => updateField("email", v)} /><Field label="Teléfono" value={form.telefono} onChange={(v) => updateField("telefono", v)} /></div><Field label="Ciudad de residencia" value={form.ciudad} onChange={(v) => updateField("ciudad", v)} /><div className="grid gap-5 sm:grid-cols-2"><div><label className="mb-2 block text-sm font-medium text-slate-700">Género <span className="text-slate-400">(opcional)</span></label><select value={form.genero} onChange={e=>updateField("genero",e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm"><option value="">Prefiero no indicar</option><option>Femenino</option><option>Masculino</option><option>Otro</option></select></div><Field label="Fecha de nacimiento (opcional)" type="date" value={form.fecha_nacimiento} onChange={v=>updateField("fecha_nacimiento",v)} /></div>
            <div><label className="mb-2 block text-sm font-medium text-slate-700">Educación <span className="text-slate-400">(opcional)</span></label><textarea rows={3} value={form.educacion} onChange={(e) => updateField("educacion", e.target.value)} placeholder="Ej.: Ingeniería de Sistemas — Universidad..." className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></div>
            <div><label className="mb-2 block text-sm font-medium text-slate-700">Experiencia profesional <span className="text-red-500">*</span></label><textarea rows={6} required value={form.experiencia} onChange={(e) => updateField("experiencia", e.target.value)} placeholder="Cuéntanos sobre tus cargos anteriores, responsabilidades, proyectos y tecnologías..." className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></div>
            {submitError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>}
            <button type="submit" disabled={!selectedJob || submitting} className="site-button w-full disabled:cursor-not-allowed disabled:opacity-45"><PaperPlaneTilt size={19} weight="fill" />{submitting ? "Enviando..." : selectedJob ? "Enviar postulación" : "Selecciona un cargo primero"}</button><p className="text-center text-xs leading-5 text-slate-500">Tus datos serán utilizados exclusivamente para gestionar tu postulación.</p>
          </form></>}
        </div>
      </div></section>
      <footer className="border-t border-[#173c34]/10 bg-[var(--paper)]"><div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-slate-500 lg:px-8">LOS ANDES / TALENTO · Personas. Potencial. Futuro.</div></footer>
    </main>
  );
}

function Field({ label, value, onChange, required = false, type = "text" }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string }) {
  return <div><label className="mb-2 block text-sm font-medium text-slate-700">{label} {required && <span className="text-red-500">*</span>}</label><input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></div>;
}
