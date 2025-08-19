"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, X } from "lucide-react"

interface SearchFilters {
  searchTerm: string
  dateFrom: string
  dateTo: string
  status: "all" | "upcoming" | "today" | "past"
  sortBy: "date" | "name" | "subject"
  sortOrder: "asc" | "desc"
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void
  onClose: () => void
}

export default function AdvancedSearch({ onFiltersChange, onClose }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: "",
    dateFrom: "",
    dateTo: "",
    status: "all",
    sortBy: "date",
    sortOrder: "asc",
  })

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      searchTerm: "",
      dateFrom: "",
      dateTo: "",
      status: "all",
      sortBy: "date",
      sortOrder: "asc",
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Advanced Search & Filters
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or subject..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">From Date</label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">To Date</label>
            <Input type="date" value={filters.dateTo} onChange={(e) => handleFilterChange("dateTo", e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Appointments</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Sort By</label>
            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Visitor Name</SelectItem>
                <SelectItem value="subject">Subject</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Order</label>
            <Select value={filters.sortOrder} onValueChange={(value) => handleFilterChange("sortOrder", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={clearFilters}>
            Clear All Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
