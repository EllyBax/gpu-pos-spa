// context/sales-context.tsx
"use-client";
import { createContext, useContext, useReducer, ReactNode } from "react";

// Updated Sale interface with paymentMethod and expanded status options
export interface Sale {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  paymentMethod: "stripe" | "cod"; // Cash on Delivery
  status: "pending" | "paid" | "delivered" | "cancelled";
}

// Assuming CartItem interface (update according to your actual CartItem type)
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

interface SalesState {
  sales: Sale[];
  totalRevenue: number;
}

type SalesAction =
  | { type: "ADD_SALE"; payload: Sale }
  | {
      type: "UPDATE_SALE_STATUS";
      payload: { id: string; status: Sale["status"] };
    }
  | { type: "LOAD_SALES"; payload: Sale[] };

const initialState: SalesState = {
  sales: [],
  totalRevenue: 0,
};

function salesReducer(state: SalesState, action: SalesAction): SalesState {
  switch (action.type) {
    case "ADD_SALE":
      return {
        ...state,
        sales: [...state.sales, action.payload],
        totalRevenue: state.totalRevenue + action.payload.total,
      };

    case "UPDATE_SALE_STATUS":
      return {
        ...state,
        sales: state.sales.map((sale) =>
          sale.id === action.payload.id
            ? { ...sale, status: action.payload.status }
            : sale
        ),
      };

    case "LOAD_SALES":
      return {
        ...state,
        sales: action.payload,
        totalRevenue: action.payload.reduce(
          (total, sale) => total + sale.total,
          0
        ),
      };

    default:
      return state;
  }
}

const SalesContext = createContext<{
  state: SalesState;
  dispatch: React.Dispatch<SalesAction>;
} | null>(null);

export function SalesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(salesReducer, initialState);

  return (
    <SalesContext.Provider value={{ state, dispatch }}>
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error("useSales must be used within a SalesProvider");
  }
  return context;
}
