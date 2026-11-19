# Deploy na VPS

A API e o site sobem com Docker Compose e ficam acessíveis só dentro da VPS (`127.0.0.1`). O proxy reverso que já roda na VPS publica os dois com HTTPS.

## Primeira vez

```bash
git clone https://github.com/SEU-USUARIO/car-na-mao.git
cd car-na-mao
cp .env.example .env        # defina POSTGRES_PASSWORD, portas, CORS e links
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec api node dist/database/seed.js   # dados de demonstração
curl http://127.0.0.1:3010/health
```

As migrações rodam sozinhas a cada inicialização da API.

## Atualizar

```bash
./scripts/deploy.sh
```

## Proxy reverso

Aponte dois subdomínios para a VPS, por exemplo `api.carnamao.seudominio.com.br` e `carnamao.seudominio.com.br`.

**Nginx** (com Certbot para o HTTPS):

```nginx
server {
  server_name api.carnamao.seudominio.com.br;
  client_max_body_size 5m;
  location / { proxy_pass http://127.0.0.1:3010; proxy_set_header Host $host; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; }
}
server {
  server_name carnamao.seudominio.com.br;
  location / { proxy_pass http://127.0.0.1:3011; proxy_set_header Host $host; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; }
}
```

**Caddy** (HTTPS automático):

```
api.carnamao.seudominio.com.br {
  reverse_proxy 127.0.0.1:3010
}
carnamao.seudominio.com.br {
  reverse_proxy 127.0.0.1:3011
}
```

## App apontando para produção

Em `apps/mobile/.env`: `EXPO_PUBLIC_API_URL=https://api.carnamao.seudominio.com.br`.

## Backup do banco

```bash
docker compose -f docker-compose.prod.yml exec db pg_dump -U carnamao carnamao | gzip > backup-$(date +%F).sql.gz
```
