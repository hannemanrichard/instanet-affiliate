export type ZrLocationOption = {
  value: string;
  label: string;
};

export type ZrWilayaOption = ZrLocationOption & {
  homeFee: number;
  deskFee: number;
  estimatedDeliveryTime: string;
};

export type ZrCommuneOption = ZrLocationOption & {
  parentId: string;
  hasAgency?: boolean;
};

export type ZrAgencyOption = ZrLocationOption & {
  parentId: string;
};

// Static ZR location datasets (allowJs)
import { wilayasZr as wilayasRaw } from "@/shared/data/wilayasZr";
import { communesZr as communesRaw } from "@/shared/data/communesZr";
import { agenciesZr as agenciesRaw } from "@/shared/data/agenciesZr";

export const wilayasZr = wilayasRaw as ZrWilayaOption[];
export const communesZr = communesRaw as ZrCommuneOption[];
export const agenciesZr = agenciesRaw as ZrAgencyOption[];

export const getCommunesByWilaya = (
  wilayaId: string,
  options?: { requireAgency?: boolean }
): ZrCommuneOption[] => {
  if (!wilayaId) return [];

  return communesZr.filter((commune) => {
    if (commune.parentId !== wilayaId) return false;
    if (options?.requireAgency) return commune.hasAgency === true;
    return true;
  });
};

export const getAgenciesByCommune = (communeId: string): ZrAgencyOption[] => {
  if (!communeId) return [];
  return agenciesZr.filter((agency) => agency.parentId === communeId);
};

export const findWilaya = (wilayaId: string) =>
  wilayasZr.find((item) => item.value === wilayaId);

export const findWilayaLabel = (wilayaId: string) =>
  findWilaya(wilayaId)?.label;

export const findCommuneLabel = (communeId: string) =>
  communesZr.find((item) => item.value === communeId)?.label;

export const findAgencyLabel = (agencyId: string) =>
  agenciesZr.find((item) => item.value === agencyId)?.label;

export const getDeliveryFeeForWilaya = (
  wilayaId: string,
  isStopdesk: boolean
): number | undefined => {
  const wilaya = findWilaya(wilayaId);
  if (!wilaya) return undefined;
  return isStopdesk ? wilaya.deskFee : wilaya.homeFee;
};
