import { getImage, type ImageMetadata } from "astro:assets";

export type Picture = {
    category: string;
    thumb: string;
    srcset: string;
    large: string;
    width: number;
    height: number;
    alt: string;
};

export type GalleryCategory = {
    label: string;
    slug: string;
    title: string;
    description: string;
    pictures: Picture[];
};

const CATEGORY_LABELS: Record<string, string> = {
    "web bodas": "Bodas",
    "web eventos": "Eventos",
    "web photoshoot": "Photoshoot",
    "web producto": "Producto",
    "web realstate": "Real Estate",
    "web spa": "Spa",
    "Web Sport": "Deporte",
};

const CATEGORY_DETAILS: Record<
    string,
    Pick<GalleryCategory, "slug" | "title" | "description">
> = {
    Bodas: {
        slug: "bodas",
        title: "Fotografía de bodas",
        description:
            "Soy Moisés Magariño, fotógrafo de bodas. Capturo cada historia con sensibilidad y naturalidad para que vuelvas a sentirla.",
    },
    Eventos: {
        slug: "eventos",
        title: "Fotografía de eventos",
        description:
            "Soy Moisés Magariño y documento eventos con imágenes auténticas, atento a cada encuentro, emoción y detalle.",
    },
    Photoshoot: {
        slug: "photoshoot",
        title: "Sesiones fotográficas",
        description:
            "Soy Moisés Magariño. Creo retratos y sesiones que reflejan la esencia de cada persona con una mirada cercana.",
    },
    Producto: {
        slug: "producto",
        title: "Fotografía de producto",
        description:
            "Soy Moisés Magariño y realizo imágenes de producto cuidadas para destacar sus formas, texturas y personalidad.",
    },
    "Real Estate": {
        slug: "real-estate",
        title: "Fotografía inmobiliaria",
        description:
            "Soy Moisés Magariño. Fotografío espacios y propiedades para mostrar su carácter, amplitud y mejores detalles.",
    },
    Spa: {
        slug: "spa",
        title: "Fotografía de spa y bienestar",
        description:
            "Soy Moisés Magariño y capturo la calma, los espacios y los detalles que hacen única cada experiencia de bienestar.",
    },
    Deporte: {
        slug: "deporte",
        title: "Fotografía deportiva",
        description:
            "Soy Moisés Magariño. Congelo la energía del deporte y sus momentos decisivos en imágenes llenas de movimiento.",
    },
};

function categoryOf(path: string): string {
    const parts = path.split("/");
    const i = parts.indexOf("pagina web fotos y video");
    return i !== -1 ? parts[i + 1]! : "otros";
}

const files = import.meta.glob<{ default: ImageMetadata }>(
    "../assets/pagina web fotos y video/**/*.{jpg,jpeg,JPG,JPEG,png,PNG}",
    { eager: true },
);

const grouped = new Map<string, { meta: ImageMetadata; path: string }[]>();

for (const [path, mod] of Object.entries(files)) {
    const label = CATEGORY_LABELS[categoryOf(path)] ?? "Fotografías";
    grouped.set(label, [
        ...(grouped.get(label) ?? []),
        { meta: mod.default, path },
    ]);
}

export const GALLERY: GalleryCategory[] = [];

for (const [label, items] of grouped.entries()) {
    items.sort((a, b) =>
        a.path.localeCompare(b.path, undefined, { numeric: true }),
    );

    const details = CATEGORY_DETAILS[label] ?? {
        slug: label
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
        title: `Fotografía de ${label.toLowerCase()}`,
        description: `Soy Moisés Magariño y realizo fotografía profesional de ${label.toLowerCase()}, cuidando cada detalle de principio a fin.`,
    };
    const pictures: Picture[] = [];

    for (const { meta } of items) {
        const thumb1x = await getImage({
            src: meta,
            width: 480,
            format: "webp",
            quality: 75,
        });
        const thumb2x = await getImage({
            src: meta,
            width: 960,
            format: "webp",
            quality: 75,
        });
        const large = await getImage({
            src: meta,
            width: Math.min(1920, meta.width),
            format: "webp",
            quality: 80,
        });

        pictures.push({
            category: label,
            thumb: thumb1x.src,
            srcset: `${thumb1x.src} 480w, ${thumb2x.src} 960w`,
            large: large.src,
            width: meta.width,
            height: meta.height,
            alt: `Fotografía de ${label} ${pictures.length + 1}`,
        });
    }

    GALLERY.push({ label, ...details, pictures });
}

GALLERY.sort((a, b) => a.label.localeCompare(b.label));

export const PICTURES: Picture[] = [];
const queues = GALLERY.map(({ pictures }) => [...pictures]);

while (queues.some((queue) => queue.length > 0)) {
    for (const queue of queues) {
        const picture = queue.shift();
        if (picture) PICTURES.push(picture);
    }
}
