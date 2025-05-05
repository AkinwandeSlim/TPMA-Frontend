
"use client";

import { useState, useEffect, useCallback } from "react";
import FormModal from "@/components/FormModal";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTableSearch } from "@/hooks/useTableSearch";
import { getStudentEvaluations } from "@/lib/api";

type StudentEvaluation = {
  id: string;
  tpAssignmentId: string;
  traineeId: string;
  supervisorId: string;
  score: number;
  comments?: string;
  submittedAt?: string;
  trainee: { id: string; name: string; surname: string };
  supervisor: { id: string; name: string; surname: string };
};

const StudentEvaluationListPage = ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
  const [evaluations, setEvaluations] = useState<StudentEvaluation[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);

  const router = useRouter();

  const {
    searchQuery,
    setSearchQuery,
    sortConfig,
    toggleSort,
  } = useTableSearch<StudentEvaluation>({
    data: evaluations,
    searchableFields: [
      (item) => `${item.trainee.name} ${item.trainee.surname}`,
      (item) => `${item.supervisor.name} ${item.supervisor.surname}`,
    ],
    initialSortField: "trainee.name",
    initialSortDirection: "asc",
    itemsPerPage: 10,
  });

  const fetchEvaluations = useCallback(
    async (page: number, resetPage = false) => {
      if (isFetching) return;
      setIsFetching(true);
      setLoading(true);
      try {
        const pageToFetch = resetPage ? 1 : page;
        const response = await getStudentEvaluations(pageToFetch, searchQuery);
        if (response.evaluations && Array.isArray(response.evaluations)) {
          setEvaluations(response.evaluations);
          setTotalCount(response.totalCount ?? 0);
          setTotalPages(response.totalPages ?? 1);
          if (resetPage && currentPage !== 1) {
            setCurrentPage(1);
          } else if (pageToFetch !== currentPage) {
            setCurrentPage(pageToFetch);
          }
        } else {
          setEvaluations([]);
          setTotalCount(0);
          setTotalPages(1);
          toast.error("Invalid data received from server");
        }
      } catch (err: any) {
        console.error("Error fetching student evaluations:", err);
        toast.error(err.message || "Failed to fetch student evaluations");
        setEvaluations([]);
      } finally {
        setLoading(false);
        setIsFetching(false);
      }
    },
    [isFetching, searchQuery, currentPage]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
      setCurrentPage(newPage);
      fetchEvaluations(newPage);
    },
    [totalPages, currentPage, fetchEvaluations]
  );

  const handleRefetch = useCallback(
    async () => {
      await fetchEvaluations(currentPage);
    },
    [currentPage, fetchEvaluations]
  );

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

  useEffect(() => {
    fetchEvaluations(1, true);
  }, [searchQuery, fetchEvaluations]);

  const columns = [
    { header: "Trainee", accessor: "trainee", sortable: true, field: "trainee.name" },
    { header: "Supervisor", accessor: "supervisor", sortable: true, field: "supervisor.name" },
    { header: "Score", accessor: "score", sortable: true, field: "score" },
    { header: "Comments", accessor: "comments", className: "hidden lg:table-cell" },
    { header: "Submitted At", accessor: "submittedAt", className: "hidden md:table-cell", sortable: true, field: "submittedAt" },
    { header: "Actions", accessor: "action" },
  ];

  const renderRow = (item: StudentEvaluation) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">
        <div className="flex flex-col">
          <h3 className="font-semibold">
            {item.trainee.name} {item.trainee.surname}
          </h3>
        </div>
      </td>
      <td>
        {item.supervisor.name} {item.supervisor.surname}
      </td>
      <td>{item.score}/100</td>
      <td className="hidden lg:table-cell">{item.comments || "-"}</td>
      <td className="hidden md:table-cell">{item.submittedAt || "-"}</td>
      <td>
        <div className="flex items-center gap-2">
          <FormModal
            table="student_evaluation"
            type="update"
            data={item}
            refetch={handleRefetch}
          />
          <FormModal
            table="student_evaluation"
            type="delete"
            id={item.id}
            refetch={handleRefetch}
          />
        </div>
      </td>
    </tr>
  );

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Student Evaluations</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch
            placeholder="Search by Trainee or Supervisor Name..."
            onSearch={setSearchQuery}
          />
          <div className="flex items-center gap-4 self-end">
            <button
              onClick={() => toggleSort("trainee.name")}
              className="w-8 h-7 flex items-center justify-center rounded-full bg-lamaYellow"
            >
              <Image src="/sort.png" alt="Sort" width={14} height={14} />
            </button>
            <FormModal
              table="student_evaluation"
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

