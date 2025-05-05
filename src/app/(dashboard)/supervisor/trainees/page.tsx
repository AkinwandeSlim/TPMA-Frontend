"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { getSupervisorTrainees, verifyToken } from "@/lib/api"; // Import verifyToken
import Image from "next/image";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";

type Trainee = {
  id: string;
  regNo: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  bloodType: string;
  sex: "MALE" | "FEMALE";
  birthday: string;
  progress: number;
  img?: string;
  createdAt: string;
  supervisorId: string;
  supervisorName: string;
  placeOfTP: string;
};

// Function to get token from cookies
const getToken = (): string | null => {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1] || null;
  console.log("getToken:", token ? "present" : "missing");
  return token;
};

const SupervisorTraineesPage = () => {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterConfig, setFilterConfig] = useState<{ sex: string }>({ sex: "" });
  const [tempFilterConfig, setTempFilterConfig] = useState<{ sex: string }>({ sex: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: "asc" | "desc" }>({
    field: "name",
    direction: "asc",
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMountedRef = useRef(false);

  // Verify token and role on mount
  useEffect(() => {
    console.log("Auth verification useEffect running");
    const verifyAndFetch = async () => {
      try {
        const token = getToken();
        if (!token) {
          console.error("No token found");
          setError("Please sign in to view this page.");
          router.push("/auth/signin");
          return;
        }

        console.log("Verifying token");
        const response = await verifyToken();
        console.log("verifyToken response:", response);

        if (response.role !== "supervisor") {
          console.error("Unauthorized access: role is not supervisor");
          setError("Unauthorized access. Supervisor role required.");
          router.push("/unauthorized");
          return;
        }

        // Token verified, proceed to fetch trainees
        const page = parseInt(searchParams.get("page") || "1", 10);
        fetchTrainees(page, true);
      } catch (err: any) {
        console.error("Verification error:", err.message, err.stack);
        const errorMessage =
          err.message === "Your session has expired. Please log in again."
            ? err.message
            : "Failed to verify session. Please sign in.";
        setError(errorMessage);
        toast.error(errorMessage, { toastId: "verify-error" });
        router.push("/auth/signin");
      }
    };

    verifyAndFetch();
  }, [router, searchParams]);

  // Debounce the search query
  useEffect(() => {
    const handler = setTimeout(() => {
      console.log("Debouncing searchQuery:", searchQuery);
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch trainees
  const fetchTrainees = useCallback(
    async (page: number, resetPage: boolean = false, abortSignal?: AbortSignal) => {
      console.log(`Fetching trainees: page=${page}, resetPage=${resetPage}, search=${debouncedSearchQuery}, sex=${filterConfig.sex}`);
      setLoading(true);
      try {
        const data = await getSupervisorTrainees(page, debouncedSearchQuery, filterConfig.sex);
        console.log("Fetched trainees:", data);
        if (!data || !data.trainees) {
          throw new Error("Invalid response data");
        }

        // Apply sorting client-side
        const sortedTrainees = [...data.trainees].sort((a, b) => {
          const field = sortConfig.field as keyof Trainee;
          const aValue = a[field] || "";
          const bValue = b[field] || "";
          if (sortConfig.direction === "asc") {
            return aValue > bValue ? 1 : -1;
          }
          return aValue < bValue ? 1 : -1;
        });

        setTrainees(sortedTrainees);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 1);
        const pageToSet = resetPage ? 1 : data.currentPage || page;
        if (pageToSet !== currentPage) {
          setCurrentPage(pageToSet);
        }
        setError(null);
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("Fetch aborted");
          return;
        }
        console.error("Error fetching trainees:", err);
        const message = err.message.includes("CORS")
          ? "Failed to connect to the server. Please check CORS settings."
          : err.message.includes("401")
          ? "Session expired. Please sign in again."
          : err.message.includes("403")
          ? "Unauthorized: You can only view your assigned trainees."
          : `Failed to load trainees: ${err.message}`;
        setError(message);
        toast.error(message);
        if (err.message.includes("401")) {
          router.push("/auth/signin");
        }
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearchQuery, filterConfig.sex, sortConfig, currentPage]
  );

  // Fetch on search changes
  useEffect(() => {
    console.log("Search useEffect:", { debouncedSearchQuery });
    const controller = new AbortController();
    fetchTrainees(1, true, controller.signal);
    return () => controller.abort();
  }, [debouncedSearchQuery, fetchTrainees]);

  // Fetch on pagination changes
  useEffect(() => {
    console.log("Pagination useEffect:", { currentPage });
    const controller = new AbortController();
    fetchTrainees(currentPage, false, controller.signal);
    return () => controller.abort();
  }, [currentPage, fetchTrainees]);

  // Fetch on filter changes
  useEffect(() => {
    console.log("Filter useEffect:", { sex: filterConfig.sex });
    const controller = new AbortController();
    fetchTrainees(1, true, controller.signal);
    return () => controller.abort();
  }, [filterConfig.sex, fetchTrainees]);

  // Handle page changes
  const handlePageChange = useCallback(
    (newPage: number) => {
      console.log("handlePageChange:", { newPage, currentPage, totalPages });
      if (newPage < 1 || newPage > totalPages || newPage === currentPage) {
        console.log("Invalid page change, skipping");
        return;
      }
      setCurrentPage(newPage);
      router.push(`/supervisor/trainees?page=${newPage}`);
    },
    [currentPage, totalPages, router]
  );

  // Handle filter application
  const applyFilters = () => {
    console.log("Applying filters:", tempFilterConfig);
    setFilterConfig({ sex: tempFilterConfig.sex });
    setShowFilterModal(false);
    router.push(`/supervisor/trainees?page=1`);
  };

  // Handle filter clearing
  const clearFilters = () => {
    console.log("Clearing filters");
    setTempFilterConfig({ sex: "" });
    setFilterConfig({ sex: "" });
    setShowFilterModal(false);
    router.push(`/supervisor/trainees?page=1`);
  };

  // Handle sorting
  const toggleSort = (field: string) => {
    console.log("Toggling sort:", { field, currentSort: sortConfig });
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Clear search and filters
  const clearSearchAndFilters = () => {
    console.log("Clearing search and filters");
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setFilterConfig({ sex: "" });
    setTempFilterConfig({ sex: "" });
    setCurrentPage(1);
    router.push(`/supervisor/trainees?page=1`);
  };

  const columns = [
    { header: "Info", accessor: "info", sortable: true, field: "name" },
    { header: "Reg No", accessor: "regNo", className: "hidden md:table-cell", sortable: true, field: "regNo" },
    { header: "Phone", accessor: "phone", className: "hidden lg:table-cell", sortable: true, field: "phone" },
    { header: "Address", accessor: "address", className: "hidden lg:table-cell", sortable: true, field: "address" },
    { header: "Sex", accessor: "sex", className: "hidden lg:table-cell", sortable: true, field: "sex" },
    { header: "Place of TP", accessor: "placeOfTP", className: "hidden lg:table-cell", sortable: true, field: "placeOfTP" },
    { header: "Progress", accessor: "progress", className: "hidden lg:table-cell", sortable: true, field: "progress" },
  ];

  const renderRow = (item: Trainee) => (
    <tr
      key={`${item.id}-${item.regNo}`}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.img || "/noAvatar.png"}
          alt={`${item.name} ${item.surname}`}
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{`${item.name} ${item.surname}`}</h3>
          <p className="text-xs text-gray-500">{item.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.regNo}</td>
      <td className="hidden lg:table-cell">{item.phone || "-"}</td>
      <td className="hidden lg:table-cell">{item.address}</td>
      <td className="hidden lg:table-cell">{item.sex}</td>
      <td className="hidden lg:table-cell">{item.placeOfTP || "-"}</td>
      <td className="hidden lg:table-cell">{item.progress}%</td>
    </tr>
  );

  if (loading && trainees.length === 0) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5244F3]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        <p className="font-medium">{error}</p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => router.push("/auth/signin")}
            className="px-4 py-2 bg-[#5244F3] text-white rounded-lg hover:bg-[#3b2db5] transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              const controller = new AbortController();
              fetchTrainees(1, true, controller.signal);
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">My Trainees</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <TableSearch
              placeholder="Search by Name, RegNo, Email..."
              onSearch={setSearchQuery}
              value={searchQuery}
            />
            {(searchQuery || filterConfig.sex) && (
              <button
                onClick={clearSearchAndFilters}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex items-center gap-4 self-end">
            <button
              onClick={() => {
                setTempFilterConfig({ sex: filterConfig.sex || "" });
                setShowFilterModal(true);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow"
            >
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            <button
              onClick={() => toggleSort("name")}
              className="w-8 h-7 flex items-center justify-center rounded-full bg-lamaYellow"
            >
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
          </div>
        </div>
      </div>
      {trainees.length === 0 && !loading ? (
        <div className="text-center py-10 bg-gray-50 rounded-md">
          <Image
            src="/stockout.png"
            alt="No trainees"
            width={120}
            height={120}
            className="mx-auto mb-4"
          />
          <p className="text-gray-500 text-lg">No trainees assigned to you.</p>
        </div>
      ) : (
        <Table
          columns={columns.map((col) => ({
            ...col,
            onSort: col.sortable ? () => toggleSort(col.field || col.accessor) : undefined,
          }))}
          renderRow={renderRow}
          data={trainees}
        />
      )}
      <Pagination
        page={currentPage}
        count={totalCount}
        onPageChange={handlePageChange}
      />
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-4">Filter Trainees</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium">Sex</label>
                <select
                  value={tempFilterConfig.sex}
                  onChange={(e) => setTempFilterConfig({ sex: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">All</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorTraineesPage;



























