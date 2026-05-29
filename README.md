# FluxorOps Mobile

App React Native (Expo) para montadores e entregadores da Lojas Perin.

## Funcionalidades

- Login por empresa + usuário + senha
- **Ponto eletrônico** (Entrada / Saída) com GPS + geocoding
- Pedidos do dia para montadores
- Entregas do dia para entregadores
- **Modo offline completo** — funciona sem internet

## Modo offline

O app usa duas camadas de persistência offline:

**1. Firestore Offline Persistence (automático)**
- O SDK do Firestore mantém um cache local SQLite
- Leituras funcionam do cache quando offline
- Gravações ficam enfileiradas e sincronizam automaticamente

**2. AsyncStorage (fila manual)**
- Operações críticas (ponto, status, observações) são salvas em uma fila local
- O `NetworkContext` detecta quando a internet volta e executa a fila
- Um banner vermelho/amarelo no topo indica status offline ou itens pendentes

### O que funciona sem internet
- ✅ Bater ponto (Entrada e Saída)
- ✅ Ver pedidos/entregas do dia (cache do dia anterior)
- ✅ Finalizar pedidos / atualizar status de entregas
- ✅ Salvar observações
- ✅ Ver histórico (cache Firestore)

## Instalação

```bash
npm install
npx expo start
```

## Dependências principais

- `firebase` — Firestore com offline persistence
- `@react-native-async-storage/async-storage` — fila offline
- `@react-native-community/netinfo` — detecção de conectividade
- `expo-location` — GPS para o ponto

## Build APK

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

## Configuração Firebase

Edite `src/lib/firebase.ts` com suas credenciais do Firebase Console.