export default StudentEvaluationListPage;





































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
// import { getStudentEvaluations } from "@/lib/api";

// type StudentEvaluation = {
//   id: string;
//   tpAssignmentId: string;
//   traineeId: string;
//   supervisorId: string;
//   score: number;
//   comments?: string;
//   submittedAt?: string;
//   trainee: { id: string; name: string; surname: string };
//   supervisor: { id: string; name: string; surname: string };
// };

// const StudentEvaluationListPage = ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
//   const [evaluations, setEvaluations] = useState<StudentEvaluation[]>([]);
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
//   } = useTableSearch<StudentEvaluation>({
//     data: evaluations,
//     searchableFields: [
//       (item) => `${item.trainee.name} ${item.trainee.surname}`,
//       (item) => `${item.supervisor.name} ${item.supervisor.surname}`,
//     ],
//     initialSortField: "trainee.name",
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
//         const response = await getStudentEvaluations(pageToFetch, searchQuery);
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
//         console.error("Error fetching student evaluations:", err);
//         toast.error(err.message || "Failed to fetch student evaluations");
//         setEvaluations([]);
//       } finally {
//         setLoading(false);
//         setIsFetching(false);
//       }
//     },
//     [isFetching,searchQuery, currentPage]
//   );

//   const handlePageChange = useCallback(
//     (newPage: number) => {
//       if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
//       setCurrentPage(newPage);
//       fetchEvaluations(newPage);
//     },
//     [totalPages, currentPage, fetchEvaluations]
//   );

//   const handleRefetch = useCallback(
//     () => {
//       fetchEvaluations(currentPage);
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
//   }, [fetchEvaluations,router]);

//   useEffect(() => {
//     fetchEvaluations(1, true);
//   }, [searchQuery, fetchEvaluations]);

//   const columns = [
//     { header: "Trainee", accessor: "trainee", sortable: true, field: "trainee.name" },
//     { header: "Supervisor", accessor: "supervisor", sortable: true, field: "supervisor.name" },
//     { header: "Score", accessor: "score", sortable: true, field: "score" },
//     { header: "Comments", accessor: "comments", className: "hidden lg:table-cell" },
//     { header: "Submitted At", accessor: "submittedAt", className: "hidden md:table-cell", sortable: true, field: "submittedAt" },
//     { header: "Actions", accessor: "action" },
//   ];

//   const renderRow = (item: StudentEvaluation) => (
//     <tr
//       key={item.id}
//       className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
//     >
//       <td className="p-4">
//         <div className="flex flex-col">
//           <h3 className="font-semibold">
//             {item.trainee.name} {item.trainee.surname}
//           </h3>
//         </div>
//       </td>
//       <td>
//         {item.supervisor.name} {item.supervisor.surname}
//       </td>
//       <td>{item.score}/100</td>
//       <td className="hidden lg:table-cell">{item.comments || "-"}</td>
//       <td className="hidden md:table-cell">{item.submittedAt || "-"}</td>
//       <td>
//         <div className="flex items-center gap-2">
//           <FormModal
//             table="student_evaluation"
//             type="update"
//             data={item}
//             refetch={handleRefetch}
//           />
//           <FormModal
//             table="student_evaluation"
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
//         <h1 className="hidden md:block text-lg font-semibold">Student Evaluations</h1>
//         <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
//           <TableSearch
//             placeholder="Search by Trainee or Supervisor Name..."
//             onSearch={setSearchQuery}
//           />
//           <div className="flex items-center gap-4 self-end">
//             <button
//               onClick={() => toggleSort("trainee.name")}
//               className="w-8 h-7 flex items-center justify-center rounded-full bg-lamaYellow"
//             >
//               <Image src="/sort.png" alt="Sort" width={14} height={14} />
//             </button>
//             <FormModal
//               table="student_evaluation"
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

