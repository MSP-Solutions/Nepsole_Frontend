"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  Eye,
  FileText,
  MapPin,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export interface UserOrderItem {
  id: string;
  bookTitle: string;
  author: string;
  coverBg?: string;
  price: string;
  priceNumber: number;
  quantity: number;
}

export interface UserOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: "Pending" | "Processing" | "In Transit" | "Delivered" | "Cancelled";
  paymentMethod: "Cash on Delivery";
  paymentStatus: "Paid" | "Pending" | "Cancelled";
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
  trackingNumber?: string;
  courierName?: string;
  estimatedDelivery?: string;
  items: UserOrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
}

const initialUserOrders: UserOrder[] = [
  {
    id: "UORD-9942",
    orderNumber: "ORD-9942",
    orderDate: "2026-08-22 10:30 AM",
    status: "In Transit",
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pending",
    shippingAddress: "Maharajgunj - 4, Kathmandu, Nepal",
    recipientName: "Aarav Sharma",
    recipientPhone: "+977 9841-234567",
    trackingNumber: "PE-88421",
    courierName: "Pathao Express",
    estimatedDelivery: "Tomorrow, Aug 24 by 5:00 PM",
    items: [
      {
        id: "ITEM-1",
        bookTitle: "Palpasa Cafe",
        author: "Narayan Wagle",
        coverBg: "bg-indigo-600",
        price: "Rs. 550",
        priceNumber: 550,
        quantity: 1,
      },
      {
        id: "ITEM-2",
        bookTitle: "Seto Dharti",
        author: "Amar Neupane",
        coverBg: "bg-emerald-600",
        price: "Rs. 620",
        priceNumber: 620,
        quantity: 1,
      },
    ],
    subtotal: 1170,
    shippingFee: 50,
    discount: 50,
    total: 1170,
  },
  {
    id: "UORD-9881",
    orderNumber: "ORD-9881",
    orderDate: "2026-08-10 03:15 PM",
    status: "Delivered",
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Paid",
    shippingAddress: "Maharajgunj - 4, Kathmandu, Nepal",
    recipientName: "Aarav Sharma",
    recipientPhone: "+977 9841-234567",
    trackingNumber: "PE-77209",
    courierName: "Pathao Express",
    estimatedDelivery: "Aug 12, 2026",
    items: [
      {
        id: "ITEM-3",
        bookTitle: "Atomic Habits",
        author: "James Clear",
        coverBg: "bg-amber-600",
        price: "Rs. 850",
        priceNumber: 850,
        quantity: 1,
      },
      {
        id: "ITEM-4",
        bookTitle: "Karnali Blues",
        author: "Buddhisagar",
        coverBg: "bg-blue-600",
        price: "Rs. 650",
        priceNumber: 650,
        quantity: 2,
      },
    ],
    subtotal: 2150,
    shippingFee: 0,
    discount: 0,
    total: 2150,
  },
  {
    id: "UORD-9750",
    orderNumber: "ORD-9750",
    orderDate: "2026-07-28 11:45 AM",
    status: "Delivered",
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Paid",
    shippingAddress: "Maharajgunj - 4, Kathmandu, Nepal",
    recipientName: "Aarav Sharma",
    recipientPhone: "+977 9841-234567",
    trackingNumber: "PE-66102",
    courierName: "Nepal Post Courier",
    estimatedDelivery: "Jul 30, 2026",
    items: [
      {
        id: "ITEM-5",
        bookTitle: "The Psychology of Money",
        author: "Morgan Housel",
        coverBg: "bg-purple-600",
        price: "Rs. 850",
        priceNumber: 850,
        quantity: 1,
      },
    ],
    subtotal: 850,
    shippingFee: 50,
    discount: 50,
    total: 850,
  },
  {
    id: "UORD-9610",
    orderNumber: "ORD-9610",
    orderDate: "2026-07-14 09:20 AM",
    status: "Delivered",
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Paid",
    shippingAddress: "Maharajgunj - 4, Kathmandu, Nepal",
    recipientName: "Aarav Sharma",
    recipientPhone: "+977 9841-234567",
    trackingNumber: "PE-55019",
    courierName: "Pathao Express",
    estimatedDelivery: "Jul 16, 2026",
    items: [
      {
        id: "ITEM-6",
        bookTitle: "Summer Love",
        author: "Subin Bhattarai",
        coverBg: "bg-rose-600",
        price: "Rs. 520",
        priceNumber: 520,
        quantity: 2,
      },
      {
        id: "ITEM-7",
        bookTitle: "Saaya",
        author: "Subin Bhattarai",
        coverBg: "bg-teal-600",
        price: "Rs. 550",
        priceNumber: 550,
        quantity: 2,
      },
    ],
    subtotal: 2140,
    shippingFee: 60,
    discount: 100,
    total: 2100,
  },
  {
    id: "UORD-9502",
    orderNumber: "ORD-9502",
    orderDate: "2026-06-30 04:50 PM",
    status: "Cancelled",
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Cancelled",
    shippingAddress: "Maharajgunj - 4, Kathmandu, Nepal",
    recipientName: "Aarav Sharma",
    recipientPhone: "+977 9841-234567",
    items: [
      {
        id: "ITEM-8",
        bookTitle: "Rich Dad Poor Dad",
        author: "Robert Kiyosaki",
        coverBg: "bg-slate-700",
        price: "Rs. 750",
        priceNumber: 750,
        quantity: 1,
      },
    ],
    subtotal: 750,
    shippingFee: 50,
    discount: 0,
    total: 800,
  },
];

