import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import HomeMotion from "./home-motion";
import styles from "./home.module.css";

const teamPhoto = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=85";
const workingPhoto = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=85";
const conversationPhoto = "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1800&q=85";
const steps = [
  { no: "01", title: "Encuentra tu lugar", text: "Explora los cargos abiertos. Lee lo que buscamos y elige la oportunidad que conecta con tu experiencia." },
  { no: "02", title: "Comparte tu historia", text: "Cuéntanos qué has aprendido, qué sabes hacer y qué te gustaría construir. Tu trayectoria tiene algo que aportar." },
  { no: "03", title: "Demos el siguiente paso", text: "Nuestro equipo revisará tu perfil para continuar el proceso de selección. Todo comienza con tu postulación." },
];

export default function HomePage() {
  return <HomeMotion>
    <header className="site-header relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
      <Link href="/home" className="site-brand" aria-label="Los Andes, inicio"><span className="site-brand-mark">LA<span>.</span></span><span className="hidden text-[11px] font-bold uppercase leading-tight tracking-[.18em] sm:block">Los Andes<br/>Talento</span></Link>
      <nav aria-label="Navegación principal" className="flex items-center gap-2 text-sm font-semibold sm:gap-6"><Link className="hidden transition hover:text-[var(--accent-dark)] sm:block" href="#nuestra-mirada">Nuestra mirada</Link><Link className="hidden transition hover:text-[var(--accent-dark)] sm:block" href="/postulate">Oportunidades</Link><Link className="site-nav-cta" href="/admin">Acceso RR. HH. <ArrowUpRight size={16}/></Link></nav>
    </header>

    <section className={`${styles.hero} mx-auto max-w-7xl px-6 lg:px-10`}>
      <div className={styles.heroCopy}><div className="site-eyebrow"><span className="site-dot"/> Los Andes / Personas y oportunidades</div><h1 className={`${styles.headline} site-display`}>Hay un lugar<br/>para <em>tu</em><br/>talento<span className="text-[var(--accent-dark)]">.</span></h1><p className="mt-8 max-w-[420px] text-base leading-7 text-[var(--ink-soft)] sm:text-lg sm:leading-8">El próximo capítulo de tu carrera no está escrito. Ven a construirlo con nosotros.</p><Link href="/postulate" className="site-button mt-8">Encuentra tu oportunidad <ArrowUpRight size={20}/></Link><a className={styles.scrollHint} href="#nuestra-mirada"><span className={styles.scrollLine}/><span>Hay más por descubrir</span><ArrowDown size={15}/></a></div>
      <div className={styles.heroVisual}>
        <div className={styles.photoFrame}><div className={styles.photoDrift} data-parallax="0.075"><Image src={teamPhoto} alt="Personas compartiendo ideas alrededor de una mesa de trabajo" fill priority sizes="(max-width: 1023px) 90vw, 48vw" className={styles.heroImage}/></div><div className={styles.photoGradient}/><div className={styles.photoCaption}><span>Lo que viene se construye juntos.</span><span>LOS ANDES — TALENTO</span></div></div>
        <div className={styles.smallPhoto} data-parallax="-0.055"><Image src={workingPhoto} alt="Un equipo trabajando en una propuesta junto a un portátil" fill sizes="(max-width: 640px) 38vw, 230px" className={styles.smallImage}/><span>Una idea. Muchas miradas.</span></div>
        <div className={styles.marginNote}><span className={styles.noteRule}/><p>El valor de un equipo<br/>empieza por su gente.</p></div>
        <span className={styles.photoIndex}>01 / EL COMIENZO</span>
      </div>
    </section>

    <div className={styles.editorialBand}><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5 lg:px-10"><p className="text-[11px] font-bold uppercase tracking-[.2em]">Personas. Potencial. Futuro.</p><span className="text-xs text-[var(--ink-soft)]">Un nuevo camino profesional, desde Bolivia.</span></div></div>

    <section id="nuestra-mirada" className={`${styles.story} mx-auto max-w-7xl px-6 lg:px-10`}>
      <div className={styles.storyPhoto} data-reveal><div className={styles.storyCrop}><div className={styles.photoDrift} data-parallax="0.065"><Image src={workingPhoto} alt="Colaboración y aprendizaje en un entorno de trabajo" fill sizes="(max-width: 1023px) 90vw, 42vw" className={styles.storyImage}/></div></div><p className={styles.imageFootnote}>El trabajo se vuelve más valioso cuando se comparte.</p></div>
      <div className={styles.storyText} data-reveal><p className="site-eyebrow">Nuestra mirada</p><h2 className={`${styles.sectionTitle} site-serif`}>El talento no<br/>es solo lo que<br/><em>sabes hacer.</em></h2><p className="mt-7 max-w-lg text-base leading-8 text-[var(--ink-soft)]">También es tu curiosidad, tu forma de resolver un problema y las ganas de aprender algo nuevo. Queremos conocer esa parte de ti.</p><div className={styles.storyAside}><span>01</span><p>Tu experiencia importa.<br/><strong>Tu manera de pensar, también.</strong></p></div><Link className={styles.textLink} href="/postulate">Conoce los cargos abiertos <ArrowUpRight size={20}/></Link></div>
    </section>

    <section className={styles.widePhotoSection}><div className={styles.widePhotoDrift} data-parallax="0.045"><Image src={conversationPhoto} alt="Profesionales conversando y revisando ideas en una reunión" fill sizes="100vw" className={styles.wideImage}/></div><div className={styles.wideShade}/><div className={`${styles.widePhotoCopy} mx-auto max-w-7xl px-6 lg:px-10`} data-reveal><p className="text-[11px] font-bold uppercase tracking-[.22em] text-white/80">De las ideas a lo que sigue</p><h2 className="site-serif mt-5 text-[clamp(3rem,6vw,6rem)] leading-[1.02]">Nadie construye<br/>el futuro <em>a solas.</em></h2><p className="mt-5 max-w-sm text-sm leading-7 text-white/85">Hay mucho por hacer. Y hay un lugar para quienes quieren ser parte.</p></div></section>

    <section className={`${styles.process} mx-auto max-w-7xl px-6 lg:px-10`}>
      <div className={styles.processHeading} data-reveal><p className="site-eyebrow">Del primer clic al siguiente paso</p><h2 className={`${styles.sectionTitle} site-serif mt-5`}>Comencemos<br/>por <em>conocernos.</em></h2><p className="mt-6 max-w-sm text-sm leading-7 text-[var(--ink-soft)]">Sin complicaciones. Elige una oportunidad y comparte tu perfil con nuestro equipo.</p><Link href="/postulate" className={styles.textLink}>Quiero postularme <ArrowRight size={20}/></Link></div>
      <div className={styles.steps}>{steps.map(({no,title,text})=><article key={no} className={styles.step} data-reveal><span className={styles.stepNumber}>{no}</span><div><h3 className="site-serif text-3xl sm:text-4xl">{title}</h3><p className="mt-3 max-w-md text-sm leading-7 text-[var(--ink-soft)]">{text}</p></div></article>)}</div>
    </section>

    <section className={styles.finalSection}><div className={`${styles.finalInner} mx-auto max-w-7xl px-6 lg:px-10`}><div data-reveal><p className="text-[11px] font-bold uppercase tracking-[.22em] text-[#b9d2b9]">Tu próxima historia</p><h2 className="site-serif mt-6 text-[clamp(3.3rem,7vw,7rem)] leading-[1.02]">Lo que sigue puede<br/>empezar <em>contigo.</em></h2></div><Link href="/postulate" className={styles.largeLink} aria-label="Ver las oportunidades de Los Andes"><ArrowUpRight size={60} weight="light"/></Link></div></section>
    <footer className="mx-auto max-w-7xl px-6 py-8 lg:px-10"><div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--ink-soft)]"><span className="font-bold tracking-wider text-[var(--ink)]">LOS ANDES / TALENTO</span><span>Personas. Potencial. Futuro.</span><span>Bolivia · 2026</span></div><p className={styles.credits}>Fotografía: <a href="https://unsplash.com/@anniespratt" target="_blank" rel="noreferrer">Annie Spratt</a>, <a href="https://unsplash.com/@brookecagle" target="_blank" rel="noreferrer">Brooke Cagle</a> y <a href="https://unsplash.com/@youxventures" target="_blank" rel="noreferrer">You X Ventures</a> / Unsplash.</p></footer>
  </HomeMotion>;
}
