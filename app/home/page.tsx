import Link from "next/link";
import { ArrowRight, Briefcase, ChartBar, MapPin, UsersThree } from "@phosphor-icons/react/dist/ssr";

export default function HomePage() {
  return <main className="min-h-screen bg-[#f5f7fb] text-[#14213c]">
    <section className="hero-grid relative overflow-hidden bg-[#101a34] text-white">
      <div className="absolute -right-20 top-10 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-7 lg:px-8">
        <nav className="flex items-center justify-between"><Link href="/home" className="flex items-center gap-3 font-bold tracking-tight"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10"><Briefcase size={22}/></span>LOS ANDES</Link><div className="flex gap-3 text-sm"><Link href="/postulate" className="rounded-full border border-white/20 px-4 py-2 hover:bg-white/10">Postularme</Link><Link href="/admin" className="rounded-full bg-white px-4 py-2 font-semibold text-[#101a34]">Panel RR. HH.</Link></div></nav>
        <div className="max-w-3xl pt-24"><p className="text-sm font-semibold uppercase tracking-[.22em] text-blue-200">Convocatoria · Los Andes</p><h1 className="mt-5 text-5xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">Tu próximo paso profesional empieza aquí.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Explora las oportunidades abiertas, comparte tu trayectoria y forma parte del proceso de selección.</p><Link href="/postulate" className="mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-[#101a34] shadow-lg transition hover:-translate-y-1"><ArrowRight size={20}/> Ver cargos disponibles</Link></div>
      </div>
    </section>
    <section className="mx-auto grid max-w-6xl gap-5 px-6 py-16 md:grid-cols-3 lg:px-8">{[
      [Briefcase,"Explora los cargos","Consulta las posiciones abiertas y encuentra la que se ajuste a tu perfil."],
      [UsersThree,"Comparte tu perfil","Envía tus datos, formación y experiencia en un solo formulario."],
      [ChartBar,"Seguimiento transparente","El equipo de RR. HH. revisa las postulaciones desde un panel centralizado."],
    ].map(([Icon,title,desc])=><article key={String(title)} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700"><Icon size={24}/></div><h2 className="text-xl font-semibold">{title as string}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{desc as string}</p></article>)}</section>
    <div className="mx-auto max-w-6xl px-6 pb-16 lg:px-8"><div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-[#e8efff] p-8 sm:flex-row sm:items-center"><div><p className="flex items-center gap-2 text-sm font-semibold text-blue-700"><MapPin size={18}/> Convocatoria en Bolivia</p><h2 className="mt-2 text-2xl font-semibold">¿Listo para dar el siguiente paso?</h2></div><Link href="/postulate" className="rounded-xl bg-[#101a34] px-5 py-3 font-semibold text-white">Ir a postulaciones →</Link></div></div>
  </main>;
}
