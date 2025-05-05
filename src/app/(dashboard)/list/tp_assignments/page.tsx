
"use client";

import { useState, useEffect, useCallback } from "react";
import { parse, format, isValid, parseISO } from "date-fns";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FormModal from "@/components/FormModal";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getTrainees, getSupervisors, getSchools, getTPAssignments, deleteTPAssignment, verifyToken } from "@/lib/api";

type TPAssignment = {
  id: string;
  traineeId: string;
  schoolId: string;
  supervisorId: string;
  startDate?: string;
  endDate?: string;
  trainee?: { id: string; regNo: string; name: string; surname: string };
  supervisor?: { id: string; staffId: string; name: string; surname: string };
  school?: { id: string; name: string };
};

type Trainee = {
  id: string;
  regNo: string;
  name: string;
  surname: string;
};

type Supervisor = {
  id: string;
  staffId: string;
  name: string;
  surname: string;
};

type School = {
  id: string;
  name: string;
};

const TPAssignmentPage = ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
  const [assignments, setAssignments] = useState<TPAssignment[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const router = useRouter();

  // Verify token
  useEffect(() => {
    const verify = async () => {
      try {
        const data = await verifyToken();
        console.log("TPAssignmentPage - Verify response:", data);
        setRole(data.role);
        if (data.role !== "admin") {
          router.push("/unauthorized");
        }
      } catch (error: any) {
        console.error("TPAssignmentPage - Verification error:", error);
        toast.error(error.message || "Authentication failed");
        router.push("/auth/signin");
      }
    };
    verify();
  }, [router]);

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const traineeResponse = await getTrainees(1, "");
        console.log("TPAssignmentPage - Trainee response:", traineeResponse);
        setTrainees(traineeResponse.trainees || []);

        const supervisorResponse = await getSupervisors(1, "");
        console.log("TPAssignmentPage - Supervisor response:", supervisorResponse);
        setSupervisors(supervisorResponse.supervisors || []);

        const schoolResponse = await getSchools(1, "", "");
        console.log("TPAssignmentPage - School response:", schoolResponse);
        setSchools(schoolResponse.schools || []);
      } catch (err: any) {
        console.error("TPAssignmentPage - Error fetching dropdown data:", err);
        toast.error(err.message || "Failed to fetch dropdown data");
      }
    };
    if (role === "admin") {
      fetchDropdownData();
    }
  }, [role]);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch assignments
  const fetchAssignments = useCallback(
    async (page: number, resetPage = false) => {
      if (isFetching || role !== "admin") return;
      setIsFetching(true);
      setLoading(true);
      try {
        const pageToFetch = resetPage ? 1 : page;
        console.log("TPAssignmentPage - Fetching assignments with params:", { page: pageToFetch, search: debouncedSearchQuery });
        const response = await getTPAssignments(pageToFetch, debouncedSearchQuery);
        console.log("TPAssignmentPage - Assignment response:", response);
        if (response.assignments && Array.isArray(response.assignments)) {
          // Normalize date keys
          const normalizedAssignments = response.assignments.map((a: any) => ({
            ...a,
            startDate: a.startDate || a.start_date || "",
            endDate: a.endDate || a.end_date || "",
          }));
          setAssignments(normalizedAssignments);
          setTotalCount(response.totalCount ?? 0);
          setTotalPages(response.totalPages ?? 1);
          if (resetPage && currentPage !== 1) {
            setCurrentPage(1);
          } else if (pageToFetch !== currentPage) {
            setCurrentPage(pageToFetch);
          }
        } else {
          setAssignments([]);
          setTotalCount(0);
          setTotalPages(1);
          toast.error("Invalid assignment data received");
        }
      } catch (err: any) {
        console.error("TPAssignmentPage - Error fetching assignments:", err);
        toast.error(err.message || "Failed to fetch assignments");
        setAssignments([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
        setIsFetching(false);
      }
    },
    [isFetching, role, debouncedSearchQuery, currentPage]
  );

  // Initial fetch
  useEffect(() => {
    if (role === "admin") {
      fetchAssignments(1);
    }
  }, [role, fetchAssignments]);

  // Handle search changes
  useEffect(() => {
    if (role !== "admin") return;
    fetchAssignments(1, true);
  }, [role, debouncedSearchQuery, fetchAssignments]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
      setCurrentPage(newPage);
      fetchAssignments(newPage);
    },
    [totalPages, currentPage, fetchAssignments]
  );

  const handleRefetch = useCallback(async () => {
    console.log("TPAssignmentPage - FormModal refetch triggered for page:", currentPage);
    await fetchAssignments(currentPage);
  }, [currentPage, fetchAssignments]);

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    fetchAssignments(1, true);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString || dateString.trim() === "") return "-";
    try {
      // Try YYYY-MM-DD
      const dateYMD = parse(dateString, "yyyy-MM-dd", new Date());
      if (isValid(dateYMD)) {
        return format(dateYMD, "dd/MM/yyyy");
      }
      // Try ISO 8601 (e.g., 2025-03-15T12:34:56.789Z)
      const dateISO = parseISO(dateString);
      if (isValid(dateISO)) {
        return format(dateISO, "dd/MM/yyyy");
      }
      // Fallback: browser's Date
      const fallbackDate = new Date(dateString);
      if (isValid(fallbackDate)) {
        return format(fallbackDate, "dd/MM/yyyy");
      }
      console.warn(`Invalid date format: ${dateString}`);
      return "Invalid date";
    } catch (err) {
      console.warn(`Error parsing date: ${dateString}`, err);
      return "Invalid date";
    }
  };

  const columns = [
    { header: "Trainee", accessor: "trainee" },
    { header: "School", accessor: "school", className: "hidden md:table-cell" },
    { header: "Supervisor", accessor: "supervisor", className: "hidden lg:table-cell" },
    { header: "Start Date", accessor: "startDate", className: "hidden lg:table-cell" },
    { header: "End Date", accessor: "endDate", className: "hidden lg:table-cell" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: TPAssignment) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">
            {item.trainee ? `${item.trainee.name} ${item.trainee.surname}` : item.traineeId || "Unknown"}
          </h3>
          <p className="text-xs text-gray-500">{item.trainee?.regNo || item.traineeId || "-"}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.school?.name || item.schoolId || "-"}</td>
      <td className="hidden lg:table-cell">
        {item.supervisor?.name && item.supervisor?.surname
          ? `${item.supervisor.name} ${item.supervisor.surname}`
          : item.supervisor?.name || item.supervisorId || "-"}
      </td>
      <td className="hidden lg:table-cell">{formatDate(item.startDate)}</td>
      <td className="hidden lg:table-cell">{formatDate(item.endDate)}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormModal
                table="tp_assignment"
                type="update"
                data={{
                  id: item.id,
                  traineeId: item.traineeId,
                  schoolId: item.schoolId,
                  supervisorId: item.supervisorId,
                  startDate: item.startDate,
                  endDate: item.endDate,
                  trainees,
                  supervisors,
                  schools,
                }}
                refetch={handleRefetch}
              />
              <FormModal
                table="tp_assignment"
                type="delete"
                id={item.id}
                refetch={handleRefetch}
              />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  if (loading && assignments.length === 0) return <div className="p-4">Loading...</div>;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">TP Assignments</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <TableSearch
              placeholder="Search by Trainee Name, Reg No..."
              onSearch={setSearchQuery}
              value={searchQuery}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          {role === "admin" && (
            <FormModal
              table="tp_assignment"
              type="create"
              refetch={handleRefetch}
              data={{ trainees, supervisors, schools }}
            />
          )}
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={assignments} />
      <Pagination
        page={currentPage}
        count={totalCount}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default TPAssignmentPage;
