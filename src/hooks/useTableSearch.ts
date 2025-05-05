
import { useState, useEffect, useMemo } from "react";
import useDebounce from "@/hooks/useDebounce";

type SearchableField<T> = (item: T) => string | string;

type TableSearchOptions<T> = {
  data: T[];
  searchableFields: SearchableField<T>[];
  initialSortField?: keyof T | string;
  initialSortDirection?: "asc" | "desc";
  initialSearchQuery?: string;
  initialPage?: number;
  itemsPerPage?: number;
  initialFilterConfig?: { [key: string]: string };
};

type SortConfig = {
  field: string;
  direction: "asc" | "desc";
};

type FilterConfig = {
  [key: string]: string;
};

export const useTableSearch = <T>({
  data,
  searchableFields,
  initialSortField,
  initialSortDirection = "asc",
  initialSearchQuery = "",
  initialPage = 1,
  itemsPerPage = 10,
  initialFilterConfig = {},
}: TableSearchOptions<T>) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: initialSortField?.toString() || "",
    direction: initialSortDirection,
  });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>(initialFilterConfig);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    let result = [...data];

    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter((item) =>
        searchableFields.some((field) => {
          const value = typeof field === "function" ? field(item) : (item[field as keyof T] as string);
          return value?.toString().toLowerCase().includes(query);
        })
      );
    }

    Object.entries(filterConfig).forEach(([field, value]) => {
      if (value.trim()) {
        result = result.filter((item) => {
          const itemValue = (item[field as keyof T] as string | boolean)?.toString().toLowerCase();
          return itemValue?.includes(value.toLowerCase());
        });
      }
    });

    return result;
  }, [data, debouncedSearchQuery, filterConfig, searchableFields]);

  const sortedData = useMemo(() => {
    if (!filteredData || !sortConfig.field) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.field as keyof T] as string | number | boolean;
      const bValue = b[sortConfig.field as keyof T] as string | number | boolean;

      if (aValue == null || bValue == null) return 0;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return sortConfig.direction === "asc"
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }

      return sortConfig.direction === "asc"
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalCount = filteredData.length;

  useEffect(() => {
    if (currentPage > 1 && totalCount <= (currentPage - 1) * itemsPerPage) {
      setCurrentPage(1);
    }
  }, [totalCount, currentPage, itemsPerPage]);

  const toggleSort = (field: string) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const updateFilter = (field: string, value: string) => {
    setFilterConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(1);
  };

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    filteredData, // Full filtered dataset
    sortedData, // Sorted dataset
    paginatedData, // Paginated dataset
    totalCount,
    currentPage,
    setCurrentPage,
    sortConfig,
    toggleSort,
    filterConfig,
    updateFilter,
  };
};














// import { useState, useEffect, useMemo } from "react";
// import useDebounce from "@/hooks/useDebounce";

// type SearchableField<T> = (item: T) => string | string;

// type TableSearchOptions<T> = {
//   data: T[];
//   searchableFields: SearchableField<T>[];
//   initialSortField?: keyof T | string;
//   initialSortDirection?: "asc" | "desc";
//   initialSearchQuery?: string;
//   initialPage?: number;
//   itemsPerPage?: number;
//   initialFilterConfig?: { [key: string]: string };
// };

// type SortConfig = {
//   field: string;
//   direction: "asc" | "desc";
// };

// type FilterConfig = {
//   [key: string]: string;
// };

// export const useTableSearch = <T>({
//   data,
//   searchableFields,
//   initialSortField,
//   initialSortDirection = "asc",
//   initialSearchQuery = "",
//   initialPage = 1,
//   itemsPerPage = 10,
//   initialFilterConfig = {},
// }: TableSearchOptions<T>) => {
//   const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
//   const [sortConfig, setSortConfig] = useState<SortConfig>({
//     field: initialSortField?.toString() || "",
//     direction: initialSortDirection,
//   });
//   const [filterConfig, setFilterConfig] = useState<FilterConfig>(initialFilterConfig);
//   const [currentPage, setCurrentPage] = useState(initialPage);

//   const debouncedSearchQuery = useDebounce(searchQuery, 500);

