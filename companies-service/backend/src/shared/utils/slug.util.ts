/**
 * Gera um slug a partir de uma string
 * @param text - Texto para converter em slug
 * @returns Slug gerado
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais exceto hífens
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove hífens no início e fim
}

/**
 * Gera um slug único adicionando um sufixo numérico se necessário
 * @param prefix - Slug da empresa para ser usado como prefixo (opcional)
 * @param text - Texto para converter em slug
 * @param existingSlugs - Array de slugs existentes para verificar duplicatas
 * @returns Slug único
 */
export function generateUniqueSlug(
  prefix: string | null | undefined,
  text: string,
  existingSlugs: string[] = [],
): string {
  const slug = generateSlug(text);
  let counter = 1;
  
  // Se há prefixo válido, sempre usar o formato com prefixo
  if (prefix && prefix.trim()) {
    let uniqueSlug = `${prefix}-${slug}`;
    
    while (existingSlugs.includes(uniqueSlug)) {
      uniqueSlug = `${prefix}-${slug}-${counter}`;
      counter++;
    }
    
    return uniqueSlug;
  } else {
    // Se não há prefixo, usar formato simples
    let uniqueSlug = slug;
    
    while (existingSlugs.includes(uniqueSlug)) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
    
    return uniqueSlug;
  }
}
