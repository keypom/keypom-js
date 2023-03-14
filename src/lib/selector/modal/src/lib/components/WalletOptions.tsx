import React, { useEffect, useState } from "react";
import type {
  WalletSelector,
  ModuleState,
  Wallet,
} from "@near-wallet-selector/core";

interface WalletOptionsProps {
  handleWalletClick: (module: ModuleState) => void;
}

export const WalletOptions: React.FC<WalletOptionsProps> = ({
  handleWalletClick,
}) => {
  const [modules, setModules] = useState<Array<ModuleState>>([]);
  const [recentModules, setRecentModules] = useState<Array<ModuleState>>([]);
  const [moreModules, setMoreModules] = useState<Array<ModuleState>>([]);
  const [activeWalletId, setActiveWalletId] = useState("");

  return (
    <div>
      My Wallet Options LOL
    </div>
  );
};
