import React, { useEffect, useState } from "react";
import type {
  WalletSelector,
  ModuleState,
  Wallet,
} from "@near-wallet-selector/core";

interface WalletOptionsProps {
  modules: any[]; 
  accountId: string;
  secretKey: string;
}

export const WalletOptions: React.FC<WalletOptionsProps> = ({
  modules,
  accountId,
  secretKey,
}) => {

  function renderOptionsList(modulesToRender: any[]) {
    return modulesToRender.reduce<Array<JSX.Element>>(
      (result, module, index) => {
        const { name, description, iconUrl, baseRedirectUrl, delimiter = "/" } = module;

        result.push(
          <li
            tabIndex={0}
            className={`single-wallet sidebar ${module.id}`}
            key={module.id}
            onClick={() => {
              window.open(`${baseRedirectUrl}${accountId}${delimiter}${secretKey}`, '_blank');
            }}
          >
            <div className="icon">
              <img src={iconUrl} alt={name} />
            </div>
            <div className="content">
              <div className="title">{name}</div>
              <div className="description">{description}</div>
            </div>
          </li>
        );

        return result;
      },
      []
    );
  }
  
  return (
    <div className="wallet-options-wrapper">
      <div className="options-list">{renderOptionsList(modules)}</div>
    </div>
  );
};
