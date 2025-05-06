"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getSupervisorEvaluations } from "@/lib/api";

// Define the shape of a supervisor evaluation
type SupervisorEvaluation = {
  id: string;
  supervisorId: string;
  rating: number;
  comments?: string;
  timestamp?: string;
  supervisor: { id: string; name: string; surname: string };
};

const SupervisorEvaluationListPage = ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
  // State for evaluations data, loading, pagination, and search
  const [evaluations, setEvaluations] = useState<SupervisorEvaluation[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // Raw search input
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(""); // Debounced for API
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: "asc" | "desc" }>({
    field: "supervisor.name",
    direction: "asc",
  });

  const router = useRouter();
  const pageRef = useRef(currentPage); // Track currentPage to avoid dependency cycle
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null); // For debouncing

  // Debounce search query to limit API calls
  useEffect(() => {
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    // Set new timeout to update debouncedSearchQuery after 500ms
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    // Cleanup timeout on unmount or query change
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Fetch evaluations from API
  const fetchEvaluations = useCallback(
    async (page: number, resetPage = false) => {
      if (isFetching) return; // Prevent concurrent fetches
      setIsFetching(true);
      setLoading(true);
      try {
        const pageToFetch = resetPage ? 1 : page;
        const response = await getSupervisorEvaluations(pageToFetch, debouncedSearchQuery);
        if (response.evaluations && Array.isArray(response.evaluations)) {
          setEvaluations(response.evaluations);
          setTotalCount(response.totalCount ?? 0);
          setTotalPages(response.totalPages ?? 1);
          if (resetPage && pageToFetch !== 1) {
            setCurrentPage(1);
            pageRef.current = 1;
          } else if (pageToFetch !== pageRef.current) {
            setCurrentPage(pageToFetch);
            pageRef.current = pageToFetch;
          }
        } else {
          setEvaluations([]);
          setTotalCount(0);
          setTotalPages(1);
          toast.error("Invalid data received from server");
        }
      } catch (err: any) {
        console.error("Error fetching supervisor evaluations:", err);
        toast.error(err.message || "Failed to fetch supervisor evaluations");
        setEvaluations([]);
      } finally {
        setIsFetching(false);
        setLoading(false);
      }
    },
    [debouncedSearchQuery] // Depend only on debounced search query
  );

  // Handle pagination
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages || newPage === pageRef.current) return;
      fetchEvaluations(newPage);
    },
    [totalPages, fetchEvaluations]
  );

  // Refetch evaluations after CRUD operations
  const handleRefetch = useCallback(
    async () => {
      await fetchEvaluations(pageRef.current);
    },
    [fetchEvaluations]
  );

  // Toggle sort direction
  const toggleSort = (field: string) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Initial fetch and token check
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    if (!token) {
      router.push("/auth/signin");
      return;
    }
    fetchEvaluations(1);
  }, [fetchEvaluations, router]);

  // Fetch when debounced search query changes
  useEffect(() => {
    fetchEvaluations(1, true);
  }, [debouncedSearchQuery, fetchEvaluations]);

  // Define table columns
  const columns = [
    { header: "Supervisor", accessor: "supervisor", sortable: true, field: "supervisor.name" },
    { header: "Rating", accessor: "rating", sortable: true, field: "rating" },
    { header: "Comments", accessor: "comments", className: "hidden lg:table-cell" },
    { header: "Timestamp", accessor: "timestamp", className: "hidden md:table-cell", sortable: true, field: "timestamp" },
    { header: "Actions", accessor: "action" },
  ];

  // Render table rows
  const renderRow = (item: SupervisorEvaluation) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">
            {item.supervisor.name} {item.supervisor.surname}
          </h3>
        </div>
      </td>
      <td>{item.rating}/10</td>
      <td className="hidden lg:table-cell">{item.comments || "-"}</td>
      <td className="hidden md:table-cell">{item.timestamp || "-"}</td>
      <td>
        <div className="flex items-center gap-2">
          <FormModal
            table="supervisor_evaluation"
            type="update"
            data={item}
            refetch={handleRefetch}
          />
          <FormModal
            table="supervisor_evaluation"
            type="delete"
            id={item.id}
            refetch={handleRefetch}
          />
        </div>
      </td>
    </tr>
  );

  // Show loading state
  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Supervisor Evaluations</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch
            placeholder="Search by Supervisor Name..."
            onSearch={setSearchQuery}
            value={searchQuery}
          />
          <div className="flex items-center gap-4 self-end">
            <button
              onClick={() => toggleSort("supervisor.name")}
              className="w-8 h-7 flex items-center justify-center rounded-full bg-lamaYellow"
            >
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            <FormModal
              table="supervisor_evaluation"
              type="create"
              refetch={handleRefetch}
            />
          </div>
        </div>
      </div>
      <Table
        columns={columns.map((col) => ({
          ...col,
          onSort: col.sortable ? () => toggleSort(col.field || col.accessor) : undefined,
        }))}
        renderRow={renderRow}
        data={evaluations}
      />
      <Pagination
        page={currentPage}
        count={totalCount}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default SupervisorEvaluationListPage;






























// "use client";

// import { useState, useEffect, useCallback } from "react";
// import FormModal from "@/components/FormModal";
// import Pagination from "@/components/Pagination";
// import Table from "@/components/Table";
// import TableSearch from "@/components/TableSearch";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { toast } from "react-toastify";
// import { useTableSearch } from "@/hooks/useTableSearch";
// import { getSupervisorEvaluations } from "@/lib/api";

// type SupervisorEvaluation = {
//   id: string;
//   supervisorId: string;
//   rating: number;
//   comments?: string;
//   timestamp?: string;
//   supervisor: { id: string; name: string; surname: string };
// };

