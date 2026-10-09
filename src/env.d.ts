/// <reference types="astro/client" />

declare module "*.css" {
    const styles: Record<string, string>;
    export default styles;
}

declare module "swiper/css" {
    const styles: string;
    export default styles;
}

declare module "swiper/css/navigation" {
    const styles: string;
    export default styles;
}

declare module "swiper/css/pagination" {
    const styles: string;
    export default styles;
}

declare module "swiper/css/free-mode" {
    const styles: string;
    export default styles;
}
