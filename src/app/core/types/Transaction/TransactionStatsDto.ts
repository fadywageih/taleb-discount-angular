export interface TransactionStatsDto {
  totalEarnings: number;
  totalOrders: number;
  pendingOrders: number;
  acceptedOrders: number;
  completedOrders: number;
  rejectedOrders: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  earningsGrowth: number;
}
