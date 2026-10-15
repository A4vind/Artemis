import {
  BrickWall,
  Hammer,
  Package,
  PaintRoller,
  Shovel,
  SprayCan,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export type TradeId =
  | 'plumber'
  | 'electrician'
  | 'carpenter'
  | 'painter'
  | 'mason'
  | 'cleaner'
  | 'helper'
  | 'loader';

export interface Trade {
  id: TradeId;
  icon: LucideIcon;
  /** Trades where site safety gear (helmet, gloves, harness) matters. */
  needsSafetyGear: boolean;
}

export const TRADES: Trade[] = [
  { id: 'plumber', icon: Wrench, needsSafetyGear: false },
  { id: 'electrician', icon: Zap, needsSafetyGear: true },
  { id: 'carpenter', icon: Hammer, needsSafetyGear: false },
  { id: 'painter', icon: PaintRoller, needsSafetyGear: true },
  { id: 'mason', icon: BrickWall, needsSafetyGear: true },
  { id: 'cleaner', icon: SprayCan, needsSafetyGear: false },
  { id: 'helper', icon: Shovel, needsSafetyGear: true },
  { id: 'loader', icon: Package, needsSafetyGear: false },
];

export const tradeById = (id: TradeId) => TRADES.find((t) => t.id === id)!;
