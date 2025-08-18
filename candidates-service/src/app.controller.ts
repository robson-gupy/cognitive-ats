// src/app.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReactSsrService } from './react/react-ssr.service';

@Controller()
export class AppController {
  constructor(private readonly reactSsr: ReactSsrService) {}

  @Get()
  async renderHome(@Res() res: Response) {
    try {
      const html = this.reactSsr.render();
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
}