//   const filteredData = useMemo(() => {
//     if (!data) return [];

//     let result = [...data];

//     if (debouncedSearchQuery.trim()) {
//       const query = debouncedSearchQuery.toLowerCase();
//       result = result.filter((item) =>
//         searchableFields.some((field) => {
//           const value = typeof field === "function" ? field(item) : (item[field as keyof T] as string);
//           return value?.toString().toLowerCase().includes(query);
//         })
//       );
//     }

//     Object.entries(filterConfig).forEach(([field, value]) => {
//       if (value.trim()) {
//         result = result.filter((item) => {
//           const itemValue = (item[field as keyof T] as string)?.toString().toLowerCase();
//           return itemValue?.includes(value.toLowerCase());
//         });
//       }
//     });

//     return result;
//   }, [data, debouncedSearchQuery, filterConfig]);

//   const sortedData = useMemo(() => {
//     if (!filteredData || !sortConfig.field) return filteredData;

//     return [...filteredData].sort((a, b) => {
//       const aValue = a[sortConfig.field as keyof T] as string | number;
//       const bValue = b[sortConfig.field as keyof T] as string | number;

//       if (aValue == null || bValue == null) return 0;

//       if (typeof aValue === "string" && typeof bValue === "string") {
//         return sortConfig.direction === "asc"
//           ? aValue.localeCompare(bValue)
//           : bValue.localeCompare(aValue);
//       }

//       return sortConfig.direction === "asc"
//         ? Number(aValue) - Number(bValue)
//         : Number(bValue) - Number(aValue);
//     });
//   }, [filteredData, sortConfig]);

//   const paginatedData = useMemo(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     return sortedData.slice(startIndex, startIndex + itemsPerPage);
//   }, [sortedData, currentPage, itemsPerPage]);

//   const totalCount = filteredData.length;

//   useEffect(() => {
//     if (currentPage > 1 && totalCount <= (currentPage - 1) * itemsPerPage) {
//       setCurrentPage(1);
//     }
//   }, [totalCount, currentPage, itemsPerPage]);

//   const toggleSort = (field: string) => {
//     setSortConfig((prev) => ({
//       field,
//       direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
//     }));
//   };

//   const updateFilter = (field: string, value: string) => {
//     setFilterConfig((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//     setCurrentPage(1);
//   };

//   return {
//     searchQuery,
//     setSearchQuery,
//     debouncedSearchQuery,
//     filteredData: paginatedData,
//     totalCount,
//     currentPage,
//     setCurrentPage,
//     sortConfig,
//     toggleSort,
//     filterConfig,
//     updateFilter,
//   };
// };

























// import { useState, useEffect, useMemo } from "react";
// import useDebounce from "@/hooks/useDebounce";

// type SearchableField<T> = (item: T) => string | string;

// type TableSearchOptions<T> = {
//   data: T[]; // Input data to filter and sort
//   searchableFields: SearchableField<T>[]; // Fields to search on
//   initialSortField?: keyof T | string; // Optional initial sort field
//   initialSortDirection?: "asc" | "desc"; // Optional initial sort direction
//   initialSearchQuery?: string; // Initial search query
//   initialPage?: number; // Initial page
//   itemsPerPage?: number; // Number of items per page
//   initialFilterConfig?: { [key: string]: string }; // Initial filter config
// };

// type SortConfig = {
//   field: string;
//   direction: "asc" | "desc";
// };

// type FilterConfig = {
//   [key: string]: string;
// };

// export const useTableSearch = <T>({
//   data,
//   searchableFields,
//   initialSortField,
//   initialSortDirection = "asc",
//   initialSearchQuery = "",
//   initialPage = 1,
//   itemsPerPage = 10,
//   initialFilterConfig = {},
// }: TableSearchOptions<T>) => {
//   const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
//   const [sortConfig, setSortConfig] = useState<SortConfig>({
//     field: initialSortField?.toString() || "",
//     direction: initialSortDirection,
//   });
//   const [filterConfig, setFilterConfig] = useState<FilterConfig>(initialFilterConfig);
//   const [currentPage, setCurrentPage] = useState(initialPage);

