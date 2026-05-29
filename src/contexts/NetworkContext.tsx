/**
 * NetworkContext.tsx
 * Provê estado de conectividade e pendências para toda a app.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { sincronizarFila } from '../lib/sync';
import { filaPendente } from '../lib/offline-queue';

interface NetworkContextData {
  online: boolean;
  pendentes: number;
  sincronizando: boolean;
  sincronizarAgora: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextData>({
  online: true,
  pendentes: 0,
  sincronizando: false,
  sincronizarAgora: async () => {},
});

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [online, setOnline] = useState(true);
  const [pendentes, setPendentes] = useState(0);
  const [sincronizando, setSincronizando] = useState(false);

  async function atualizarPendentes() {
    const n = await filaPendente();
    setPendentes(n);
  }

  async function sincronizarAgora() {
    setSincronizando(true);
    try {
      await sincronizarFila();
      await atualizarPendentes();
    } finally {
      setSincronizando(false);
    }
  }

  useEffect(() => {
    atualizarPendentes();

    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = !!(state.isConnected && state.isInternetReachable);
      setOnline(isOnline);

      if (isOnline) {
        sincronizarAgora();
      }
    });

    return unsubscribe;
  }, []);

  return (
    <NetworkContext.Provider value={{ online, pendentes, sincronizando, sincronizarAgora }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
