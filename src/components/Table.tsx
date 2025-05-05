"use client";

import { ReactNode } from "react";

type Column<T> = {
  header: string;
  accessor: string;
  className?: string;
  sortable?: boolean;
  field?: string;
  onSort?: () => void;
};

type TableProps<T> = {
  columns: Column<T>[];
  renderRow: (item: T) => ReactNode;
  data: T[];
};

const Table = <T,>({ columns, renderRow, data }: TableProps<T>) => {
  console.log("Table render:", { data, columns });
  if (!data || !data.length) {
    console.log("Table: No data provided");
  }

  return (
    <table className="w-full mt-4">
      <thead>
        <tr className="text-left text-gray-500 text-sm">
          {columns.map((col) => (
            <th
              key={col.accessor}
              className={`p-4 ${col.className || ""} ${col.sortable ? "cursor-pointer" : ""}`}
              onClick={col.onSort}
            >
              <div className="flex items-center gap-2">
                {col.header}
                {col.sortable && (
                  <span className="text-gray-400">
                    {col.onSort ? "↑↓" : ""}
                  </span>
                )}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{data.map((item, index) => {
        console.log("Table mapping item:", item);
        return renderRow(item);
      })}</tbody>
    </table>
  );
};

export default Table;












































// // src/components/Table.tsx
// import { ReactNode } from "react";

// type Column<T> = {
//   header: string;
//   accessor: string;
//   className?: string;
//   sortable?: boolean;
//   field?: string;
//   onSort?: () => void;
// };

// type TableProps<T> = {
//   columns: Column<T>[];
//   renderRow: (item: T) => ReactNode;
//   data: T[];
// };

// const Table = <T,>({ columns, renderRow, data }: TableProps<T>) => {
//   console.log("Table Data:", data); // Debug log
//   return (
//     <table className="w-full mt-4">
//       <thead>
//         <tr className="text-left text-gray-500 text-sm">
//           {columns.map((col) => (
//             <th
//               key={col.accessor}
//               className={`p-4 ${col.className || ""} ${col.sortable ? "cursor-pointer" : ""}`}
//               onClick={col.onSort}
//             >
//               <div className="flex items-center gap-2">
//                 {col.header}
//                 {col.sortable && (
//                   <span className="text-gray-400">
//                     {col.onSort ? "↑↓" : ""}
//                   </span>
//                 )}
//               </div>
//             </th>
//           ))}
//         </tr>
//       </thead>
//       <tbody>{data.map((item) => renderRow(item))}</tbody>
//     </table>
//   );
// };

// export default Table;




// const Table = ({
//   columns,
//   renderRow,
//   data,
// }: {
//   columns: { header: string; accessor: string; className?: string }[];
//   renderRow: (item: any) => React.ReactNode;
//   data: any[];
// }) => {
//   return (
//     <table className="w-full mt-4">
//       <thead>
//         <tr className="text-left text-gray-500 text-sm">
//           {columns.map((col) => (
//             <th key={col.accessor} className={col.className}>{col.header}</th>
//           ))}
//         </tr>
//       </thead>
//       <tbody>{data.map((item) => renderRow(item))}</tbody>
//     </table>
//   );
// };

// export default Table;