//   // Debounce the search query
//   const debouncedSearchQuery = useDebounce(searchQuery, 500);

//   // Filter data based on search query
//   const filteredData = useMemo(() => {
//     if (!data) return [];

//     let result = [...data];

//     // Apply search query
//     if (debouncedSearchQuery.trim()) {
//       const query = debouncedSearchQuery.toLowerCase();
//       result = result.filter((item) =>
//         searchableFields.some((field) => {
//           const value = typeof field === "function" ? field(item) : (item[field as keyof T] as string);
//           return value?.toString().toLowerCase().includes(query);
//         })
//       );
//     }

//     // Apply filters
//     Object.entries(filterConfig).forEach(([field, value]) => {
//       if (value.trim()) {
//         result = result.filter((item) => {
//           const itemValue = (item[field as keyof T] as string)?.toString().toLowerCase();
//           return itemValue?.includes(value.toLowerCase());
//         });
//       }
//     });

//     return result;
//   }, [data, debouncedSearchQuery, filterConfig]);

//   // Sort filtered data
//   const sortedData = useMemo(() => {
//     if (!filteredData || !sortConfig.field) return filteredData;

//     return [...filteredData].sort((a, b) => {
//       const aValue = a[sortConfig.field as keyof T] as string | number;
//       const bValue = b[sortConfig.field as keyof T] as string | number;

//       if (aValue == null || bValue == null) return 0;

//       if (typeof aValue === "string" && typeof bValue === "string") {
//         return sortConfig.direction === "asc"
//           ? aValue.localeCompare(bValue)
//           : bValue.localeCompare(aValue);
//       }

//       return sortConfig.direction === "asc"
//         ? Number(aValue) - Number(bValue)
//         : Number(bValue) - Number(aValue);
//     });
//   }, [filteredData, sortConfig]);

//   // Paginate sorted data
//   const paginatedData = useMemo(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     return sortedData.slice(startIndex, startIndex + itemsPerPage);
//   }, [sortedData, currentPage, itemsPerPage]);

//   // Calculate total count
//   const totalCount = filteredData.length;

//   // Reset to first page if filtered data changes significantly
//   useEffect(() => {
//     if (currentPage > 1 && totalCount <= (currentPage - 1) * itemsPerPage) {
//       setCurrentPage(1);
//     }
//   }, [totalCount, currentPage, itemsPerPage]);

//   // Handle sort toggle
//   const toggleSort = (field: string) => {
//     setSortConfig((prev) => ({
//       field,
//       direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
//     }));
//   };

//   // Handle filter change
//   const updateFilter = (field: string, value: string) => {
//     setFilterConfig((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//     setCurrentPage(1); // Reset to first page when filters change
//   };

//   return {
//     searchQuery,
//     setSearchQuery,
//     debouncedSearchQuery,
//     filteredData: paginatedData, // Return paginated data
//     totalCount, // Total number of filtered items
//     currentPage,
//     setCurrentPage,
//     sortConfig,
//     toggleSort,
//     filterConfig,
//     updateFilter,
//   };
// };









































// import { useState, useEffect } from "react";
// import useDebounce from "@/hooks/useDebounce";

// type TableSearchOptions<T> = {
//   initialSortField?: keyof T | string; // Optional initial sort field
//   initialSortDirection?: "asc" | "desc"; // Optional initial sort direction
//   initialSearchQuery?: string; // Initial search query from URL
//   initialPage?: number; // Initial page from URL
//   initialFilterConfig?: { [key: string]: string }; // Initial filter config from URL
// };

// type SortConfig = {
//   field: string;
//   direction: "asc" | "desc";
// };

// type FilterConfig = {
//   [key: string]: string;
// };

// export const useTableSearch = <T>({
//   initialSortField,
//   initialSortDirection = "asc",
//   initialSearchQuery = "",
//   initialPage = 1,
//   initialFilterConfig = {},
// }: TableSearchOptions<T>) => {
//   const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
//   const [sortConfig, setSortConfig] = useState<SortConfig>({
//     field: initialSortField?.toString() || "",
//     direction: initialSortDirection,
//   });
//   const [filterConfig, setFilterConfig] = useState<FilterConfig>(initialFilterConfig);
//   const [currentPage, setCurrentPage] = useState(initialPage);

