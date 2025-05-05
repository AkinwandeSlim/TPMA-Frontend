
"use client";

import { useState, useEffect } from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getSchools, verifyToken } from "@/lib/api";

type School = {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  type: "PRIMARY" | "SECONDARY" | "TERTIARY";
  principal: string;
  logo?: string;
  createdAt?: string;
};

const SchoolListPage = ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterConfig, setFilterConfig] = useState<{ type: string }>({ type: "" });
  const [tempFilterConfig, setTempFilterConfig] = useState<{ type: string }>({ type: "" });
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const router = useRouter();

  // Verify token only once on mount
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      router.push("/auth/signin");
      return;
    }

    verifyToken()
      .then((response) => {
        setRole(response.role);
        if (response.role !== "admin") {
          router.push("/unauthorized");
        }
      })
      .catch((error) => {
        toast.error(error.message || "Authentication failed");
        router.push("/auth/signin");
      });
  }, [router]);

  // Debounce the search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch schools function with loading check
  const fetchSchools = async (resetPage = false) => {
    if (loading || role !== "admin") return;
    setLoading(true);
    try {
      const pageToFetch = resetPage ? 1 : currentPage;
      const response = await getSchools(pageToFetch, debouncedSearchQuery, filterConfig.type);
      if (response.schools && Array.isArray(response.schools)) {
        const mappedSchools = response.schools.map((item: any) => ({
          id: item.id,
          name: item.name,
          address: item.address,
          email: item.email,
          phone: item.phone,
          type: item.type,
          principal: item.principal,
          logo: item.logo || undefined,
        }));
        setAllSchools(mappedSchools);
        const total = response.totalCount ?? 0;
        const pages = response.totalPages ?? 1;
        const current = response.currentPage ?? pageToFetch;
        setTotalCount(total);
        setTotalPages(pages);
        if (resetPage) {
          setCurrentPage(1);
        } else if (current !== currentPage) {
          setCurrentPage(current);
        }
      } else {
        setAllSchools([]);
        setTotalCount(0);
        setTotalPages(1);
        toast.error("Invalid data received from server");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to fetch schools");
      setAllSchools([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch schools after role is verified as admin
  useEffect(() => {
    if (role === "admin") {
      fetchSchools();
    }
  }, [fetchSchools, role]);

  // Handle search changes
  useEffect(() => {
    if (role !== "admin") return;
    setCurrentPage(1);
    fetchSchools(true);
  }, [fetchSchools, debouncedSearchQuery]);

  // Handle pagination changes
  useEffect(() => {
    if (role !== "admin") return;
    fetchSchools();
  }, [fetchSchools, currentPage]);

  // Handle filter changes
  useEffect(() => {
    if (role !== "admin") return;
    setCurrentPage(1);
    fetchSchools(true);
  }, [fetchSchools, filterConfig.type]);

  const handleRefetch = async (operation: "create" | "update" | "delete") => {
    if (operation === "create") {
      await fetchSchools(true);
    } else {
      await fetchSchools();
    }
  };

  const applyFilters = () => {
    setFilterConfig({ type: tempFilterConfig.type });
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setTempFilterConfig({ type: "" });
    setFilterConfig({ type: "" });
    setShowFilterModal(false);
  };

  const clearSearchAndFilters = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setFilterConfig({ type: "" });
    setTempFilterConfig({ type: "" });
    setCurrentPage(1);
  };

  const columns = [
    { header: "Info", accessor: "info" },
    { header: "Email", accessor: "email", className: "hidden md:table-cell" },
    { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
    { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
    { header: "Type", accessor: "type", className: "hidden lg:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: School) => (
    <tr
      key={`${item.id}`}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.logo || "/noAvatar.png"}
          alt={`${item.name}`}
          width={40}
          height={40}
          style={{ width: "40px", height: "40px", objectFit: "cover" }}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item.principal}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.email}</td>
      <td className="hidden lg:table-cell">{item.phone || "-"}</td>
      <td className="hidden lg:table-cell">{item.address}</td>
      <td className="hidden lg:table-cell">{item.type}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal
                table="school"
                type="update"
                data={item}
                refetch={() => handleRefetch("update")}
              />
              <FormModal
                table="school"
                type="delete"
                id={item.id}
                refetch={() => handleRefetch("delete")}
              />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  if (loading && allSchools.length === 0) return <div className="p-4">Loading...</div>;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Schools</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <TableSearch
              placeholder="Search by Name, Email..."
              onSearch={setSearchQuery}
              value={searchQuery}
            />
            {(searchQuery || filterConfig.type) && (
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
                setTempFilterConfig({ type: filterConfig.type || "" });
                setShowFilterModal(true);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow"
            >
              <Image src="/filter.png" alt="Filter" width={14} height={14} />
            </button>
            {role === "admin" && (
              <FormModal
                table="school"
                type="create"
                refetch={() => handleRefetch("create")}
              />
            )}
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={allSchools} />
      <Pagination
        page={currentPage}
        count={totalCount}
        onPageChange={setCurrentPage}
      />

      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-4">Filter Schools</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium">School Type</label>
                <select
                  value={tempFilterConfig.type}
                  onChange={(e) => setTempFilterConfig({ ...tempFilterConfig, type: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">All</option>
                  <option value="PRIMARY">Primary</option>
                  <option value="SECONDARY">Secondary</option>
                  <option value="TERTIARY">Tertiary</option>
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

export default SchoolListPage;


























































