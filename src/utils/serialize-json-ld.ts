/**
 * Serializa datos JSON-LD para inyectarlos de forma segura en un
 * `<script type="application/ld+json">` vía `set:html`.
 *
 * Escapa `<` como `\u003c` para que ningún valor pueda cerrar el bloque
 * (`</script>`) ni abrir un comentario HTML (`<!--`). Así añadir contenido
 * con `<` en el futuro no rompe el marcado ni abre una vía de XSS.
 */
export function serializeJsonLd(data: unknown): string {
	return JSON.stringify(data).replaceAll("<", "\\u003c");
}
