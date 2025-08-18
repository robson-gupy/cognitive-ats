// src/app.controller.ts
import { Controller, Get, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { ReactSsrService } from './react/react-ssr.service';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly reactSsr: ReactSsrService,
    private readonly appService: AppService,
  ) {}

  @Get()
  async renderHome(@Res() res: Response, @Req() req: Request) {
    try {
      // Extrair o slug da empresa do subdomínio
      const host = req.get('host') || '';
      const slug = this.extractCompanySlug(host);
      
      let companyJobs = null;
      let companyName = slug;

      if (slug) {
        try {
          // Buscar vagas da empresa
          companyJobs = await this.appService.getCompanyJobs(slug);
        } catch (error) {
          console.error('Erro ao buscar vagas da empresa:', error);
          // Se não conseguir buscar as vagas, continua sem elas
        }
      }

      const html = this.reactSsr.render(slug, companyJobs);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error('Erro ao renderizar home:', error);
      res.status(500).send('Erro interno do servidor');
    }
  }

  @Get('health')
  getHealth(): string {
    return 'OK';
  }

  private extractCompanySlug(host: string): string | null {
    // Exemplo: gupy.jobs.localhost -> gupy
    // Exemplo: empresa.jobs.localhost -> empresa
    const parts = host.split('.');
    
    if (parts.length >= 3 && parts[1] === 'jobs') {
      return parts[0];
    }
    
    return null;
  }
}