//   // Debounce the search query
//   const debouncedSearchQuery = useDebounce(searchQuery, 500);

//   // Handle sort toggle
//   const toggleSort = (field: string) => {
//     setSortConfig((prev) => ({
//       field,
//       direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
//     }));
//   };

//   // Handle filter change
//   const updateFilter = (field: string, value: string) => {
//     setFilterConfig((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//     setCurrentPage(1); // Reset to first page when filters change
//   };

//   return {
//     searchQuery,
//     setSearchQuery,
//     debouncedSearchQuery, // Expose debounced search query for API calls
//     currentPage,
//     setCurrentPage,
//     sortConfig,
//     toggleSort,
//     filterConfig,
//     updateFilter,
//   };
// };





























































// // src/hooks/useTableSearch.ts
// import { useState, useEffect, useMemo } from "react";
// import useDebounce from "@/hooks/useDebounce";

// type TableSearchOptions<T> = {
//   data: T[];
//   searchableFields: (keyof T | ((item: T) => string))[]; // Fields to search in
//   initialSortField?: keyof T; // Optional initial sort field
//   initialSortDirection?: "asc" | "desc"; // Optional initial sort direction
// };

// type SortConfig = {
//   field: string;
//   direction: "asc" | "desc";
// };

// type FilterConfig = {
//   [key: string]: string | number | boolean;
// };

// export const useTableSearch = <T>({
//   data,
//   searchableFields,
//   initialSortField,
//   initialSortDirection = "asc",
// }: TableSearchOptions<T>) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [sortConfig, setSortConfig] = useState<SortConfig>({
//     field: initialSortField?.toString() || "",
//     direction: initialSortDirection,
//   });
//   const [filterConfig, setFilterConfig] = useState<FilterConfig>({});
//   const [currentPage, setCurrentPage] = useState(1);

//   // Debounce the search query
//   const debouncedSearchQuery = useDebounce(searchQuery, 300);

//   // Filter data based on search query and filters
//   const filteredData = useMemo(() => {
//     let result = [...data];

//     // Apply search
//     if (debouncedSearchQuery) {
//       const searchLower = debouncedSearchQuery.toLowerCase();
//       result = result.filter((item) =>
//         searchableFields.some((field) => {
//           if (typeof field === "function") {
//             return field(item).toLowerCase().includes(searchLower);
//           }
//           const value = item[field];
//           return value && typeof value === "string" && value.toLowerCase().includes(searchLower);
//         })
//       );
//     }

//     // Apply filters
//     Object.entries(filterConfig).forEach(([key, value]) => {
//       if (value) {
//         result = result.filter((item) => {
//           const itemValue = item[key as keyof T];
//           if (typeof itemValue === "string") {
//             return itemValue.toLowerCase().includes((value as string).toLowerCase());
//           }
//           return itemValue === value;
//         });
//       }
//     });

//     return result;
//   }, [data, debouncedSearchQuery, filterConfig, searchableFields]);

//   // Sort data
//   const sortedData = useMemo(() => {
//     if (!sortConfig.field) return filteredData;

//     return [...filteredData].sort((a, b) => {
//       const aValue = a[sortConfig.field as keyof T];
//       const bValue = b[sortConfig.field as keyof T];

//       if (typeof aValue === "string" && typeof bValue === "string") {
//         return sortConfig.direction === "asc"
//           ? aValue.localeCompare(bValue)
//           : bValue.localeCompare(aValue);
//       }
//       if (typeof aValue === "number" && typeof bValue === "number") {
//         return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
//       }
//       return 0;
//     });
//   }, [filteredData, sortConfig]);

//   // Total count of filtered items
//   const totalCount = filteredData.length;

//   // Handle sort toggle
//   const toggleSort = (field: string) => {
//     setSortConfig((prev) => ({
//       field,
//       direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
//     }));
//   };

//   // Handle filter change
//   const updateFilter = (field: string, value: string | number | boolean) => {
//     setFilterConfig((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//     setCurrentPage(1); // Reset to first page when filters change
//   };

