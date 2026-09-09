"use client";

import type { IconSvgElement } from "@hugeicons/react";

import {
  ArrowDown01Icon,
  ArrowLeftDoubleIcon,
  ArrowRightDoubleIcon,
  ArrowUpDownIcon,
  Cancel01Icon,
  Call02Icon,
  CheckmarkBadge01Icon,
  CheckmarkCircle01Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterHorizontalIcon,
  ClipboardListIcon as ClipboardListStroke,
  Copy01Icon,
  CreditCardIcon,
  Calendar03Icon,
  EyeIcon,
  Delete02Icon,
  ImageNotFound01Icon,
  Invoice01Icon,
  Globe02Icon,
  Home01Icon as HomeStroke,
  Logout01Icon,
  Menu01Icon,
  MoreVerticalIcon,
  Notification01Icon,
  Package01Icon as PackageStroke,
  SidebarLeftIcon,
  Settings01Icon as SettingsStroke,
  ShoppingBag01Icon as ShoppingBagStroke,
  ShoppingBagAddIcon,
  Download03Icon,
  SparklesIcon as SparklesStroke,
  Store03Icon as StoreStroke,
  Wallet01Icon as WalletStroke,
  WarehouseIcon as WarehouseStroke,
} from "@hugeicons-pro/core-stroke-rounded";

import {
  ArrowDown01Icon as ArrowDown01Solid,
  ArrowUp01Icon as ArrowUp01Solid,
  ClipboardListIcon as ClipboardListSolid,
  Home01Icon as HomeSolid,
  Package01Icon as PackageSolid,
  PackageDeliveredIcon,
  PackageOpenIcon,
  PackageProcessIcon,
  PackageRemoveIcon,
  Settings01Icon as SettingsSolid,
  ShoppingBag01Icon as ShoppingBagSolid,
  SparklesIcon as SparklesSolid,
  Store03Icon as StoreSolid,
  Wallet01Icon as WalletSolid,
  WarehouseIcon as WarehouseSolid,
} from "@hugeicons-pro/core-solid-rounded";

export type HugeNavIconPair = {
  stroke: IconSvgElement;
  solid: IconSvgElement;
};

const pair = (
  stroke: IconSvgElement,
  solid: IconSvgElement
): HugeNavIconPair => ({ stroke, solid });

/** Sidebar / mobile tab nav — stroke idle, solid active. */
export const navIcons = {
  home: pair(HomeStroke, HomeSolid),
  products: pair(ShoppingBagStroke, ShoppingBagSolid),
  orders: pair(ClipboardListStroke, ClipboardListSolid),
  earnings: pair(WalletStroke, WalletSolid),
  settings: pair(SettingsStroke, SettingsSolid),
  productPages: pair(PackageStroke, PackageSolid),
  inventory: pair(WarehouseStroke, WarehouseSolid),
  sparkles: pair(SparklesStroke, SparklesSolid),
  store: pair(StoreStroke, StoreSolid),
} as const satisfies Record<string, HugeNavIconPair>;

export type NavIconKey = keyof typeof navIcons;

/** Chrome / utility icons (stroke-rounded). */
export const uiIcons = {
  chevronLeft: ChevronLeftIcon,
  chevronRight: ChevronRightIcon,
  globe: Globe02Icon,
  store: StoreStroke,
  check: CheckmarkCircle01Icon,
  chevronsUpDown: ArrowUpDownIcon,
  account: CheckmarkBadge01Icon,
  billing: CreditCardIcon,
  notifications: Notification01Icon,
  logout: Logout01Icon,
  menu: Menu01Icon,
  more: MoreVerticalIcon,
  panelLeft: SidebarLeftIcon,
  close: Cancel01Icon,
  chevronDown: ArrowDown01Icon,
  arrowUp: ArrowUp01Solid,
  arrowDown: ArrowDown01Solid,
  chevronsLeft: ArrowLeftDoubleIcon,
  chevronsRight: ArrowRightDoubleIcon,
  columns: FilterHorizontalIcon,
  view: EyeIcon,
  delete: Delete02Icon,
  copy: Copy01Icon,
  calendar: Calendar03Icon,
  imageEmpty: ImageNotFound01Icon,
  newOrder: ShoppingBagAddIcon,
  download: Download03Icon,
  phone: Call02Icon,
  wallet: WalletStroke,
  walletSolid: WalletSolid,
  inventory: WarehouseStroke,
  invoice: Invoice01Icon,
  packageOpen: PackageOpenIcon,
  packageProcess: PackageProcessIcon,
  packageDelivered: PackageDeliveredIcon,
  packageRemove: PackageRemoveIcon,
} as const satisfies Record<string, IconSvgElement>;
