"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();
  const isFetching = useRef(false);
  const pageRef = useRef(currentPage);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefetching = useRef(false); // New ref to prevent duplicate refetch calls

  // Debounce search query
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 750);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Verify token
  useEffect(() => {
    const verify = async () => {
      try {
        const data = await verifyToken();
        console.log("TPAssignmentPage - Verify response:", data);
        setRole(data.role);
        if (data.role !== "admin") {
          setError("Unauthorized: You lack permission to view this page.");
          router.push("/unauthorized");
        }
      } catch (error: any) {
        console.error("TPAssignmentPage - Verification error:", error);
        const message = error.message || "Authentication failed";
        setError(message);
        toast.error(message);
        router.push("/auth/signin");
      }
    };
    verify();
  }, [router]);

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [traineeResponse, supervisorResponse, schoolResponse] = await Promise.all([
          getTrainees(1, ""),
          getSupervisors(1, ""),
          getSchools(1, "", ""),
        ]);
        console.log("TPAssignmentPage - Dropdown responses:", { traineeResponse, supervisorResponse, schoolResponse });
        setTrainees(traineeResponse.trainees || []);
        setSupervisors(supervisorResponse.supervisors || []);
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

  // Fetch assignments
  const fetchAssignments = useCallback(
    async (page: number, resetPage = false, forceRefresh = false) => {
      if (role !== "admin" || isFetching.current) {
        console.log("TPAssignmentPage - Skipping fetch: not admin or already fetching");
        return;
      }

      isFetching.current = true;
      setLoading(true);
      setError(null);

      try {
        const pageToFetch = resetPage ? 1 : page;
        console.log("TPAssignmentPage - Fetching assignments with params:", { page: pageToFetch, search: debouncedSearchQuery, forceRefresh });
        const response = await getTPAssignments(pageToFetch, debouncedSearchQuery, forceRefresh);
        console.log("TPAssignmentPage - Assignment response:", response);

        if (response.assignments && Array.isArray(response.assignments)) {
          const normalizedAssignments = response.assignments.map((a: any) => ({
            ...a,
            startDate: a.startDate || a.start_date || "",
            endDate: a.endDate || a.end_date || "",
          }));
          setAssignments(normalizedAssignments);
          setTotalCount(response.totalCount ?? 0);
          setTotalPages(response.totalPages ?? Math.ceil((response.totalCount ?? 0) / 10) ?? 1);
          if (resetPage && pageToFetch !== 1) {
            setCurrentPage(1);
            pageRef.current = 1;
          } else if (pageToFetch !== pageRef.current) {
            setCurrentPage(pageToFetch);
            pageRef.current = pageToFetch;
          }
          console.log("TPAssignmentPage - Assignments updated:", normalizedAssignments.length, "items");
        } else {
          setAssignments([]);
          setTotalCount(0);
          setTotalPages(1);
          setError("No assignments found for the given criteria.");
          toast.info("No assignments found for the given criteria.");
        }
      } catch (err: any) {
        console.error("TPAssignmentPage - Error fetching assignments:", err);
        let message = "Failed to fetch assignments. Please try again.";
        if (err.response?.status === 401) {
          message = "Session expired. Please sign in again.";
          router.push("/auth/signin");
        } else if (err.response?.status === 403) {
          message = "Unauthorized: You lack permission to view assignments.";
        }
        setAssignments([]);
        setTotalCount(0);
        setTotalPages(1);
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    },
    [role, debouncedSearchQuery, router]
  );

  // Initial fetch
  useEffect(() => {
    if (role === "admin") {
      fetchAssignments(1);
    }
  }, [role, fetchAssignments]);

  // Fetch when debounced search changes
  useEffect(() => {
    if (role === "admin") {
      fetchAssignments(1, true);
    }
  }, [debouncedSearchQuery, role, fetchAssignments]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages || newPage === pageRef.current) {
        console.log("TPAssignmentPage - Invalid page change:", { newPage, totalPages, currentPage: pageRef.current });
        return;
      }
      fetchAssignments(newPage);
    },
    [totalPages, fetchAssignments]
  );

  const handleRefetch = useCallback(
    async (operation: "create" | "update" | "delete") => {
      if (isRefetching.current) {
        console.log("TPAssignmentPage - Skipping duplicate refetch for operation:", operation);
        return;
      }

      isRefetching.current = true;
      console.log("TPAssignmentPage - Refetch triggered for operation:", operation, "page:", pageRef.current);

      try {
        // Force refresh and reset to page 1 for updates to ensure fresh data
        await fetchAssignments(operation === "create" || operation === "update" ? 1 : pageRef.current, operation === "create" || operation === "update", true);
        toast.success(`TP Assignment ${operation}d successfully`);
      } catch (err: any) {
        console.error("TPAssignmentPage - Refetch error after", operation, ":", err);
        toast.error(`Failed to refresh assignments after ${operation}`);
      } finally {
        isRefetching.current = false;
      }
    },
    [fetchAssignments]
  );

  const clearSearch = useCallback(() => {
    console.log("TPAssignmentPage - Clearing search");
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setCurrentPage(1);
    pageRef.current = 1;
    fetchAssignments(1, true);
  }, [fetchAssignments]);

  const formatDate = (dateString?: string): string => {
    if (!dateString || dateString.trim() === "") return "-";
    try {
      const dateYMD = parse(dateString, "yyyy-MM-dd", new Date());
      if (isValid(dateYMD)) {
        return format(dateYMD, "dd/MM/yyyy");
      }
      const dateISO = parseISO(dateString);
      if (isValid(dateISO)) {
        return format(dateISO, "dd/MM/yyyy");
      }
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
      {role === "admin" && (
        <td>
          <div className="flex items-center gap-2">
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
              refetch={() => handleRefetch("update")}
            />
            <FormModal
              table="tp_assignment"
              type="delete"
              id={item.id}
              refetch={() => handleRefetch("delete")}
            />
          </div>
        </td>
      )}
    </tr>
  );

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
            onClick={() => fetchAssignments(1, true, true)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading && assignments.length === 0) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5244F3]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">TP Assignments</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <TableSearch
              placeholder="Search by Trainee Name, Reg No..."
              onSearch={setSearchQuery}
              value={searchQuery}
              ariaLabel="Search assignments"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => fetchAssignments(currentPage, false, true)}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Refresh
            </button>
          </div>
          {role === "admin" && (
            <FormModal
              table="tp_assignment"
              type="create"
              refetch={() => handleRefetch("create")}
              data={{ trainees, supervisors, schools }}
            />
          )}
        </div>
      </div>
      {assignments.length === 0 ? (
        <div className="bg-gray-50 p-6 text-center text-gray-500 rounded-md">
          <p className="mb-4">No assignments found for the current search.</p>
        </div>
      ) : (
        <>
          <Table columns={columns} renderRow={renderRow} data={assignments} />
          <Pagination
            page={currentPage}
            count={totalCount}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default TPAssignmentPage;
































































// "use client";

// import { useState, useEffect, useCallback, useRef } from "react";
// import { parse, format, isValid, parseISO } from "date-fns";
// import Pagination from "@/components/Pagination";
// import Table from "@/components/Table";
// import TableSearch from "@/components/TableSearch";
// import FormModal from "@/components/FormModal";
// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";
// import { getTrainees, getSupervisors, getSchools, getTPAssignments, deleteTPAssignment, verifyToken } from "@/lib/api";

// type TPAssignment = {
//   id: string;
//   traineeId: string;
//   schoolId: string;
//   supervisorId: string;
//   startDate?: string;
//   endDate?: string;
//   trainee?: { id: string; regNo: string; name: string; surname: string };
//   supervisor?: { id: string; staffId: string; name: string; surname: string };
//   school?: { id: string; name: string };
// };

// type Trainee = {
//   id: string;
//   regNo: string;
//   name: string;
//   surname: string;
// };

// type Supervisor = {
//   id: string;
//   staffId: string;
//   name: string;
//   surname: string;
// };

// type School = {
//   id: string;
//   name: string;
// };

// const TPAssignmentPage = ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
//   const [assignments, setAssignments] = useState<TPAssignment[]>([]);
//   const [trainees, setTrainees] = useState<Trainee[]>([]);
//   const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
//   const [schools, setSchools] = useState<School[]>([]);
//   const [role, setRole] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
//   const [totalCount, setTotalCount] = useState(0);
//   const [totalPages, setTotalPages] = useState(1);
//   const [currentPage, setCurrentPage] = useState(1);

//   const router = useRouter();
//   const isFetching = useRef(false);
//   const pageRef = useRef(currentPage);
//   const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   // Debounce search query
//   useEffect(() => {
//     if (debounceTimeoutRef.current) {
//       clearTimeout(debounceTimeoutRef.current);
//     }
//     debounceTimeoutRef.current = setTimeout(() => {
//       setDebouncedSearchQuery(searchQuery);
//     }, 750);

//     return () => {
//       if (debounceTimeoutRef.current) {
//         clearTimeout(debounceTimeoutRef.current);
//       }
//     };
//   }, [searchQuery]);

//   // Verify token
//   useEffect(() => {
//     const verify = async () => {
//       try {
//         const data = await verifyToken();
//         console.log("TPAssignmentPage - Verify response:", data);
//         setRole(data.role);
//         if (data.role !== "admin") {
//           setError("Unauthorized: You lack permission to view this page.");
//           router.push("/unauthorized");
//         }
//       } catch (error: any) {
//         console.error("TPAssignmentPage - Verification error:", error);
//         const message = error.message || "Authentication failed";
//         setError(message);
//         toast.error(message);
//         router.push("/auth/signin");
//       }
//     };
//     verify();
//   }, [router]);

//   // Fetch dropdown data
//   useEffect(() => {
//     const fetchDropdownData = async () => {
//       try {
//         const [traineeResponse, supervisorResponse, schoolResponse] = await Promise.all([
//           getTrainees(1, ""),
//           getSupervisors(1, ""),
//           getSchools(1, "", ""),
//         ]);
//         console.log("TPAssignmentPage - Dropdown responses:", { traineeResponse, supervisorResponse, schoolResponse });
//         setTrainees(traineeResponse.trainees || []);
//         setSupervisors(supervisorResponse.supervisors || []);
//         setSchools(schoolResponse.schools || []);
//       } catch (err: any) {
//         console.error("TPAssignmentPage - Error fetching dropdown data:", err);
//         toast.error(err.message || "Failed to fetch dropdown data");
//       }
//     };
//     if (role === "admin") {
//       fetchDropdownData();
//     }
//   }, [role]);

//   // Fetch assignments
//   const fetchAssignments = useCallback(
//     async (page: number, resetPage = false, forceRefresh = false) => {
//       if (role !== "admin" || isFetching.current) {
//         console.log("TPAssignmentPage - Skipping fetch: not admin or already fetching");
//         return;
//       }

//       isFetching.current = true;
//       setLoading(true);
//       setError(null);

//       try {
//         const pageToFetch = resetPage ? 1 : page;
//         console.log("TPAssignmentPage - Fetching assignments with params:", { page: pageToFetch, search: debouncedSearchQuery, forceRefresh });
//         const response = await getTPAssignments(pageToFetch, debouncedSearchQuery, forceRefresh);
//         console.log("TPAssignmentPage - Assignment response:", response);

//         if (response.assignments && Array.isArray(response.assignments)) {
//           const normalizedAssignments = response.assignments.map((a: any) => ({
//             ...a,
//             startDate: a.startDate || a.start_date || "",
//             endDate: a.endDate || a.end_date || "",
//           }));
//           setAssignments(normalizedAssignments);
//           setTotalCount(response.totalCount ?? 0);
//           setTotalPages(response.totalPages ?? Math.ceil((response.totalCount ?? 0) / 10) ?? 1);
//           if (resetPage && pageToFetch !== 1) {
//             setCurrentPage(1);
//             pageRef.current = 1;
//           } else if (pageToFetch !== pageRef.current) {
//             setCurrentPage(pageToFetch);
//             pageRef.current = pageToFetch;
//           }
//           console.log("TPAssignmentPage - Assignments updated:", normalizedAssignments.length, "items");
//         } else {
//           setAssignments([]);
//           setTotalCount(0);
//           setTotalPages(1);
//           setError("No assignments found for the given criteria.");
//           toast.info("No assignments found for the given criteria.");
//         }
//       } catch (err: any) {
//         console.error("TPAssignmentPage - Error fetching assignments:", err);
//         let message = "Failed to fetch assignments. Please try again.";
//         if (err.response?.status === 401) {
//           message = "Session expired. Please sign in again.";
//           router.push("/auth/signin");
//         } else if (err.response?.status === 403) {
//           message = "Unauthorized: You lack permission to view assignments.";
//         }
//         setAssignments([]);
//         setTotalCount(0);
//         setTotalPages(1);
//         setError(message);
//         toast.error(message);
//       } finally {
//         setLoading(false);
//         isFetching.current = false;
//       }
//     },
//     [role, debouncedSearchQuery, router]
//   );

//   // Initial fetch
//   useEffect(() => {
//     if (role === "admin") {
//       fetchAssignments(1);
//     }
//   }, [role, fetchAssignments]);

//   // Fetch when debounced search changes
//   useEffect(() => {
//     if (role === "admin") {
//       fetchAssignments(1, true);
//     }
//   }, [debouncedSearchQuery, role, fetchAssignments]);

//   const handlePageChange = useCallback(
//     (newPage: number) => {
//       if (newPage < 1 || newPage > totalPages || newPage === pageRef.current) {
//         console.log("TPAssignmentPage - Invalid page change:", { newPage, totalPages, currentPage: pageRef.current });
//         return;
//       }
//       fetchAssignments(newPage);
//     },
//     [totalPages, fetchAssignments]
//   );

//   const handleRefetch = useCallback(
//     async (operation: "create" | "update" | "delete") => {
//       console.log("TPAssignmentPage - Refetch triggered for operation:", operation, "page:", pageRef.current);
//       try {
//         // Force refresh and reset to page 1 for updates to ensure fresh data
//         await fetchAssignments(operation === "create" || operation === "update" ? 1 : pageRef.current, operation === "create" || operation === "update", true);
//         toast.success(`TP Assignment ${operation}d successfully`);
//       } catch (err: any) {
//         console.error("TPAssignmentPage - Refetch error after", operation, ":", err);
//         toast.error(`Failed to refresh assignments after ${operation}`);
//       }
//     },
//     [fetchAssignments]
//   );

//   const clearSearch = useCallback(() => {
//     console.log("TPAssignmentPage - Clearing search");
//     setSearchQuery("");
//     setDebouncedSearchQuery("");
//     setCurrentPage(1);
//     pageRef.current = 1;
//     fetchAssignments(1, true);
//   }, [fetchAssignments]);

//   const formatDate = (dateString?: string): string => {
//     if (!dateString || dateString.trim() === "") return "-";
//     try {
//       const dateYMD = parse(dateString, "yyyy-MM-dd", new Date());
//       if (isValid(dateYMD)) {
//         return format(dateYMD, "dd/MM/yyyy");
//       }
//       const dateISO = parseISO(dateString);
//       if (isValid(dateISO)) {
//         return format(dateISO, "dd/MM/yyyy");
//       }
//       const fallbackDate = new Date(dateString);
//       if (isValid(fallbackDate)) {
//         return format(fallbackDate, "dd/MM/yyyy");
//       }
//       console.warn(`Invalid date format: ${dateString}`);
//       return "Invalid date";
//     } catch (err) {
//       console.warn(`Error parsing date: ${dateString}`, err);
//       return "Invalid date";
//     }
//   };

//   const columns = [
//     { header: "Trainee", accessor: "trainee" },
//     { header: "School", accessor: "school", className: "hidden md:table-cell" },
//     { header: "Supervisor", accessor: "supervisor", className: "hidden lg:table-cell" },
//     { header: "Start Date", accessor: "startDate", className: "hidden lg:table-cell" },
//     { header: "End Date", accessor: "endDate", className: "hidden lg:table-cell" },
//     ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
//   ];

//   const renderRow = (item: TPAssignment) => (
//     <tr
//       key={item.id}
//       className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
//     >
//       <td className="flex items-center gap-4 p-4">
//         <div className="flex flex-col">
//           <h3 className="font-semibold">
//             {item.trainee ? `${item.trainee.name} ${item.trainee.surname}` : item.traineeId || "Unknown"}
//           </h3>
//           <p className="text-xs text-gray-500">{item.trainee?.regNo || item.traineeId || "-"}</p>
//         </div>
//       </td>
//       <td className="hidden md:table-cell">{item.school?.name || item.schoolId || "-"}</td>
//       <td className="hidden lg:table-cell">
//         {item.supervisor?.name && item.supervisor?.surname
//           ? `${item.supervisor.name} ${item.supervisor.surname}`
//           : item.supervisor?.name || item.supervisorId || "-"}
//       </td>
//       <td className="hidden lg:table-cell">{formatDate(item.startDate)}</td>
//       <td className="hidden lg:table-cell">{formatDate(item.endDate)}</td>
//       {role === "admin" && (
//         <td>
//           <div className="flex items-center gap-2">
//             <FormModal
//               table="tp_assignment"
//               type="update"
//               data={{
//                 id: item.id,
//                 traineeId: item.traineeId,
//                 schoolId: item.schoolId,
//                 supervisorId: item.supervisorId,
//                 startDate: item.startDate,
//                 endDate: item.endDate,
//                 trainees,
//                 supervisors,
//                 schools,
//               }}
//               refetch={() => handleRefetch("update")}
//             />
//             <FormModal
//               table="tp_assignment"
//               type="delete"
//               id={item.id}
//               refetch={() => handleRefetch("delete")}
//             />
//           </div>
//         </td>
//       )}
//     </tr>
//   );

//   if (error) {
//     return (
//       <div className="p-4 text-red-500 bg-red-50 rounded-lg">
//         <p className="font-medium">{error}</p>
//         <div className="mt-4 flex gap-3">
//           <button
//             onClick={() => router.push("/auth/signin")}
//             className="px-4 py-2 bg-[#5244F3] text-white rounded-lg hover:bg-[#3b2db5] transition-colors"
//           >
//             Sign In
//           </button>
//           <button
//             onClick={() => fetchAssignments(1, true, true)}
//             className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (loading && assignments.length === 0) {
//     return (
//       <div className="p-4 flex items-center justify-center h-full">
//         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5244F3]"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
//       <div className="flex items-center justify-between mb-4">
//         <h1 className="hidden md:block text-lg font-semibold">TP Assignments</h1>
//         <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
//           <div className="flex items-center gap-2 w-full md:w-auto">
//             <TableSearch
//               placeholder="Search by Trainee Name, Reg No..."
//               onSearch={setSearchQuery}
//               value={searchQuery}
//               ariaLabel="Search assignments"
//             />
//             {searchQuery && (
//               <button
//                 onClick={clearSearch}
//                 className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
//               >
//                 Clear
//               </button>
//             )}
//             <button
//               onClick={() => fetchAssignments(currentPage, false, true)}
//               className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
//             >
//               Refresh
//             </button>
//           </div>
//           {role === "admin" && (
//             <FormModal
//               table="tp_assignment"
//               type="create"
//               refetch={() => handleRefetch("create")}
//               data={{ trainees, supervisors, schools }}
//             />
//           )}
//         </div>
//       </div>
//       {assignments.length === 0 ? (
//         <div className="bg-gray-50 p-6 text-center text-gray-500 rounded-md">
//           <p className="mb-4">No assignments found for the current search.</p>
//         </div>
//       ) : (
//         <>
//           <Table columns={columns} renderRow={renderRow} data={assignments} />
//           <Pagination
//             page={currentPage}
//             count={totalCount}
//             onPageChange={handlePageChange}
//           />
//         </>
//       )}
//     </div>
//   );
// };

// export default TPAssignmentPage;
































































// "use client";

// import { useState, useEffect, useCallback, useRef } from "react";
// import { parse, format, isValid, parseISO } from "date-fns";
// import Pagination from "@/components/Pagination";
// import Table from "@/components/Table";
// import TableSearch from "@/components/TableSearch";
// import FormModal from "@/components/FormModal";
// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";
// import { getTrainees, getSupervisors, getSchools, getTPAssignments, deleteTPAssignment, verifyToken } from "@/lib/api";

// type TPAssignment = {
//   id: string;
//   traineeId: string;
//   schoolId: string;
//   supervisorId: string;
//   startDate?: string;
//   endDate?: string;
//   trainee?: { id: string; regNo: string; name: string; surname: string };
//   supervisor?: { id: string; staffId: string; name: string; surname: string };
//   school?: { id: string; name: string };
// };

// type Trainee = {
//   id: string;
//   regNo: string;
//   name: string;
//   surname: string;
// };

// type Supervisor = {
//   id: string;
//   staffId: string;
//   name: string;
//   surname: string;
// };

// type School = {
//   id: string;
//   name: string;
// };

// const TPAssignmentPage = ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
//   const [assignments, setAssignments] = useState<TPAssignment[]>([]);
//   const [trainees, setTrainees] = useState<Trainee[]>([]);
//   const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
//   const [schools, setSchools] = useState<School[]>([]);
//   const [role, setRole] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
//   const [totalCount, setTotalCount] = useState(0);
//   const [totalPages, setTotalPages] = useState(1);
//   const [currentPage, setCurrentPage] = useState(1);

//   const router = useRouter();
//   const isFetching = useRef(false);
//   const pageRef = useRef(currentPage);
//   const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   // Debounce search query
//   useEffect(() => {
//     if (debounceTimeoutRef.current) {
//       clearTimeout(debounceTimeoutRef.current);
//     }
//     debounceTimeoutRef.current = setTimeout(() => {
//       setDebouncedSearchQuery(searchQuery);
//     }, 750);

//     return () => {
//       if (debounceTimeoutRef.current) {
//         clearTimeout(debounceTimeoutRef.current);
//       }
//     };
//   }, [searchQuery]);

//   // Verify token
//   useEffect(() => {
//     const verify = async () => {
//       try {
//         const data = await verifyToken();
//         console.log("TPAssignmentPage - Verify response:", data);
//         setRole(data.role);
//         if (data.role !== "admin") {
//           setError("Unauthorized: You lack permission to view this page.");
//           router.push("/unauthorized");
//         }
//       } catch (error: any) {
//         console.error("TPAssignmentPage - Verification error:", error);
//         const message = error.message || "Authentication failed";
//         setError(message);
//         toast.error(message);
//         router.push("/auth/signin");
//       }
//     };
//     verify();
//   }, [router]);

//   // Fetch dropdown data
//   useEffect(() => {
//     const fetchDropdownData = async () => {
//       try {
//         const [traineeResponse, supervisorResponse, schoolResponse] = await Promise.all([
//           getTrainees(1, ""),
//           getSupervisors(1, ""),
//           getSchools(1, "", ""),
//         ]);
//         console.log("TPAssignmentPage - Dropdown responses:", { traineeResponse, supervisorResponse, schoolResponse });
//         setTrainees(traineeResponse.trainees || []);
//         setSupervisors(supervisorResponse.supervisors || []);
//         setSchools(schoolResponse.schools || []);
//       } catch (err: any) {
//         console.error("TPAssignmentPage - Error fetching dropdown data:", err);
//         toast.error(err.message || "Failed to fetch dropdown data");
//       }
//     };
//     if (role === "admin") {
//       fetchDropdownData();
//     }
//   }, [role]);

//   // Fetch assignments
//   const fetchAssignments = useCallback(
//     async (page: number, resetPage = false) => {
//       if (role !== "admin" || isFetching.current) {
//         console.log("TPAssignmentPage - Skipping fetch: not admin or already fetching");
//         return;
//       }

//       isFetching.current = true;
//       setLoading(true);
//       setError(null);

//       try {
//         const pageToFetch = resetPage ? 1 : page;
//         console.log("TPAssignmentPage - Fetching assignments with params:", { page: pageToFetch, search: debouncedSearchQuery });
//         const response = await getTPAssignments(pageToFetch, debouncedSearchQuery);
//         console.log("TPAssignmentPage - Assignment response:", response);

//         if (response.assignments && Array.isArray(response.assignments)) {
//           const normalizedAssignments = response.assignments.map((a: any) => ({
//             ...a,
//             startDate: a.startDate || a.start_date || "",
//             endDate: a.endDate || a.end_date || "",
//           }));
//           setAssignments(normalizedAssignments);
//           setTotalCount(response.totalCount ?? 0);
//           setTotalPages(response.totalPages ?? Math.ceil((response.totalCount ?? 0) / 10) ?? 1);
//           if (resetPage && pageToFetch !== 1) {
//             setCurrentPage(1);
//             pageRef.current = 1;
//           } else if (pageToFetch !== pageRef.current) {
//             setCurrentPage(pageToFetch);
//             pageRef.current = pageToFetch;
//           }
//         } else {
//           setAssignments([]);
//           setTotalCount(0);
//           setTotalPages(1);
//           setError("No assignments found for the given criteria.");
//           toast.info("No assignments found for the given criteria.");
//         }
//       } catch (err: any) {
//         console.error("TPAssignmentPage - Error fetching assignments:", err);
//         let message = "Failed to fetch assignments. Please try again.";
//         if (err.response?.status === 401) {
//           message = "Session expired. Please sign in again.";
//           router.push("/auth/signin");
//         } else if (err.response?.status === 403) {
//           message = "Unauthorized: You lack permission to view assignments.";
//         }
//         setAssignments([]);
//         setTotalCount(0);
//         setTotalPages(1);
//         setError(message);
//         toast.error(message);
//       } finally {
//         setLoading(false);
//         isFetching.current = false;
//       }
//     },
//     [role, debouncedSearchQuery, router]
//   );

//   // Initial fetch
//   useEffect(() => {
//     if (role === "admin") {
//       fetchAssignments(1);
//     }
//   }, [role, fetchAssignments]);

//   // Fetch when debounced search changes
//   useEffect(() => {
//     if (role === "admin") {
//       fetchAssignments(1, true);
//     }
//   }, [debouncedSearchQuery, role, fetchAssignments]);

//   const handlePageChange = useCallback(
//     (newPage: number) => {
//       if (newPage < 1 || newPage > totalPages || newPage === pageRef.current) {
//         console.log("TPAssignmentPage - Invalid page change:", { newPage, totalPages, currentPage: pageRef.current });
//         return;
//       }
//       fetchAssignments(newPage);
//     },
//     [totalPages, fetchAssignments]
//   );

//   const handleRefetch = useCallback(
//     async (operation: "create" | "update" | "delete") => {
//       console.log("TPAssignmentPage - Refetch triggered for operation:", operation, "page:", pageRef.current);
//       await fetchAssignments(operation === "create" ? 1 : pageRef.current, operation === "create");
//     },
//     [fetchAssignments]
//   );

//   const clearSearch = useCallback(() => {
//     console.log("TPAssignmentPage - Clearing search");
//     setSearchQuery("");
//     setDebouncedSearchQuery("");
//     setCurrentPage(1);
//     pageRef.current = 1;
//     fetchAssignments(1, true);
//   }, [fetchAssignments]);

//   const formatDate = (dateString?: string): string => {
//     if (!dateString || dateString.trim() === "") return "-";
//     try {
//       const dateYMD = parse(dateString, "yyyy-MM-dd", new Date());
//       if (isValid(dateYMD)) {
//         return format(dateYMD, "dd/MM/yyyy");
//       }
//       const dateISO = parseISO(dateString);
//       if (isValid(dateISO)) {
//         return format(dateISO, "dd/MM/yyyy");
//       }
//       const fallbackDate = new Date(dateString);
//       if (isValid(fallbackDate)) {
//         return format(fallbackDate, "dd/MM/yyyy");
//       }
//       console.warn(`Invalid date format: ${dateString}`);
//       return "Invalid date";
//     } catch (err) {
//       console.warn(`Error parsing date: ${dateString}`, err);
//       return "Invalid date";
//     }
//   };

//   const columns = [
//     { header: "Trainee", accessor: "trainee" },
//     { header: "School", accessor: "school", className: "hidden md:table-cell" },
//     { header: "Supervisor", accessor: "supervisor", className: "hidden lg:table-cell" },
//     { header: "Start Date", accessor: "startDate", className: "hidden lg:table-cell" },
//     { header: "End Date", accessor: "endDate", className: "hidden lg:table-cell" },
//     ...(role === "admin" ? [{ header: "Actions", accessor: "action" }] : []),
//   ];

//   const renderRow = (item: TPAssignment) => (
//     <tr
//       key={item.id}
//       className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
//     >
//       <td className="flex items-center gap-4 p-4">
//         <div className="flex flex-col">
//           <h3 className="font-semibold">
//             {item.trainee ? `${item.trainee.name} ${item.trainee.surname}` : item.traineeId || "Unknown"}
//           </h3>
//           <p className="text-xs text-gray-500">{item.trainee?.regNo || item.traineeId || "-"}</p>
//         </div>
//       </td>
//       <td className="hidden md:table-cell">{item.school?.name || item.schoolId || "-"}</td>
//       <td className="hidden lg:table-cell">
//         {item.supervisor?.name && item.supervisor?.surname
//           ? `${item.supervisor.name} ${item.supervisor.surname}`
//           : item.supervisor?.name || item.supervisorId || "-"}
//       </td>
//       <td className="hidden lg:table-cell">{formatDate(item.startDate)}</td>
//       <td className="hidden lg:table-cell">{formatDate(item.endDate)}</td>
//       <td>
//         <div className="flex items-center gap-2">
//           {role === "admin" && (
//             <>
//               <FormModal
//                 table="tp_assignment"
//                 type="update"
//                 data={{
//                   id: item.id,
//                   traineeId: item.traineeId,
//                   schoolId: item.schoolId,
//                   supervisorId: item.supervisorId,
//                   startDate: item.startDate,
//                   endDate: item.endDate,
//                   trainees,
//                   supervisors,
//                   schools,
//                 }}
//                 refetch={() => handleRefetch("update")}
//               />
//               <FormModal
//                 table="tp_assignment"
//                 type="delete"
//                 id={item.id}
//                 refetch={() => handleRefetch("delete")}
//               />
//             </>
//           )}
//         </div>
//       </td>
//     </tr>
//   );

//   if (error) {
//     return (
//       <div className="p-4 text-red-500 bg-red-50 rounded-lg">
//         <p className="font-medium">{error}</p>
//         <div className="mt-4 flex gap-3">
//           <button
//             onClick={() => router.push("/auth/signin")}
//             className="px-4 py-2 bg-[#5244F3] text-white rounded-lg hover:bg-[#3b2db5] transition-colors"
//           >
//             Sign In
//           </button>
//           <button
//             onClick={() => fetchAssignments(1, true)}
//             className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (loading && assignments.length === 0) {
//     return (
//       <div className="p-4 flex items-center justify-center h-full">
//         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5244F3]"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
//       <div className="flex items-center justify-between mb-4">
//         <h1 className="hidden md:block text-lg font-semibold">TP Assignments</h1>
//         <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
//           <div className="flex items-center gap-2 w-full md:w-auto">
//             <TableSearch
//               placeholder="Search by Trainee Name, Reg No..."
//               onSearch={setSearchQuery}
//               value={searchQuery}
//               ariaLabel="Search assignments"
//             />
//             {searchQuery && (
//               <button
//                 onClick={clearSearch}
//                 className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
//               >
//                 Clear
//               </button>
//             )}
//           </div>
//           {role === "admin" && (
//             <FormModal
//               table="tp_assignment"
//               type="create"
//               refetch={() => handleRefetch("create")}
//               data={{ trainees, supervisors, schools }}
//             />
//           )}
//         </div>
//       </div>
//       {assignments.length === 0 ? (
//         <div className="bg-gray-50 p-6 text-center text-gray-500 rounded-md">
//           <p className="mb-4">No assignments found for the current search.</p>
//         </div>
//       ) : (
//         <>
//           <Table columns={columns} renderRow={renderRow} data={assignments} />
//           <Pagination
//             page={currentPage}
//             count={totalCount}
//             onPageChange={handlePageChange}
//           />
//         </>
//       )}
//     </div>
//   );
// };

// export default TPAssignmentPage;



















