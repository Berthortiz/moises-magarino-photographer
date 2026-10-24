/**
 * Configuración central del sitio: TODA la plantilla de SEO lee de aquí.
 *
 * En cada web de cliente solo hay que cambiar este archivo (nombre, dominio,
 * descripción, imagen OG, redes) y el `<head>`, las metas y el JSON-LD se
 * regeneran solos — sin tocar el layout ni los componentes.
 */
export const SITE_CONFIG = {
	name: "Moisés Magariño",
	title: "Fotógrafo profesional & Filmmaker | Moisés Magariño",
	description:
		"Fotografía profesional de bodas, conciertos y bienes raíces. Moisés Magariño captura historias y espacios con imágenes cuidadas.",
	siteUrl: "https://moisesmagarino.com",

	/** Imagen Open Graph por defecto (1200×630, en `public/`). */
	ogImage: "/og-default.jpg",
	ogImageWidth: 1200,
	ogImageHeight: 630,
	ogImageAlt:
		"Moisés Magariño — Fotógrafo profesional y filmmaker en Florida",

	ogLocale: "es_US",
	ogLocaleAlternates: ["es_MX", "es_AR", "es_CO"],

	/** Cuenta X/Twitter del sitio. Vacío ⇒ se omite `twitter:site`. */
	twitterHandle: "",

	themeColor: "#0d0f13",
	author: "Moisés Magariño",
} as const;

/**
 * Entidad persona/marca del schema.org (JSON-LD). Los `sameAs` son las
 * perfiles reales que refuerzan la entidad en Google.
 */
export const PERSON_SCHEMA = {
	name: "Moisés Magariño",
	jobTitle: "Fotógrafo profesional y filmmaker",
	description:
		"Fotógrafo profesional y filmmaker especializado en bodas, conciertos y bienes raíces, con imágenes y video cuidadas al detalle.",
	sameAs: [
		"https://www.youtube.com/user/moisesmagarino",
		"https://www.instagram.com/moises_magarino/",
	],
} as const;
