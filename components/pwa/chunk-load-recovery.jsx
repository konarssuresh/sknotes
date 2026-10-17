"use client";

import { useEffect } from "react";

import {
  clearChunkAutoReloadFlag,
  installChunkLoadRecovery,
} from "@/lib/pwa/chunk-load-recovery";

export function ChunkLoadRecovery() {
  useEffect(() => {
    clearChunkAutoReloadFlag();
    installChunkLoadRecovery();
  }, []);

  return null;
}
