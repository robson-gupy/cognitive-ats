import { generateSlug, generateUniqueSlug } from './slug.util';

describe('Slug Utils', () => {
  describe('generateSlug', () => {
    it('should generate slug from text', () => {
      expect(generateSlug('Test Company')).toBe('test-company');
      expect(generateSlug('Empresa Teste')).toBe('empresa-teste');
      expect(generateSlug('Company & Co.')).toBe('company-co');
      expect(generateSlug('  Spaces  ')).toBe('spaces');
    });

    it('should handle special characters and accents', () => {
      expect(generateSlug('São Paulo')).toBe('sao-paulo');
      expect(generateSlug('João Silva')).toBe('joao-silva');
      expect(generateSlug('Café & Pão')).toBe('cafe-pao');
    });

    it('should handle numbers', () => {
      expect(generateSlug('Company 123')).toBe('company-123');
      expect(generateSlug('123 Company')).toBe('123-company');
    });
  });

  describe('generateUniqueSlug', () => {
    it('should generate unique slug without prefix when prefix is null', () => {
      const existingSlugs = ['test-company'];
      const result = generateUniqueSlug(null, 'Test Company', existingSlugs);
      
      expect(result).toBe('test-company-1');
    });

    it('should generate unique slug without prefix when prefix is undefined', () => {
      const existingSlugs = ['test-company'];
      const result = generateUniqueSlug(undefined, 'Test Company', existingSlugs);
      
      expect(result).toBe('test-company-1');
    });

    it('should generate unique slug without prefix when prefix is empty string', () => {
      const existingSlugs = ['test-company'];
      const result = generateUniqueSlug('', 'Test Company', existingSlugs);
      
      expect(result).toBe('test-company-1');
    });

    it('should generate unique slug without prefix when prefix is whitespace', () => {
      const existingSlugs = ['test-company'];
      const result = generateUniqueSlug('   ', 'Test Company', existingSlugs);
      
      expect(result).toBe('test-company-1');
    });

    it('should generate unique slug with prefix when prefix is provided', () => {
      const existingSlugs = ['gupy-test-company'];
      const result = generateUniqueSlug('gupy', 'Test Company', existingSlugs);
      
      expect(result).toBe('gupy-test-company-1');
    });

    it('should generate base slug when no conflicts exist', () => {
      const existingSlugs: string[] = [];
      const result = generateUniqueSlug(null, 'Test Company', existingSlugs);
      
      expect(result).toBe('test-company');
    });

    it('should generate base slug with prefix when no conflicts exist', () => {
      const existingSlugs: string[] = [];
      const result = generateUniqueSlug('gupy', 'Test Company', existingSlugs);
      
      expect(result).toBe('gupy-test-company');
    });

    it('should handle multiple conflicts without prefix', () => {
      const existingSlugs = ['test-company', 'test-company-1', 'test-company-2'];
      const result = generateUniqueSlug(null, 'Test Company', existingSlugs);
      
      expect(result).toBe('test-company-3');
    });

    it('should handle multiple conflicts with prefix', () => {
      const existingSlugs = ['gupy-test-company', 'gupy-test-company-1', 'gupy-test-company-2'];
      const result = generateUniqueSlug('gupy', 'Test Company', existingSlugs);
      
      expect(result).toBe('gupy-test-company-3');
    });

    it('should handle complex text with special characters', () => {
      const existingSlugs = ['gupy-empresa-tecnologia-ltda'];
      const result = generateUniqueSlug('gupy', 'Empresa & Tecnologia Ltda.', existingSlugs);
      
      expect(result).toBe('gupy-empresa-tecnologia-ltda-1');
    });

    it('should handle very long text', () => {
      const longText = 'Esta é uma empresa com um nome muito longo que deve ser convertido em um slug apropriado';
      const result = generateUniqueSlug('gupy', longText, []);
      
      expect(result).toBe('gupy-esta-e-uma-empresa-com-um-nome-muito-longo-que-deve-ser-convertido-em-um-slug-apropriado');
    });
  });
});