// export default StudentEvaluationListPage;
































































// import FormContainer from "@/components/FormContainer";
// import Pagination from "@/components/Pagination";
// import Table from "@/components/Table";
// import TableSearch from "@/components/TableSearch";
// import prisma from "@/lib/prisma";
// import { ITEM_PER_PAGE } from "@/lib/settings";
// import { Class, Prisma, Teacher } from "@prisma/client";
// import Image from "next/image";
// import { auth } from "@clerk/nextjs/server";

// type ClassList = Class & { supervisor: Teacher };

// const ClassListPage = async ({
//   searchParams,
// }: {
//   searchParams: { [key: string]: string | undefined };
// }) => {

// const { sessionClaims } = auth();
// const role = (sessionClaims?.metadata as { role?: string })?.role;


// const columns = [
//   {
//     header: "Class Name",
//     accessor: "name",
//   },
//   {
//     header: "Capacity",
//     accessor: "capacity",
//     className: "hidden md:table-cell",
//   },
//   {
//     header: "Grade",
//     accessor: "grade",
//     className: "hidden md:table-cell",
//   },
//   {
//     header: "Supervisor",
//     accessor: "supervisor",
//     className: "hidden md:table-cell",
//   },
//   ...(role === "admin"
//     ? [
//         {
//           header: "Actions",
//           accessor: "action",
//         },
//       ]
//     : []),
// ];

// const renderRow = (item: ClassList) => (
//   <tr
//     key={item.id}
//     className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
//   >
//     <td className="flex items-center gap-4 p-4">{item.name}</td>
//     <td className="hidden md:table-cell">{item.capacity}</td>
//     <td className="hidden md:table-cell">{item.name[0]}</td>
//     <td className="hidden md:table-cell">
//       {item.supervisor.name + " " + item.supervisor.surname}
//     </td>
//     <td>
//       <div className="flex items-center gap-2">
//         {role === "admin" && (
//           <>
//             <FormContainer table="class" type="update" data={item} />
//             <FormContainer table="class" type="delete" id={item.id} />
//           </>
//         )}
//       </div>
//     </td>
//   </tr>
// );

//   const { page, ...queryParams } = searchParams;

//   const p = page ? parseInt(page) : 1;

//   // URL PARAMS CONDITION

//   const query: Prisma.ClassWhereInput = {};

//   if (queryParams) {
//     for (const [key, value] of Object.entries(queryParams)) {
//       if (value !== undefined) {
//         switch (key) {
//           case "supervisorId":
//             query.supervisorId = value;
//             break;
//           case "search":
//             query.name = { contains: value, mode: "insensitive" };
//             break;
//           default:
//             break;
//         }
//       }
//     }
//   }

//   const [data, count] = await prisma.$transaction([
//     prisma.class.findMany({
//       where: query,
//       include: {
//         supervisor: true,
//       },
//       take: ITEM_PER_PAGE,
//       skip: ITEM_PER_PAGE * (p - 1),
//     }),
//     prisma.class.count({ where: query }),
//   ]);

//   return (
//     <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
//       {/* TOP */}
//       <div className="flex items-center justify-between">
//         <h1 className="hidden md:block text-lg font-semibold">All Classes</h1>
//         <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
//           <TableSearch />
//           <div className="flex items-center gap-4 self-end">
//             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
//               <Image src="/filter.png" alt="" width={14} height={14} />
//             </button>
//             <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
//               <Image src="/sort.png" alt="" width={14} height={14} />
//             </button>
//             {role === "admin" && <FormContainer table="class" type="create" />}
//           </div>
//         </div>
//       </div>
//       {/* LIST */}
//       <Table columns={columns} renderRow={renderRow} data={data} />
//       {/* PAGINATION */}
//       <Pagination page={p} count={count} />
//     </div>
//   );
// };

// export default ClassListPage;
