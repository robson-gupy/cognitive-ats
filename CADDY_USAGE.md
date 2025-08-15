# Configuração para desenvolvimento local usando .localhost
# NÃO é necessário modificar o arquivo /etc/hosts
# O Caddy automaticamente resolve os subdomínios .localhost

# ========================================
# COMO FUNCIONA:
# ========================================
# O Caddy usa o padrão .localhost que é resolvido automaticamente
# pelo sistema operacional para 127.0.0.1 (localhost)
# 
# Exemplos de URLs que funcionam automaticamente:
# - http://gupy.admin.localhost (frontend da empresa Gupy)
# - http://empresa1.admin.localhost (frontend da empresa1)
# - http://gupy.api.localhost (API da empresa Gupy)
# - http://empresa1.api.localhost (API da empresa1)
# - http://ai.localhost (serviço de inteligência artificial)

# ========================================
# INSTRUÇÕES DE USO:
# ========================================

# 1. Inicie o Docker Compose: docker-compose up -d
# 2. Acesse os serviços através dos subdomínios .localhost
# 3. Não é necessário configurar o arquivo hosts

# ========================================
# EXEMPLOS DE ACESSO:
# ========================================

# Frontend:
# - http://gupy.admin.localhost (frontend da empresa Gupy)
# - http://empresa1.admin.localhost (frontend da empresa1)

# Backend/API:
# - http://gupy.api.localhost (API da empresa Gupy)
# - http://empresa1.api.localhost (API da empresa1)

# AI Service:
# - http://ai.localhost (serviço de inteligência artificial)

# ========================================
# NOTAS IMPORTANTES:
# ========================================

# - Os subdomínios são baseados no slug da empresa
# - O formato é sempre: slug-empresa.admin.localhost ou slug-empresa.api.localhost
# - O Caddy automaticamente roteia baseado no padrão do subdomínio
# - Para adicionar uma nova empresa, basta usar o novo slug no subdomínio
# - O .localhost é resolvido automaticamente pelo sistema operacional
