
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChannelOrder, OrderStatus } from "@/types/payment";
import { DateRange } from "react-day-picker";

export const useOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [selectedOrder, setSelectedOrder] = useState<ChannelOrder | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['channel-orders', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('channel_orders')
        .select(`
          *,
          payment_channels (
            name,
            code
          )
        `)
        .order('created_at', { ascending: false });

      if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        const endDate = new Date(dateRange.to);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt('created_at', endDate.toISOString());
      }

      const { data, error } = await query.returns<ChannelOrder[]>();
      if (error) throw error;
      return data || [];
    }
  });

  const filteredOrders = orders?.filter(order =>
    (searchTerm ? order.order_no.toLowerCase().includes(searchTerm.toLowerCase()) : true) &&
    (statusFilter === "all" ? true : order.status === statusFilter)
  );

  return {
    orders,
    filteredOrders,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedOrder,
    setSelectedOrder,
    dateRange,
    setDateRange
  };
};
