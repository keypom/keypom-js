import React, { useEffect, useState } from "react";
import type {
  WalletSelector,
  ModuleState,
  Wallet,
} from "@near-wallet-selector/core";
import { PostTrialModules, MODAL_DEFAULTS } from "../modal.types";

interface ModuleListProps {
  modulesTitle?: string;
  modules: PostTrialModules[];
  accountId: string;
  secretKey: string;
}

export const ModuleList: React.FC<ModuleListProps> = ({
  modulesTitle = MODAL_DEFAULTS.trialOver.moduleList.modulesTitle,
  modules,
  accountId,
  secretKey,
}) => {

  function renderOptionsList(modulesToRender: PostTrialModules[]) {
    return modulesToRender.reduce<Array<JSX.Element>>(
      (result, module, index) => {
        const { name, description, iconUrl, baseRedirectUrl, delimiter = "/" } = module;

        result.push(
          <li
            tabIndex={0}
            className={`single-wallet sidebar ${module.name}`}
            key={module.name}
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
    <div>
      <div className="modal-left-title">
        <h2>{modulesTitle}</h2>
      </div>
      <div className="wallet-options-wrapper">
        <div className="options-list">{renderOptionsList(modules)}</div>
      </div>
    </div>
  );
};