//   return {
//     searchQuery,
//     setSearchQuery,
//     filteredData: sortedData, // Return sorted data without pagination
//     totalCount,
//     currentPage,
//     setCurrentPage,
//     sortConfig,
//     toggleSort,
//     filterConfig,
//     updateFilter,
//   };
// };





// // src/hooks/useTableSearch.ts
// import { useState, useEffect, useMemo } from "react";
// import useDebounce from "@/hooks/useDebounce";

// type TableSearchOptions<T> = {
//   data: T[];
//   searchableFields: (keyof T | ((item: T) => string))[]; // Fields to search in
//   initialSortField?: keyof T; // Optional initial sort field
//   initialSortDirection?: "asc" | "desc"; // Optional initial sort direction
//   itemsPerPage?: number; // Optional items per page for pagination
// };

// type SortConfig = {
//   field: string;
//   direction: "asc" | "desc";
// };

// type FilterConfig = {
//   [key: string]: string | number | boolean;
// };

// export const useTableSearch = <T>({
//   data,
//   searchableFields,
//   initialSortField,
//   initialSortDirection = "asc",
//   itemsPerPage = 10,
// }: TableSearchOptions<T>) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [sortConfig, setSortConfig] = useState<SortConfig>({
//     field: initialSortField?.toString() || "",
//     direction: initialSortDirection,
//   });
//   const [filterConfig, setFilterConfig] = useState<FilterConfig>({});
//   const [currentPage, setCurrentPage] = useState(1);

//   // Debounce the search query
//   const debouncedSearchQuery = useDebounce(searchQuery, 300);

//   // Filter data based on search query and filters
//   const filteredData = useMemo(() => {
//     let result = [...data];

//     // Apply search
//     if (debouncedSearchQuery) {
//       const searchLower = debouncedSearchQuery.toLowerCase();
//       result = result.filter((item) =>
//         searchableFields.some((field) => {
//           if (typeof field === "function") {
//             return field(item).toLowerCase().includes(searchLower);
//           }
//           const value = item[field];
//           return value && typeof value === "string" && value.toLowerCase().includes(searchLower);
//         })
//       );
//     }

//     // Apply filters
//     Object.entries(filterConfig).forEach(([key, value]) => {
//       if (value) {
//         result = result.filter((item) => {
//           const itemValue = item[key as keyof T];
//           if (typeof itemValue === "string") {
//             return itemValue.toLowerCase().includes((value as string).toLowerCase());
//           }
//           return itemValue === value;
//         });
//       }
//     });

//     return result;
//   }, [data, debouncedSearchQuery, filterConfig, searchableFields]);

//   // Sort data
//   const sortedData = useMemo(() => {
//     if (!sortConfig.field) return filteredData;

//     return [...filteredData].sort((a, b) => {
//       const aValue = a[sortConfig.field as keyof T];
//       const bValue = b[sortConfig.field as keyof T];

//       if (typeof aValue === "string" && typeof bValue === "string") {
//         return sortConfig.direction === "asc"
//           ? aValue.localeCompare(bValue)
//           : bValue.localeCompare(aValue);
//       }
//       if (typeof aValue === "number" && typeof bValue === "number") {
//         return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
//       }
//       return 0;
//     });
//   }, [filteredData, sortConfig]);

//   // Paginate data
//   const paginatedData = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return sortedData.slice(start, start + itemsPerPage);
//   }, [sortedData, currentPage, itemsPerPage]);

//   // Total count of filtered items
//   const totalCount = filteredData.length;

//   // Handle sort toggle
//   const toggleSort = (field: string) => {
//     setSortConfig((prev) => ({
//       field,
//       direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
//     }));
//   };

//   // Handle filter change
//   const updateFilter = (field: string, value: string | number | boolean) => {
//     setFilterConfig((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//     setCurrentPage(1); // Reset to first page when filters change
//   };

//   return {
//     searchQuery,
//     setSearchQuery,
//     filteredData: paginatedData,
//     totalCount,
//     currentPage,
//     setCurrentPage,
//     itemsPerPage,
//     sortConfig,
//     toggleSort,
//     filterConfig,
//     updateFilter,
//   };
// };