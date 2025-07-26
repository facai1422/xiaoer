
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, LayoutGrid, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStats } from "./components/OrderStats";
import { OrderCard } from "./components/OrderCard";
import { OrdersTable } from "./components/OrdersTable";
import { SearchFilterBar } from "./components/SearchFilterBar";
import { StatusUpdateDialog } from "./components/StatusUpdateDialog";
import { useOrders } from "./hooks/useOrders";

const ChannelOrdersPage = () => {
  const navigate = useNavigate();
  const [viewType, setViewType] = useState<"card" | "table">("card");
  const { 
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
  } = useOrders();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
        <div className="flex space-x-2">
          <Button 
            variant={viewType === "card" ? "default" : "outline"} 
            size="icon"
            onClick={() => setViewType("card")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewType === "table" ? "default" : "outline"} 
            size="icon"
            onClick={() => setViewType("table")}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出数据
          </Button>
        </div>
      </div>

      <OrderStats />

      <SearchFilterBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {isLoading ? (
        <div className="text-center py-8">加载中...</div>
      ) : !filteredOrders?.length ? (
        <div className="text-center py-8 text-gray-500">暂无订单数据</div>
      ) : viewType === "card" ? (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <OrderCard 
              key={order.id}
              order={order}
              onOpenStatusModal={setSelectedOrder}
            />
          ))}
        </div>
      ) : (
        <OrdersTable 
          orders={filteredOrders}
          onOpenStatusModal={setSelectedOrder}
        />
      )}

      <StatusUpdateDialog 
        selectedOrder={selectedOrder} 
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};

export default ChannelOrdersPage;
