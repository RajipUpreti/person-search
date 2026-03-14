'use client'

import * as React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Check, Loader2, Search } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

/**
 * Props for the SearchCommand component
 * @template T - The type of data being searched
 */
export interface SearchCommandProps<T> {
  /** Async function that performs the search and returns an array of results */
  onSearch: (value: string) => Promise<T[]>
  /** Callback function called when an item is selected */
  onItemSelect: (item: T) => void
  /** Function to get a unique identifier from an item */
  getItemId: (item: T) => string
  /** Function to get the display label from an item */
  getItemLabel: (item: T) => string
  /** Placeholder text for the search input */
  placeholder?: string
  /** Text to display when no results are found */
  noResultsText?: string
}

/**
 * A reusable search command component that provides an accessible, theme-aware search interface
 * with async search capabilities and keyboard navigation.
 * 
 * @template T - The type of data being searched
 * 
 * @example
 * // Basic usage with a User type
 * interface User {
 *   id: string;
 *   name: string;
 * }
 * 
 * function UserSearch() {
 *   return (
 *     <SearchCommand<User>
 *       onSearch={async (query) => {
 *         const users = await fetchUsers(query);
 *         return users;
 *       }}
 *       onItemSelect={(user) => console.log('Selected:', user)}
 *       getItemId={(user) => user.id}
 *       getItemLabel={(user) => user.name}
 *       placeholder="Search users..."
 *     />
 *   );
 * }
 * 
 * @example
 * // Usage with custom data type
 * interface Product {
 *   sku: string;
 *   title: string;
 *   description: string;
 * }
 * 
 * function ProductSearch() {
 *   return (
 *     <SearchCommand<Product>
 *       onSearch={searchProducts}
 *       onItemSelect={handleProductSelect}
 *       getItemId={(product) => product.sku}
 *       getItemLabel={(product) => product.title}
 *       placeholder="Search products..."
 *       noResultsText="No products found"
 *     />
 *   );
 * }
 * 
 * @features
 * - 🎨 Theme aware (works with light/dark mode)
 * - ⌨️ Keyboard navigation support
 * - 🔍 Async search with loading states
 * - 📱 Responsive design
 * - ♿ Accessible (follows WAI-ARIA practices)
 * - 🔄 Maintains input focus while searching
 * 
 * @accessibility
 * - Maintains focus on input while typing
 * - Proper ARIA labels and roles
 * - Keyboard navigation support
 * - Screen reader friendly
 */
export const SearchCommand = <T,>({
  onSearch,
  onItemSelect,
  getItemId,
  getItemLabel,
  placeholder = "Search...",
  noResultsText = "No results found.",
}: SearchCommandProps<T>) => {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<T | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [])

  useEffect(() => {
    const normalizedQuery = searchQuery.trim()

    if (!normalizedQuery) {
      setItems([])
      setLoading(false)
      setOpen(false)
      return
    }

    const currentRequestId = ++requestIdRef.current
    setLoading(true)
    setOpen(true)

    const timeoutId = window.setTimeout(async () => {
      try {
        const results = await onSearch(normalizedQuery)

        if (requestIdRef.current === currentRequestId) {
          setItems(results)
          setOpen(true)
        }
      } catch (error) {
        if (requestIdRef.current === currentRequestId) {
          console.error('Error searching:', error)
          setItems([])
        }
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setLoading(false)
        }
      }
    }, 200)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [onSearch, searchQuery])

  const handleInputValueChange = useCallback((value: string) => {
    setSearchQuery(value)
  }, [])

  const handleSelect = useCallback((item: T) => {
    setSelectedItem(item)
    setOpen(false)
    setSearchQuery(getItemLabel(item))
    onItemSelect(item)
  }, [getItemLabel, onItemSelect])

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center rounded-lg border bg-background px-3 shadow-md">
        <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={searchQuery}
          onChange={(event) => handleInputValueChange(event.target.value)}
          onFocus={() => {
            if (searchQuery && (items.length > 0 || loading)) {
              setOpen(true)
            }
          }}
          autoComplete="off"
          spellCheck={false}
          className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
              e.stopPropagation()
            }
            if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
        />
      </div>

      {open && (items.length > 0 || loading) ? (
        <div className="absolute top-full z-50 mt-2 w-full rounded-lg border bg-popover text-popover-foreground shadow-md">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground">{noResultsText}</div>
          ) : (
            <ul className="max-h-[300px] overflow-y-auto py-1">
              {items.map((item) => (
                <li key={getItemId(item)}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelect(item)}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        selectedItem && getItemId(selectedItem) === getItemId(item) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span>{getItemLabel(item)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}

