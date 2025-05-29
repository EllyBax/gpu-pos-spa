"use client"

import type React from "react"

import { createContext, useContext, useReducer, type ReactNode, useEffect } from "react"
import type { GPU } from "./cart-context"

interface InventoryState {
  gpus: GPU[]
}

type InventoryAction =
  | { type: "SET_GPUS"; payload: GPU[] }
  | { type: "UPDATE_STOCK"; payload: { id: string; stock: number } }
  | { type: "ADD_GPU"; payload: GPU }
  | { type: "REMOVE_GPU"; payload: string }

const InventoryContext = createContext<{
  state: InventoryState
  dispatch: React.Dispatch<InventoryAction>
} | null>(null)

const initialGPUs: GPU[] = [
  {
    id: "1",
    name: "GeForce RTX 4090",
    manufacturer: "NVIDIA",
    model: "RTX 4090",
    memory: "24GB GDDR6X",
    price: 1599,
    stock: 15,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "2",
    name: "GeForce RTX 4080",
    manufacturer: "NVIDIA",
    model: "RTX 4080",
    memory: "16GB GDDR6X",
    price: 1199,
    stock: 22,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "3",
    name: "Radeon RX 7900 XTX",
    manufacturer: "AMD",
    model: "RX 7900 XTX",
    memory: "24GB GDDR6",
    price: 999,
    stock: 18,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "4",
    name: "GeForce RTX 4070 Ti",
    manufacturer: "NVIDIA",
    model: "RTX 4070 Ti",
    memory: "12GB GDDR6X",
    price: 799,
    stock: 30,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "5",
    name: "Radeon RX 7800 XT",
    manufacturer: "AMD",
    model: "RX 7800 XT",
    memory: "16GB GDDR6",
    price: 649,
    stock: 25,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "6",
    name: "GeForce RTX 4060 Ti",
    manufacturer: "NVIDIA",
    model: "RTX 4060 Ti",
    memory: "16GB GDDR6",
    price: 499,
    stock: 40,
    image: "/placeholder.svg?height=200&width=300",
  },
]

function inventoryReducer(state: InventoryState, action: InventoryAction): InventoryState {
  switch (action.type) {
    case "SET_GPUS":
      return { gpus: action.payload }
    case "UPDATE_STOCK":
      return {
        gpus: state.gpus.map((gpu) => (gpu.id === action.payload.id ? { ...gpu, stock: action.payload.stock } : gpu)),
      }
    case "ADD_GPU":
      return { gpus: [...state.gpus, action.payload] }
    case "REMOVE_GPU":
      return { gpus: state.gpus.filter((gpu) => gpu.id !== action.payload) }
    default:
      return state
  }
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(inventoryReducer, { gpus: [] })

  useEffect(() => {
    // Load inventory from localStorage or use initial data
    const savedInventory = localStorage.getItem("gpu-inventory")
    if (savedInventory) {
      dispatch({ type: "SET_GPUS", payload: JSON.parse(savedInventory) })
    } else {
      dispatch({ type: "SET_GPUS", payload: initialGPUs })
    }
  }, [])

  useEffect(() => {
    // Save inventory to localStorage whenever it changes
    if (state.gpus.length > 0) {
      localStorage.setItem("gpu-inventory", JSON.stringify(state.gpus))
    }
  }, [state.gpus])

  return <InventoryContext.Provider value={{ state, dispatch }}>{children}</InventoryContext.Provider>
}

export function useInventory() {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider")
  }
  return context
}
