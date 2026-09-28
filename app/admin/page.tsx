"use client";

import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import {
  ArrowClockwise,
  Briefcase,
  ChartBar,
  Eye,
  EyeSlash,
  MagnifyingGlass,
  PencilSimple,
  Plus,
  SignOut,
  Trash,
  UserCircle,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import Analytics from "./analytics";

type AdminUser = { usuario_id: string; usuario: string; nombres: string; apellidos: string; rol: string };
type Job = {
  oportunidad_id: string; titulo: string; area: string; modalidad: string; ubicacion: string;
  descripcion_corta: string; descripcion_detalle: string; requisitos: string; visible: boolean;
  estado: "ABIERTA" | "CERRADA"; orden: number; fecha_publicacion: string; fecha_cierre: string;
};
type Application = {
  postulacion_id: string; oportunidad_id: string; cargo: string; estado: string; fecha_postulacion: string;
  observaciones: string; nombres: string; apellidos: string; email: string; telefono: string; ciudad: string;
  experiencia: string; educacion: string;
  genero?: string; fecha_nacimiento?: string; puntaje_evaluacion?: number | string; test_risc?: string;
};
type Dashboard = {
  resumen: { cargos_total: number; cargos_abiertos: number; cargos_visibles: number; postulaciones_total: number; pendientes: number };
  estados: Record<string, number>;
  por_cargo: Array<{ oportunidad_id: string; cargo: string; total: number; nueva: number; entrevista: number; finalista: number; contratado: number }>;
};

const emptyJob: Job = {
  oportunidad_id: "", titulo: "", area: "Tecnología", modalidad: "Híbrido", ubicacion: "La Paz, Bolivia",
  descripcion_corta: "", descripcion_detalle: "", requisitos: "", visible: true, estado: "ABIERTA",
  orden: 999, fecha_publicacion: "", fecha_cierre: "",
};

const states = ["NUEVA", "EN REVISION", "PRESELECCIONADO", "ENTREVISTA", "FINALISTA", "DESCARTADO", "CONTRATADO"];

export default function AdminPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<"dashboard" | "cargos" | "postulaciones">("dashboard");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then(r => r.json())
      .then(data => { if (data.authenticated) setUser(data.user); })
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (user) void loadAll();
  }, [user]);

  async function loadAll() {
    setLoading(true);
    setMessage("");
    try {
      const [j, a] = await Promise.all([
        fetch("/api/admin/oportunidades", { cache: "no-store" }).then(r => r.json()),
        fetch("/api/admin/postulaciones", { cache: "no-store" }).then(r => r.json()),
      ]);
      if (!j.success || !a.success) throw new Error(j.message || a.message || "No se pudo cargar la información");
      setDashboard({resumen:{cargos_total:j.data.length,cargos_abiertos:j.data.filter((x:Job)=>x.estado==="ABIERTA"&&x.visible).length,cargos_visibles:0,postulaciones_total:a.data.length,pendientes:0},estados:{},por_cargo:[]});
      setJobs(j.data || []);
      setApplications(a.data || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo cargar el panel");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setUser(null);
    setDashboard(null);
    setJobs([]);
    setApplications([]);
  }

  if (checking) return <AdminLoading />;
  if (!user) return <Login onSuccess={setUser} />;

  const filteredApplications = applications.filter(a =>
    [a.nombres, a.apellidos, a.email, a.cargo, a.estado].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="admin-shell min-h-screen text-[var(--ink)]">
      <header className="sticky top-0 z-30 border-b border-[#173c34]/10 bg-[#f6f2e9]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--ink)] text-[var(--accent)]"><Briefcase size={20} weight="duotone" /></div>
            <div><p className="font-bold tracking-tight">LOS ANDES / TALENTO</p><p className="text-xs text-[var(--ink-soft)]">Centro de selección</p></div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="hidden rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 sm:block">Ver portal público</a>
            <div className="hidden text-right md:block"><p className="text-sm font-semibold">{user.nombres} {user.apellidos}</p><p className="text-xs text-slate-500">{user.usuario} · Admin</p></div>
            <button onClick={logout} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" title="Cerrar sesión"><SignOut size={19} /></button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-7 lg:px-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-[var(--ink)] p-7 text-[#f6f2e9] shadow-xl shadow-[#173c34]/10 lg:p-10">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--accent)]">Centro de control / RR. HH.</p><h1 className="site-serif mt-4 text-4xl leading-tight sm:text-5xl">El talento tiene<br/><em>su lugar aquí.</em></h1><p className="mt-3 text-sm text-[var(--accent)]">Hola, {user.nombres}.</p><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Publica cargos, controla su visibilidad y acompaña cada postulación sin salir del portal.</p></div>
            <button onClick={() => void loadAll()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15 disabled:opacity-50"><ArrowClockwise size={18} className={loading ? "animate-spin" : ""} />Actualizar datos</button>
          </div>
        </section>

        <nav className="mt-8 flex gap-2 overflow-x-auto rounded-full border border-[#173c34]/10 bg-white/70 p-2 shadow-sm">
          <TabButton active={tab === "dashboard"} onClick={() => setTab("dashboard")} icon={<ChartBar size={18} />} label="Dashboard" />
          <TabButton active={tab === "cargos"} onClick={() => setTab("cargos")} icon={<Briefcase size={18} />} label="Cargos" />
          <TabButton active={tab === "postulaciones"} onClick={() => setTab("postulaciones")} icon={<UsersThree size={18} />} label="Postulaciones" />
        </nav>

        {applications.some(a => a.observaciones?.startsWith("DATOS DE DEMOSTRACIÓN")) && <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#d8c79f] bg-[#fff5d8] px-5 py-3 text-sm text-[#67502b]"><span className="font-bold">Modo demostración</span><span>Este panel incluye perfiles ficticios para explorar las métricas. No representan personas reales.</span></div>}
        {message && <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{message}</div>}

        {tab === "dashboard" && <>{dashboard ? <Analytics applications={applications} jobs={jobs} /> : <AdminLoading compact />}</>}
        {tab === "cargos" && <JobsView jobs={jobs} onEdit={setEditingJob} onNew={() => setEditingJob({ ...emptyJob, orden: jobs.length + 1 })} onRefresh={loadAll} />}
        {tab === "postulaciones" && <ApplicationsView applications={filteredApplications} search={search} setSearch={setSearch} onRefresh={loadAll} />}

        {editingJob && <JobModal job={editingJob} onClose={() => setEditingJob(null)} onSaved={async () => { setEditingJob(null); await loadAll(); }} />}
      </div>
    </main>
  );
}

function Login({ onSuccess }: { onSuccess: (user: AdminUser) => void }) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ usuario, contrasena }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "No se pudo iniciar sesión");
      onSuccess(data.user);
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo iniciar sesión");
    } finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen bg-[var(--ink)] text-white">
      <div className="min-h-screen">
        <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <section><div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm text-blue-100"><ChartBar size={16} />Talent Control</div><h1 className="site-serif mt-6 max-w-2xl text-5xl leading-[1.05] sm:text-7xl">El talento,<br/><em>a primera vista.</em></h1><p className="mt-5 max-w-xl leading-7 text-slate-300">Gestiona oportunidades, visibilidad pública y el avance de cada postulante desde un panel diseñado para operación diaria.</p><a href="/" className="mt-7 inline-flex text-sm font-semibold text-blue-200 hover:text-white">← Volver al portal público</a></section>
          <section className="rounded-[2rem] border border-white/10 bg-[var(--paper)] p-7 text-[var(--ink)] shadow-2xl sm:p-10">
            <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-full bg-[#e4e9dd] text-[var(--ink)]"><UserCircle size={24} weight="duotone" /></div><div><p className="text-sm text-slate-500">Acceso restringido</p><h2 className="text-xl font-semibold">Ingresar como administrador</h2></div></div>
            <form onSubmit={submit} className="mt-7 space-y-5">
              <AdminField label="Usuario" value={usuario} onChange={setUsuario} autoComplete="username" />
              <div><label className="mb-2 block text-sm font-medium">Contraseña</label><div className="relative"><input type={show ? "text" : "password"} value={contrasena} onChange={e => setContrasena(e.target.value)} autoComplete="current-password" className="w-full rounded-xl border border-slate-300 px-3.5 py-3 pr-11 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /><button type="button" onClick={() => setShow(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100">{show ? <EyeSlash size={18}/> : <Eye size={18}/>}</button></div></div>
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              <button disabled={loading} className="w-full rounded-xl bg-[#101a34] px-4 py-3.5 text-sm font-semibold text-white hover:bg-[#17264c] disabled:opacity-50">{loading ? "Validando..." : "Entrar al panel"}</button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

function JobsView({ jobs, onEdit, onNew, onRefresh }: { jobs: Job[]; onEdit: (job: Job) => void; onNew: () => void; onRefresh: () => Promise<void> }) {
  async function remove(job: Job) {
    if (!confirm(`¿Dar de baja “${job.titulo}”? Se conservará su historial y dejará de publicarse.`)) return;
    const r = await fetch("/api/admin/oportunidades", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ oportunidad_id: job.oportunidad_id }) });
    const data = await r.json();
    if (!data.success) return alert(data.message || "No se pudo dar de baja");
    await onRefresh();
  }
  return <section className="mt-6">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="text-xl font-semibold">Gestión de cargos</h2><p className="mt-1 text-sm text-slate-500">El estado y la visibilidad controlan exactamente lo que aparece en el portal público.</p></div><button onClick={onNew} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#101a34] px-4 py-3 text-sm font-semibold text-white"><Plus size={18}/>Nuevo cargo</button></div>
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Cargo</th><th className="px-5 py-3">Publicación</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3">Orden</th><th className="px-5 py-3 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-slate-100">{jobs.map(job => <tr key={job.oportunidad_id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><p className="font-semibold">{job.titulo}</p><p className="mt-1 text-xs text-slate-500">{job.area} · {job.modalidad} · {job.ubicacion}</p></td><td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${job.visible ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"}`}>{job.visible ? <Eye size={14}/> : <EyeSlash size={14}/>} {job.visible ? "Visible" : "Oculto"}</span></td><td className="px-5 py-4"><StatusPill value={job.estado}/></td><td className="px-5 py-4">{job.orden}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button onClick={() => onEdit(job)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" title="Editar"><PencilSimple size={17}/></button><button onClick={() => void remove(job)} className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50" title="Dar de baja"><Trash size={17}/></button></div></td></tr>)}</tbody></table></div>
      {jobs.length === 0 && <Empty text="No hay cargos creados."/>}
    </div>
  </section>;
}

function ApplicationsView({ applications, search, setSearch, onRefresh }: { applications: Application[]; search: string; setSearch: (v:string)=>void; onRefresh:()=>Promise<void> }) {
  const [selected, setSelected] = useState<Application | null>(null);
  return <section className="mt-6">
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><h2 className="text-xl font-semibold">Bandeja de postulaciones</h2><p className="mt-1 text-sm text-slate-500">Busca, revisa el perfil y mueve candidatos por el pipeline.</p></div><div className="relative w-full lg:w-80"><MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar candidato o cargo..." className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"/></div></div>
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Candidato</th><th className="px-5 py-3">Cargo</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3">Fecha</th><th className="px-5 py-3"></th></tr></thead><tbody className="divide-y divide-slate-100">{applications.map(a=><tr key={a.postulacion_id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><p className="font-semibold">{a.nombres} {a.apellidos}</p><p className="mt-1 text-xs text-slate-500">{a.email}</p></td><td className="px-5 py-4">{a.cargo}</td><td className="px-5 py-4"><StatusPill value={a.estado}/></td><td className="px-5 py-4 text-slate-500">{String(a.fecha_postulacion || "").replace("T"," ").slice(0,16)}</td><td className="px-5 py-4 text-right"><button onClick={()=>setSelected(a)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50">Revisar</button></td></tr>)}</tbody></table></div>{applications.length===0&&<Empty text="No se encontraron postulaciones."/>}</div>
    {selected && <ApplicationDrawer application={selected} onClose={()=>setSelected(null)} onSaved={async()=>{setSelected(null); await onRefresh();}}/>}
  </section>;
}

function JobModal({ job, onClose, onSaved }: { job: Job; onClose:()=>void; onSaved:()=>Promise<void> }) {
  const [form,setForm]=useState(job); const [saving,setSaving]=useState(false); const [error,setError]=useState("");
  function set<K extends keyof Job>(key:K,value:Job[K]){setForm(f=>({...f,[key]:value}));}
  async function save(e:FormEvent){e.preventDefault();setSaving(true);setError("");try{const r=await fetch("/api/admin/oportunidades",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const data=await r.json();if(!r.ok||!data.success)throw new Error(data.message||"No se pudo guardar");await onSaved();}catch(error){setError(error instanceof Error?error.message:"No se pudo guardar");}finally{setSaving(false);}}
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-5"><div className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-7"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-blue-700">{form.oportunidad_id ? "Editar cargo" : "Nueva oportunidad"}</p><h3 className="mt-1 text-2xl font-semibold">{form.oportunidad_id ? form.titulo : "Crear cargo"}</h3></div><button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X size={21}/></button></div><form onSubmit={save} className="mt-6 space-y-5"><div className="grid gap-4 sm:grid-cols-2"><AdminField label="Título *" value={form.titulo} onChange={v=>set("titulo",v)}/><AdminField label="Área *" value={form.area} onChange={v=>set("area",v)}/><AdminField label="Modalidad *" value={form.modalidad} onChange={v=>set("modalidad",v)}/><AdminField label="Ubicación *" value={form.ubicacion} onChange={v=>set("ubicacion",v)}/></div><TextArea label="Descripción corta *" value={form.descripcion_corta} onChange={v=>set("descripcion_corta",v)} rows={2}/><TextArea label="Descripción detallada" value={form.descripcion_detalle} onChange={v=>set("descripcion_detalle",v)} rows={4}/><AdminField label="Requisitos / tags (separados por ;)" value={form.requisitos} onChange={v=>set("requisitos",v)}/><div className="grid gap-4 sm:grid-cols-3"><div><label className="mb-2 block text-sm font-medium">Estado</label><select value={form.estado} onChange={e=>set("estado",e.target.value as Job["estado"])} className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm"><option>ABIERTA</option><option>CERRADA</option></select></div><AdminField label="Orden" type="number" value={String(form.orden)} onChange={v=>set("orden",Number(v))}/><label className="flex cursor-pointer items-center gap-3 self-end rounded-xl border border-slate-200 px-4 py-3"><input type="checkbox" checked={Boolean(form.visible)} onChange={e=>set("visible",e.target.checked)} className="h-4 w-4"/><span><span className="block text-sm font-semibold">Visible</span><span className="block text-xs text-slate-500">Mostrar en portal</span></span></label></div><div className="grid gap-4 sm:grid-cols-2"><AdminField label="Fecha publicación" type="date" value={String(form.fecha_publicacion||"").slice(0,10)} onChange={v=>set("fecha_publicacion",v)}/><AdminField label="Fecha cierre" type="date" value={String(form.fecha_cierre||"").slice(0,10)} onChange={v=>set("fecha_cierre",v)}/></div>{error&&<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}<div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold">Cancelar</button><button disabled={saving} className="rounded-xl bg-[#101a34] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving?"Guardando...":"Guardar cargo"}</button></div></form></div></div>;
}

function ApplicationDrawer({application,onClose,onSaved}:{application:Application;onClose:()=>void;onSaved:()=>Promise<void>}){
  const [estado,setEstado]=useState(application.estado||"NUEVA");const[obs,setObs]=useState(application.observaciones||"");const[score,setScore]=useState(String(application.puntaje_evaluacion??""));const[risc,setRisc]=useState(application.test_risc||"");const[saving,setSaving]=useState(false);
  async function save(){setSaving(true);try{const r=await fetch("/api/admin/postulaciones",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({postulacion_id:application.postulacion_id,estado,observaciones:obs,puntaje_evaluacion:score,test_risc:risc})});const data=await r.json();if(!data.success)throw new Error(data.message||"No se pudo actualizar");await onSaved();}catch(error){alert(error instanceof Error?error.message:"No se pudo actualizar");}finally{setSaving(false);}}
  return <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm"><aside className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Perfil del candidato</p><h3 className="mt-1 text-2xl font-semibold">{application.nombres} {application.apellidos}</h3><p className="mt-1 text-sm text-slate-500">{application.cargo}</p></div><button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100"><X size={21}/></button></div><div className="mt-7 grid gap-3 sm:grid-cols-2"><Info label="Email" value={application.email}/><Info label="Teléfono" value={application.telefono||"—"}/><Info label="Ciudad" value={application.ciudad||"—"}/><Info label="Género" value={application.genero||"Sin dato"}/><Info label="Nacimiento" value={application.fecha_nacimiento||"Sin dato"}/><Info label="Fecha" value={String(application.fecha_postulacion||"").replace("T"," ").slice(0,16)}/></div><div className="mt-6 space-y-5"><ReadBox title="Experiencia" text={application.experiencia||"Sin detalle"}/><ReadBox title="Educación" text={application.educacion||"Sin detalle"}/><div><label className="mb-2 block text-sm font-semibold">Estado del proceso</label><select value={estado} onChange={e=>setEstado(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm">{states.map(s=><option key={s}>{s}</option>)}</select></div><div className="grid gap-3 sm:grid-cols-2"><AdminField label="Puntaje (0 a 100)" type="number" value={score} onChange={setScore}/><AdminField label="Resultado test RISC" value={risc} onChange={setRisc}/></div><TextArea label="Observaciones internas" value={obs} onChange={setObs} rows={4}/><button onClick={()=>void save()} disabled={saving} className="w-full rounded-xl bg-[#101a34] px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-50">{saving?"Guardando...":"Guardar seguimiento"}</button></div></aside></div>;
}

function TabButton({active,onClick,icon,label}:{active:boolean;onClick:()=>void;icon:ReactNode;label:string}){return <button onClick={onClick} className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${active?"bg-[var(--ink)] text-white shadow":"text-[var(--ink-soft)] hover:bg-[#e4e9dd]"}`}>{icon}{label}</button>}
function StatusPill({value}:{value:string}){const active=["ABIERTA","CONTRATADO","FINALISTA"].includes(String(value).toUpperCase());return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${active?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-600"}`}>{value}</span>}
function AdminField({label,value,onChange,type="text",autoComplete}:{label:string;value:string;onChange:(v:string)=>void;type?:string;autoComplete?:string}){return <div><label className="mb-2 block text-sm font-medium">{label}</label><input type={type} value={value} onChange={e=>onChange(e.target.value)} autoComplete={autoComplete} className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"/></div>}
function TextArea({label,value,onChange,rows}:{label:string;value:string;onChange:(v:string)=>void;rows:number}){return <div><label className="mb-2 block text-sm font-medium">{label}</label><textarea rows={rows} value={value} onChange={e=>onChange(e.target.value)} className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"/></div>}
function Info({label,value}:{label:string;value:string}){return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-sm font-medium break-words">{value}</p></div>}
function ReadBox({title,text}:{title:string;text:string}){return <div><p className="mb-2 text-sm font-semibold">{title}</p><div className="whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">{text}</div></div>}
function Empty({text}:{text:string}){return <div className="p-8 text-center text-sm text-slate-500">{text}</div>}
function AdminLoading({compact=false}:{compact?:boolean}){return <div className={compact?"mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4":"grid min-h-screen place-items-center bg-[#f4f7fb]"}>{compact?[1,2,3,4].map(n=><div key={n} className="h-28 animate-pulse rounded-2xl bg-slate-200"/>):<div className="text-center"><div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"/><p className="mt-3 text-sm text-slate-500">Cargando panel...</p></div>}</div>}
