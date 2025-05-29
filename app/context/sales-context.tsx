"use client"

import type React from "react"

import { createContext, useContext, useReducer, type ReactNode, useEffect } from "react"
import type { CartItem } from "./cart-context"

export interface Sale {
  id: string
  date: string
  items: CartItem[]
  total: number
  customerInfo: {
    name: string
    email: string
    phone: string
    address: string
  }
  status: "pending" | "delivered" | "cancelled"
}

interface SalesState {
  sales: Sale[]
}

type SalesAction =
  | { type: "SET_SALES"; payload: Sale[] }
  | { type: "ADD_SALE"; payload: Sale }
  | { type: "UPDATE_SALE_STATUS"; payload: { id: string; status: Sale["status"] } }

const SalesContext = createContext<{
  state: SalesState
  dispatch: React.Dispatch<SalesAction>
} | null>(null)

function salesReducer(state: SalesState, action: SalesAction): SalesState {
  switch (action.type) {
    case "SET_SALES":
      return { sales: action.payload }
    case "ADD_SALE":
      return { sales: [...state.sales, action.payload] }
    case "UPDATE_SALE_STATUS":
      return {
        sales: state.sales.map((sale) =>
          sale.id === action.payload.id ? { ...sale, status: action.payload.status } : sale,
        ),
      }
    default:
      return state
  }
}

export function SalesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(salesReducer, { sales: [] })

  useEffect(() => {
    // Load sales from localStorage
    const savedSales = localStorage.getItem("gpu-sales")
    if (savedSales) {
      dispatch({ type: "SET_SALES", payload: JSON.parse(savedSales) })
    }
  }, [])

  useEffect(() => {
    // Save sales to localStorage whenever it changes
    localStorage.setItem("gpu-sales", JSON.stringify(state.sales))
  }, [state.sales])

  return <SalesContext.Provider value={{ state, dispatch }}>{children}</SalesContext.Provider>
}

export function useSales() {
  const context = useContext(SalesContext)
  if (!context) {
    throw new Error("useSales must be used within a SalesProvider")
  }
  return context
}