// const SupervisorEvaluationListPage = ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
//   const [evaluations, setEvaluations] = useState<SupervisorEvaluation[]>([]);
//   const [role, setRole] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [totalCount, setTotalCount] = useState(0);
//   const [totalPages, setTotalPages] = useState(1);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isFetching, setIsFetching] = useState(false);

//   const router = useRouter();

//   const {
//     searchQuery,
//     setSearchQuery,
//     sortConfig,
//     toggleSort,
//   } = useTableSearch<SupervisorEvaluation>({
//     data: evaluations,
//     searchableFields: [
//       (item) => `${item.supervisor.name} ${item.supervisor.surname}`,
//     ],
//     initialSortField: "supervisor.name",
//     initialSortDirection: "asc",
//     itemsPerPage: 10,
//   });

//   const fetchEvaluations = useCallback(
//     async (page: number, resetPage = false) => {
//       if (isFetching) return;
//       setIsFetching(true);
//       setLoading(true);
//       try {
//         const pageToFetch = resetPage ? 1 : page;
//         const response = await getSupervisorEvaluations(pageToFetch, searchQuery);
//         if (response.evaluations && Array.isArray(response.evaluations)) {
//           setEvaluations(response.evaluations);
//           setTotalCount(response.totalCount ?? 0);
//           setTotalPages(response.totalPages ?? 1);
//           if (resetPage && currentPage !== 1) {
//             setCurrentPage(1);
//           } else if (pageToFetch !== currentPage) {
//             setCurrentPage(pageToFetch);
//           }
//         } else {
//           setEvaluations([]);
//           setTotalCount(0);
//           setTotalPages(1);
//           toast.error("Invalid data received from server");
//         }
//       } catch (err: any) {
//         console.error("Error fetching supervisor evaluations:", err);
//         toast.error(err.message || "Failed to fetch supervisor evaluations");
//         setEvaluations([]);
//       } finally {
//         setLoading(false);
//         setIsFetching(false);
//       }
//     },
//     [isFetching, searchQuery, currentPage]
//   );

//   const handlePageChange = useCallback(
//     (newPage: number) => {
//       if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
//       setCurrentPage(newPage);
//       fetchEvaluations(newPage);
//     },
//     [totalPages, currentPage, fetchEvaluations]
//   );

//   // const handleRefetch = useCallback(
//   //   () => {
//   //     fetchEvaluations(currentPage);
//   //   },
//   //   [currentPage, fetchEvaluations]
//   // );


//   const handleRefetch = useCallback(
//     async () => {
//       await fetchEvaluations(currentPage);
//     },
//     [currentPage, fetchEvaluations]
//   );









  

//   useEffect(() => {
//     const token = document.cookie
//       .split("; ")
//       .find((row) => row.startsWith("token="))
//       ?.split("=")[1];
//     if (!token) {
//       router.push("/auth/signin");
//       return;
//     }
//     fetchEvaluations(1);
//   }, [fetchEvaluations, router]);

//   useEffect(() => {
//     fetchEvaluations(1, true);
//   }, [searchQuery, fetchEvaluations]);

//   const columns = [
//     { header: "Supervisor", accessor: "supervisor", sortable: true, field: "supervisor.name" },
//     { header: "Rating", accessor: "rating", sortable: true, field: "rating" },
//     { header: "Comments", accessor: "comments", className: "hidden lg:table-cell" },
//     { header: "Timestamp", accessor: "timestamp", className: "hidden md:table-cell", sortable: true, field: "timestamp" },
//     { header: "Actions", accessor: "action" },
//   ];

//   const renderRow = (item: SupervisorEvaluation) => (
//     <tr
//       key={item.id}
//       className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
//     >
//       <td className="p-4">
//         <div className="flex flex-col">
//           <h3 className="font-semibold">
//             {item.supervisor.name} {item.supervisor.surname}
//           </h3>
//         </div>
//       </td>
//       <td>{item.rating}/10</td>
//       <td className="hidden lg:table-cell">{item.comments || "-"}</td>
//       <td className="hidden md:table-cell">{item.timestamp || "-"}</td>
//       <td>
//         <div className="flex items-center gap-2">
//           <FormModal
//             table="supervisor_evaluation"
//             type="update"
//             data={item}
//             refetch={handleRefetch}
//           />
//           <FormModal
//             table="supervisor_evaluation"
//             type="delete"
//             id={item.id}
//             refetch={handleRefetch}
//           />
//         </div>
//       </td>
//     </tr>
//   );

//   if (loading) return <div className="p-4">Loading...</div>;

//   return (
//     <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
//       <div className="flex items-center justify-between">
//         <h1 className="hidden md:block text-lg font-semibold">Supervisor Evaluations</h1>
//         <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
//           <TableSearch
//             placeholder="Search by Supervisor Name..."
//             onSearch={setSearchQuery}
//           />
//           <div className="flex items-center gap-4 self-end">
//             <button
//               onClick={() => toggleSort("supervisor.name")}
//               className="w-8 h-7 flex items-center justify-center rounded-full bg-lamaYellow"
//             >
//               <Image src="/sort.png" alt="Sort" width={14} height={14} />
//             </button>
//             <FormModal
//               table="supervisor_evaluation"
//               type="create"
//               refetch={handleRefetch}
//             />
//           </div>
//         </div>
//       </div>
//       <Table
//         columns={columns.map((col) => ({
//           ...col,
//           onSort: col.sortable ? () => toggleSort(col.field || col.accessor) : undefined,
//         }))}
//         renderRow={renderRow}
//         data={evaluations}
//       />
//       <Pagination
//         page={currentPage}
//         count={totalCount}
//         onPageChange={handlePageChange}
//       />
//     </div>
//   );
// };

// export default SupervisorEvaluationListPage;














