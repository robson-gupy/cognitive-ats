# Home em React com Server-Side Rendering (SSR)

Este projeto implementa uma home page moderna em React que é renderizada no backend usando NestJS com Server-Side Rendering (SSR).

## 🚀 Funcionalidades

- **Header responsivo** com navegação e botão de login
- **Hero section** com call-to-action principal
- **Seção de recursos** destacando os benefícios da plataforma
- **Seção de estatísticas** com números impressionantes
- **Call-to-action final** para conversão
- **Footer completo** com links e informações da empresa

## 🛠️ Tecnologias Utilizadas

- **React 19** - Biblioteca de UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework de CSS utilitário
- **NestJS** - Framework backend
- **Server-Side Rendering** - Renderização no servidor

## 📁 Estrutura dos Arquivos

```
src/
├── react/
│   ├── app.component.tsx    # Componente principal da home
│   └── react-ssr.service.ts # Serviço de renderização SSR
├── app.controller.ts         # Controller que renderiza a home
├── app.module.ts            # Módulo principal da aplicação
└── main.ts                  # Ponto de entrada da aplicação
```

## 🔧 Como Funciona

1. **Requisição HTTP**: Quando um usuário acessa a rota raiz (`/`), o `AppController` é acionado
2. **Renderização SSR**: O `ReactSsrService` renderiza o componente React para HTML usando `renderToString`
3. **HTML Completo**: O HTML é retornado com CSS do Tailwind e scripts de interatividade
4. **Resposta**: O usuário recebe uma página completa e funcional

## 🎨 Estilização

A home utiliza **Tailwind CSS** via CDN para:
- Layout responsivo e moderno
- Cores consistentes com a marca (indigo)
- Componentes interativos com hover effects
- Design mobile-first

## 🚀 Como Executar

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Executar em desenvolvimento**:
   ```bash
   npm run start:dev
   ```

3. **Acessar a aplicação**:
   ```
   http://localhost:3000
   ```

## 📱 Responsividade

A home é totalmente responsiva e funciona perfeitamente em:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🔄 Interatividade

Embora seja renderizada no servidor, a home inclui:
- Eventos de clique nos botões
- Efeitos hover na navegação
- Logs de interação no console
- Preparação para funcionalidades futuras

## 🎯 Próximos Passos

Para expandir a funcionalidade, considere:
- Adicionar roteamento client-side
- Implementar formulários funcionais
- Conectar com APIs reais
- Adicionar autenticação
- Implementar busca de vagas

## 📚 Recursos Adicionais

- [Documentação do NestJS](https://docs.nestjs.com/)
- [Documentação do React](https://react.dev/)
- [Documentação do Tailwind CSS](https://tailwindcss.com/docs)
- [Server-Side Rendering com React](https://react.dev/reference/react-dom/server)