const FILTERS = [
  "All",
  "Active",
  "In Transit",
  "Delivered",
  "Cancelled",
] as const;
type Filter = (typeof FILTERS)[number];

const isActiveOrder = (status: UserOrder["status"]) =>
  ["Pending", "Processing", "In Transit"].includes(status);

const formatRs = (amount: number) => `Rs. ${amount.toLocaleString()}`;

const statusStyles: Record<UserOrder["status"], string> = {
  "In Transit": "bg-blue-50 text-blue-700 border-blue-200",
  Processing: "bg-amber-50 text-amber-700 border-amber-200",
  Pending: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

function StatusIcon({ status }: { status: UserOrder["status"] }) {
  const common = "h-3.5 w-3.5";
  if (status === "Delivered")
    return <CheckCircle2 className={`${common} text-emerald-600`} />;
  if (status === "Cancelled")
    return <XCircle className={`${common} text-rose-600`} />;
  if (status === "In Transit")
    return <Truck className={`${common} text-blue-600 animate-pulse`} />;
  return <Clock3 className={`${common} text-amber-600`} />;
}

function StatusBadge({ status }: { status: UserOrder["status"] }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusStyles[status]}`}
    >
      <StatusIcon status={status} />
      {status}
    </span>
  );
}

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: typeof ShoppingBag;
  iconClass: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400">{label}</p>
        <p className="mt-1 truncate text-xl font-extrabold text-slate-900 sm:text-2xl">
          {value}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-400">{helper}</p>
      </div>
      <div className={`ml-3 shrink-0 rounded-2xl border p-3 ${iconClass}`}>
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
    </div>
  );
}

function BookItem({ item }: { item: UserOrderItem }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200/70 bg-slate-50 p-3">
      <div
        className={`flex h-12 w-10 shrink-0 items-center justify-center rounded-lg text-white shadow-sm ${item.coverBg || "bg-indigo-600"}`}
      >
        <FileText className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-xs font-bold text-slate-900">
          {item.bookTitle}
        </h4>
        <p className="truncate text-[11px] text-slate-400">by {item.author}</p>
        <div className="mt-1 flex items-center justify-between gap-2 text-[11px]">
          <span className="text-slate-500">Qty: {item.quantity}</span>
          <span className="font-bold text-slate-900">{item.price}</span>
        </div>
      </div>
    </div>
  );
}

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<UserOrder[]>(initialUserOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Filter>("All");
  const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null);
  const [cancelOrder, setCancelOrder] = useState<UserOrder | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.orderNumber.toLowerCase().includes(query) ||
        order.trackingNumber?.toLowerCase().includes(query) ||
        order.items.some(
          (item) =>
            item.bookTitle.toLowerCase().includes(query) ||
            item.author.toLowerCase().includes(query),
        );

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && isActiveOrder(order.status)) ||
        order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    const active = orders.filter((order) => isActiveOrder(order.status)).length;
    const delivered = orders.filter(
      (order) => order.status === "Delivered",
    ).length;
    const spent = orders
      .filter((order) => order.status !== "Cancelled")
      .reduce((sum, order) => sum + order.total, 0);

    return {
      total: orders.length,
      active,
      delivered,
      spent,
    };
  }, [orders]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  const confirmCancel = () => {
    if (!cancelOrder) return;

    setOrders((current) =>
      current.map((order) =>
        order.id === cancelOrder.id
          ? { ...order, status: "Cancelled", paymentStatus: "Cancelled" }
          : order,
      ),
    );

    showToast(`Order #${cancelOrder.orderNumber} was cancelled.`);
    setCancelOrder(null);

    if (selectedOrder?.id === cancelOrder.id) {
      setSelectedOrder(null);
    }
  };

  return (
    <main className="-m-4 min-h-screen space-y-5 bg-[#f4f6fa] p-4 sm:-m-6 sm:p-6 lg:-m-8 lg:space-y-6 lg:p-8">
      {toast && (
        <div className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-white shadow-xl sm:left-auto sm:right-5 sm:inset-x-auto">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            My Orders
          </h1>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
            Track deliveries, view order details, and manage your book
            purchases.
          </p>
        </div>

        <Link
          href="/user/dashboard"
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ShoppingBag className="h-4 w-4 text-indigo-600" />
          Dashboard
        </Link>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <StatCard
          label="Total Orders"
          value={stats.total}
          helper="Lifetime orders"
          icon={ShoppingBag}
          iconClass="border-indigo-100 bg-indigo-50 text-indigo-600"
        />
        <StatCard
          label="Active Orders"
          value={stats.active}
          helper={stats.active ? "Currently on the way" : "Nothing in progress"}
          icon={Truck}
          iconClass="border-blue-100 bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Delivered"
          value={stats.delivered}
          helper="Successfully received"
          icon={CheckCircle2}
          iconClass="border-emerald-100 bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Total Spent"
          value={formatRs(stats.spent)}
          helper="Excluding cancelled orders"
          icon={CreditCard}
          iconClass="border-amber-100 bg-amber-50 text-amber-600"
        />
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xl">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search orders, books, authors, or tracking number..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-16 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-none lg:max-w-full">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition ${
                  statusFilter === filter
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {filter === "Active" ? "Active" : filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {filteredOrders.length === 0 ? (
        <section className="rounded-2xl border border-slate-100 bg-white px-5 py-14 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h2 className="text-base font-bold text-slate-800">
            No orders found
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
            Try a different search term or reset your filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 rounded-xl bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
          >
            Reset Filters
          </button>
        </section>
      ) : (
        <section className="space-y-4">
          {filteredOrders.map((order) => (
            <article
              key={order.id}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-extrabold text-slate-900">
                          Order #{order.orderNumber}
                        </h2>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
                        {order.orderDate} · {order.paymentMethod}
                      </p>
                    </div>
                  </div>

                  <div className="flex w-full gap-2 sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-50 px-3.5 py-2.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 sm:flex-none"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Details
                    </button>

                    {["Pending", "Processing"].includes(order.status) && (
                      <button
                        type="button"
                        onClick={() => setCancelOrder(order)}
                        className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                  {order.items.map((item) => (
                    <BookItem key={item.id} item={item} />
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-2 text-slate-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                    <span className="truncate">{order.shippingAddress}</span>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    {order.trackingNumber && (
                      <span className="hidden rounded bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-600 md:inline">
                        #{order.trackingNumber}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        showToast(
                          `Added ${order.items.length} book(s) from #${order.orderNumber} to cart.`,
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Buy Again
                    </button>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400">Total</span>
                      <p className="font-extrabold text-slate-900">
                        {formatRs(order.total)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {selectedOrder && (
        <Dialog open onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-3xl border border-slate-100 bg-white p-4 shadow-2xl sm:p-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-start justify-between gap-3 pr-6">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <DialogTitle className="truncate text-base font-extrabold text-slate-900 sm:text-lg">
                      Order #{selectedOrder.orderNumber}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-400">
                      Placed on {selectedOrder.orderDate}
                    </DialogDescription>
                  </div>
                </div>
                <StatusBadge status={selectedOrder.status} />
              </div>
            </div>

            {selectedOrder.status === "In Transit" && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-center gap-2 text-xs font-bold text-blue-900">
                    <Truck className="h-4 w-4 text-blue-600" />
                    {selectedOrder.courierName}
                  </p>
                  <span className="w-fit rounded bg-blue-100 px-2 py-1 font-mono text-[10px] font-bold text-blue-700">
                    #{selectedOrder.trackingNumber}
                  </span>
                </div>
                <p className="mt-2 text-xs text-blue-700">
                  Estimated delivery:{" "}
                  <strong>{selectedOrder.estimatedDelivery}</strong>
                </p>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Ordered Items ({selectedOrder.items.length})
              </h3>
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 border-b border-slate-100 p-3 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <BookItem item={item} />
                    </div>
                    <span className="shrink-0 text-xs font-bold text-slate-900">
                      {formatRs(item.priceNumber * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoCard icon={MapPin} title="Shipping Address">
                <p className="font-medium text-slate-700">
                  {selectedOrder.recipientName}
                </p>
                <p>{selectedOrder.shippingAddress}</p>
                <p className="font-mono">{selectedOrder.recipientPhone}</p>
              </InfoCard>

              <InfoCard icon={CreditCard} title="Payment Details">
                <p>
                  Method: <strong>{selectedOrder.paymentMethod}</strong>
                </p>
                <p>
                  Status:{" "}
                  <span className="font-bold text-emerald-600">
                    {selectedOrder.paymentStatus}
                  </span>
                </p>
              </InfoCard>
            </div>

            <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs">
              <PriceRow
                label="Items Subtotal"
                value={formatRs(selectedOrder.subtotal)}
              />
              <PriceRow
                label="Shipping Fee"
                value={formatRs(selectedOrder.shippingFee)}
              />
              {selectedOrder.discount > 0 && (
                <PriceRow
                  label="Discount Applied"
                  value={`- ${formatRs(selectedOrder.discount)}`}
                  highlight
                />
              )}
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold text-slate-900">
                <span>Total Paid</span>
                <span className="text-indigo-600">
                  {formatRs(selectedOrder.total)}
                </span>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  showToast(
                    `Invoice for #${selectedOrder.orderNumber} generated.`,
                  )
                }
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <Download className="h-4 w-4" />
                Download Invoice
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {cancelOrder && (
        <Dialog open onOpenChange={() => setCancelOrder(null)}>
          <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-3xl border border-slate-100 bg-white p-5 text-center shadow-2xl sm:p-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="mt-4 text-base font-extrabold text-slate-900">
              Cancel Order #{cancelOrder.orderNumber}?
            </DialogTitle>
            <DialogDescription className="mt-2 text-xs leading-5 text-slate-500">
              Are you sure you want to cancel this order? As this order is set to Cash on Delivery, no payment will be collected.
            </DialogDescription>

            <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setCancelOrder(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={confirmCancel}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700"
              >
                Yes, Cancel
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof MapPin;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-500">
      <h4 className="mb-2 flex items-center gap-1.5 font-bold text-slate-900">
        <Icon className="h-4 w-4 text-indigo-600" />
        {title}
      </h4>
      {children}
    </div>
  );
}

function PriceRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${highlight ? "text-emerald-600" : "text-slate-500"}`}
    >
      <span>{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
