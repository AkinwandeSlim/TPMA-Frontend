"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import { getTrainees } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

// Type definitions
type Trainee = {
  id: string;
  regNo: string;
  email?: string;
  role: "teacherTrainee";
  name: string;
  surname: string;
  phone?: string;
  address: string;
  bloodType: string;
  sex: "MALE" | "FEMALE";
  birthday: string;
  placeOfTP?: string;
  supervisorId?: string;
  progress: number;
  img?: string;
};

const TraineeListPage = ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
  const router = useRouter();
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterConfig, setFilterConfig] = useState<{ sex: string }>({ sex: "" });
  const [tempFilterConfig, setTempFilterConfig] = useState<{ sex: string }>({ sex: "" });
  const [triggerFetch, setTriggerFetch] = useState<{
    page: number;
    resetPage: boolean;
    search: string;
    sex: string;
  }>({
    page: 1,
    resetPage: true,
    search: "",
    sex: "",
  });

  const lastFetchTime = useRef<number>(0);
  const abortController = useRef<AbortController | null>(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      console.log("TraineeListPage - Triggering fetch for searchQuery:", searchQuery);
      setTriggerFetch((prev) => ({
        ...prev,
        search: searchQuery,
        page: 1,
        resetPage: true,
      }));
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch trainees
  const fetchTrainees = useCallback(
    async (params: {
      page: number;
      resetPage: boolean;
      search: string;
      sex: string;
    }) => {
      if (role !== "admin") {
        console.log("TraineeListPage - Skipping fetch: role not admin");
        return;
      }

      const now = Date.now();
      if (loading || now - lastFetchTime.current < 1500) {
        console.log("TraineeListPage - Skipping fetch: loading or too soon");
        return;
      }

      // Cancel previous request
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      setLoading(true);
      setError(null);
      lastFetchTime.current = now;

      try {
        const pageToFetch = params.resetPage ? 1 : params.page;
        console.log("TraineeListPage - Fetching with params:", {
          page: pageToFetch,
          limit: 10,
          search: params.search,
          sex: params.sex,
        });

        const response = await getTrainees(
          pageToFetch,
          params.search,
          params.sex || undefined
        );

        console.log("TraineeListPage - API Response:", response);

        if (response.trainees && Array.isArray(response.trainees)) {
          const mappedTrainees = response.trainees.map((item: any) => ({
            id: item.id,
            regNo: item.regNo,
            email: item.email,
            role: item.role,
            name: item.name,
            surname: item.surname,
            phone: item.phone,
            address: item.address,
            bloodType: item.bloodType,
            sex: item.sex,
            birthday: item.birthday,
            placeOfTP: item.placeOfTP,
            supervisorId: item.supervisorId,
            progress: item.progress,
            img: item.img || undefined,
          }));

          setTrainees(mappedTrainees);
          setTotalCount(response.totalCount ?? response.total ?? 0);
          setTotalPages(response.totalPages ?? Math.ceil((response.totalCount ?? 0) / 10) ?? 1);
          setTriggerFetch((prev) => ({
            ...prev,
            page: response.currentPage ?? pageToFetch,
            resetPage: false,
          }));
        } else {
          setTrainees([]);
          setTotalCount(0);
          setTotalPages(1);
          setError("Invalid data received from server");
          toast.error("Invalid data received from server");
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("TraineeListPage - Fetch aborted");
          return;
        }
        console.error("TraineeListPage - Error fetching trainees:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        let message = "Failed to fetch trainees. Please try again.";
        if (err.response?.status === 401) {
          message = "Session expired. Please sign in again.";
          router.push("/auth/signin");
        } else if (err.response?.status === 403) {
          message = "Unauthorized: You lack permission to view trainees.";
        }
        setTrainees([]);
        setTotalCount(0);
        setTotalPages(1);
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [role, loading, router]
  );

  // Auth verification
  useEffect(() => {
    const getToken = (): string | null => {
      const cookieToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      const localStorageToken = localStorage.getItem("token");
      console.log("TraineeListPage - Cookies:", document.cookie, "LocalStorage token:", localStorageToken);
      return cookieToken || localStorageToken || null;
    };

    const token = getToken();
    const baseUrl = API_BASE_URL || "https://tpma-backend.onrender.com";
    console.log("TraineeListPage - API_BASE_URL:", baseUrl, "Token:", token);

    if (!token) {
      console.log("TraineeListPage - No token found, redirecting to signin");
      setError("Authentication token missing. Please sign in.");
      router.push("/auth/signin");
      return;
    }

    axios
      .get(`${baseUrl}/api/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("TraineeListPage - Verify response:", response.data);
        const userRole = response.data?.role || response.data?.user?.role;
        if (!userRole) {
          throw new Error("Role not found in response");
        }
        setRole(userRole);
        if (userRole !== "admin") {
          console.log("TraineeListPage - Unauthorized role, redirecting");
          setError("Unauthorized: You lack permission to view this page.");
          router.push("/unauthorized");
        }
      })
      .catch((error: any) => {
        console.error("TraineeListPage - Verification error:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        let message = "Authentication failed. Please try again.";
        if (error.response?.status === 401) {
          message = "Session expired. Please sign in again.";
        } else if (error.response?.status === 403) {
          message = "Unauthorized: You lack permission to access this page.";
        } else if (!error.response) {
          message = "Network error. Please check your connection and try again.";
        }
        setError(message);
        toast.error(message);
        router.push("/auth/signin");
      });
  }, [router]);

  // Consolidated fetch trigger
  useEffect(() => {
    if (!role || role !== "admin") {
      console.log("TraineeListPage - Skipping fetch trigger: invalid role");
      return;
    }

    fetchTrainees(triggerFetch);

    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [role, triggerFetch, fetchTrainees]);

  // Handle refetch after CRUD operations
  const handleRefetch = useCallback(
    async (operation: "create" | "update" | "delete") => {
      await setTriggerFetch((prev) => ({
        ...prev,
        page: operation === "create" ? 1 : prev.page,
        resetPage: operation === "create",
      }));
    },
    []
  );

  // Handle bulk upload
  const handleBulkUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        toast.error("No file selected");
        return;
      }

      if (!file.name.endsWith(".csv")) {
        toast.error("Please upload a CSV file");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || localStorage.getItem("token") || null;

        if (!token) {
          toast.error("Authentication token not found. Please sign in.");
          return;
        }

        console.log("TraineeListPage - Uploading CSV file:", file.name);
        const baseUrl = API_BASE_URL || "https://tpma-backend.onrender.com";
        const response = await axios.post(
          `${baseUrl}/api/trainees/bulk`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );

        console.log("TraineeListPage - Bulk upload response:", response.data);
        toast.success(response.data.message);
        if (response.data.errors) {
          response.data.errors.forEach((err: string) => toast.error(err));
        }
        handleRefetch("create");
      } catch (err: any) {
        console.error("TraineeListPage - Error uploading CSV:", err);
        toast.error(err.response?.data?.error || "Failed to upload CSV");
      }
    },
    [handleRefetch]
  );

  // Apply filters
  const applyFilters = useCallback(() => {
    console.log("TraineeListPage - Applying filters:", tempFilterConfig);
    setFilterConfig(tempFilterConfig);
    setShowFilterModal(false);
    setTriggerFetch((prev) => ({
      ...prev,
      sex: tempFilterConfig.sex,
      page: 1,
      resetPage: true,
    }));
  }, [tempFilterConfig]);

  // Clear filters
  const clearFilters = useCallback(() => {
    console.log("TraineeListPage - Clearing filters");
    setFilterConfig({ sex: "" });
    setTempFilterConfig({ sex: "" });
    setShowFilterModal(false);
    setTriggerFetch((prev) => ({
      ...prev,
      sex: "",
      page: 1,
      resetPage: true,
    }));
  }, []);

  // Clear search and filters
  const clearSearchAndFilters = useCallback(() => {
    console.log("TraineeListPage - Clearing search and filters");
    setSearchQuery("");
    setFilterConfig({ sex: "" });
    setTempFilterConfig({ sex: "" });
    setTriggerFetch({
      page: 1,
      resetPage: true,
      search: "",
      sex: "",
    });
  }, []);

  // Columns and renderRow
  const columns = useMemo(
    () => [
      { header: "Info", accessor: "info", sortable: true, field: "name" },
      { header: "RegNo", accessor: "regNo", className: "hidden md:table-cell", sortable: true, field: "regNo" },
      { header: "Phone", accessor: "phone", className: "hidden lg:table-cell", sortable: true, field: "phone" },
      { header: "Address", accessor: "address", className: "hidden lg:table-cell", sortable: true, field: "address" },
      ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
    ],
    [role]
  );

  const renderRow = useMemo(() => {
    const RowComponent = (item: Trainee) => (
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
            style={{ width: "40px", height: "40px", objectFit: "cover" }}
            className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <h3 className="font-semibold">
              {item.name} {item.surname}
            </h3>
            <p className="text-xs text-gray-500">{item.email}</p>
          </div>
        </td>
        <td className="hidden md:table-cell">{item.regNo}</td>
        <td className="hidden lg:table-cell">{item.phone || "-"}</td>
        <td className="hidden lg:table-cell">{item.address}</td>
        <td>
          <div className="flex items-center gap-2">
            <Link
              href={`/list/trainees/${item.id}`}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky hover:opacity-80 transition-colors"
            >
              <Image src="/view.png" alt="View Details" width={16} height={16} />
            </Link>
            {role === "admin" && (
              <FormModal
                table="trainee"
                type="delete"
                id={item.id}
                refetch={() => handleRefetch("delete")}
              />
            )}
          </div>
        </td>
      </tr>
    );
    RowComponent.displayName = "TraineeRow";
    return RowComponent;
  }, [role, handleRefetch]);

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
            onClick={() => setTriggerFetch((prev) => ({ ...prev, page: 1, resetPage: true }))}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading && trainees.length === 0) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5244F3]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">All Trainees</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <TableSearch
              placeholder="Search by Name, RegNo, Email..."
              onSearch={(query) => {
                console.log("TraineeListPage - TableSearch onSearch called with query:", query);
                setSearchQuery(query);
              }}
              value={searchQuery}
              ariaLabel="Search trainees"
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
                console.log("TraineeListPage - Opening filter modal");
                setTempFilterConfig({ sex: filterConfig.sex });
                setShowFilterModal(true);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow hover:bg-yellow-500 transition-colors"
              aria-label="Filter trainees"
            >
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            {role === "admin" && (
              <>
                <FormModal
                  table="trainee"
                  type="create"
                  refetch={() => handleRefetch("create")}
                />
                <label className="flex items-center gap-2 bg-lamaYellowLight px-3 py-2 rounded-md cursor-pointer">
                  <Image src="/upload.png" alt="Upload" width={16} height={16} />
                  <span>Upload CSV</span>
                  <input type="file" accept=".csv" onChange={handleBulkUpload} className="hidden" />
                </label>
              </>
            )}
          </div>
        </div>
      </div>
      {trainees.length === 0 && !error ? (
        <div className="bg-gray-50 p-6 text-center text-gray-500 rounded-md">
          <p className="mb-4">No trainees found.</p>
        </div>
      ) : (
        <>
          <Table columns={columns} renderRow={renderRow} data={trainees} />
          <Pagination
            page={triggerFetch.page}
            count={totalCount}
            onPageChange={(page) =>
              setTriggerFetch((prev) => ({ ...prev, page, resetPage: false }))
            }
          />
        </>
      )}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md w-[90%] md:w-[500px]">
            <h2 className="text-lg font-semibold mb-4">Filter Trainees</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium">Sex</label>
                <select
                  value={tempFilterConfig.sex}
                  onChange={(e) => setTempFilterConfig({ sex: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  aria-label="Filter by sex"
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
                  aria-label="Apply filters"
                >
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  aria-label="Clear filters"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => {
                    console.log("TraineeListPage - Closing filter modal");
                    setShowFilterModal(false);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  aria-label="Close filter modal"
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

export default TraineeListPage;




















































