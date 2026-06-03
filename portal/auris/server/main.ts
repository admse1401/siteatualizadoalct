import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import express from 'express';
import path from 'path';
import { readFileSync } from 'fs';
import { ExpressAdapter } from '@nestjs/platform-express';

async function bootstrap() {
  const server = express();

  server.use(express.json({ limit: '30mb' }));
  server.use(express.urlencoded({ extended: true, limit: '30mb' }));

  // Vite middleware MUST be registered before NestJS initializes its router.
  // If added after app.init(), NestJS's 404 exception filter catches all
  // unmatched routes (including SPA paths like "/dashboard") before Vite.
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom', // no built-in HTML serving; we handle SPA fallback below
    });
    server.use(vite.middlewares);

    // SPA fallback: for any non-/api route, transform and serve index.html
    server.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req.path.startsWith('/api')) return next();
      try {
        const template = readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
        const html = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        (vite as any).ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    bodyParser: false,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors();

  await app.init();

  const PORT = 3000;

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    server.use(express.static(distPath));
    server.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

bootstrap();
