# SyncAvatar AI - Full Stack Prototype

Aplicativo web para transformar imagens estáticas em avatares falantes usando IA (MediaPipe) e processamento de áudio.

## 🚀 Como Executar

Este projeto requer que você rode o Backend (Python) e o Frontend (React) simultaneamente.

### 1. Iniciar o Backend (Servidor Python + IA)

Certifique-se de ter Python 3.9+ instalado.

```bash
cd backend

# Criar ambiente virtual (recomendado)
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências de IA e Servidor
pip install -r requirements.txt

# INICIAR O SERVIDOR
# Importante: host 0.0.0.0 garante acesso da rede local/containers
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Se vir mensagens sobre "MediaPipe" ou "Uvicorn running", está funcionando.

### 2. Iniciar o Frontend (React)

Abra **outro terminal**:

```bash
# Na pasta raiz do projeto
npm install
npm start
```

O aplicativo abrirá em `http://localhost:3000`.

## 🧠 Como a IA Funciona

1.  **Visão Computacional**: O backend usa `MediaPipe Face Mesh` para criar um mapa de 468 pontos do rosto da imagem enviada.
2.  **Análise de Áudio**: A biblioteca `Librosa` analisa a amplitude (volume) do áudio quadro a quadro.
3.  **Sincronização**: Um algoritmo proprietário desloca os pixels da mandíbula inferior verticalmente baseado na intensidade do som, simulando a fala, enquanto preenche a cavidade bucal artificialmente.
4.  **Geração de Vídeo**: `MoviePy` e `FFmpeg` compilam os frames processados e o áudio original em um arquivo MP4 final.

## ⚠️ Solução de Problemas

*   **Erro "Não foi possível conectar ao servidor"**: Certifique-se de que o terminal do backend está aberto e rodando sem erros. Verifique se a porta 8000 não está em uso.
*   **Erro de ffmpeg**: Se o backend reclamar de ffmpeg, certifique-se de que ele está instalado no sistema ou que a biblioteca `imageio-ffmpeg` (instalada via moviepy) está funcionando.
