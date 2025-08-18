// src/react/react-ssr.service.ts
import { Injectable } from '@nestjs/common';
import { renderToString } from 'react-dom/server';
import { App } from './app.component';
import React from 'react';

@Injectable()
export class ReactSsrService {
    render(): string {
        const content = renderToString(React.createElement(App));
        return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Gupy Candidates - Encontre as Melhores Oportunidades</title>
          <meta name="description" content="Conectamos candidatos talentosos com empresas inovadoras através de inteligência artificial." />
          <script src="https://cdn.tailwindcss.com"></script>
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    indigo: {
                      50: '#eef2ff',
                      100: '#e0e7ff',
                      600: '#4f46e5',
                      700: '#4338ca',
                    }
                  }
                }
              }
            }
          </script>
        </head>
        <body>
          <div id="root">${content}</div>
          <script>
            // Hydration script for interactive elements
            document.addEventListener('DOMContentLoaded', function() {
              // Add click handlers for buttons
              const buttons = document.querySelectorAll('button');
              buttons.forEach(button => {
                button.addEventListener('click', function() {
                  console.log('Button clicked:', this.textContent);
                  // Add your button logic here
                });
              });
              
              // Add hover effects for navigation
              const navLinks = document.querySelectorAll('nav a');
              navLinks.forEach(link => {
                link.addEventListener('mouseenter', function() {
                  this.style.color = '#1f2937';
                });
                link.addEventListener('mouseleave', function() {
                  this.style.color = '#6b7280';
                });
              });
            });
          </script>
        </body>
      </html>
    `;
    }
}
