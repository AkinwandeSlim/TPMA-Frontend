// src/components/ReportPreview.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Table from "@/components/Table";

export default function ReportPreview() {
  const [reports, setReports] = useState([]);

  const columns = [
    { header: "Reg No.", accessor: "regNo" },
    { header: "Date", accessor: "date" },
    { header: "TP Location", accessor: "tpLocation", className: "hidden md:table-cell" },
    { header: "Status", accessor: "status", className: "hidden md:table-cell" },
  ];

  const renderRow = (item: { regNo: string; date: string; tpLocation: string; submitted: boolean }) => (
    <tr key={item.regNo} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="p-4">{item.regNo}</td>
      <td className="p-4">{new Date(item.date).toLocaleDateString("en-GB")}</td>
      <td className="hidden md:table-cell p-4">{item.tpLocation}</td>
      <td className="hidden md:table-cell p-4">{item.submitted ? "Submitted" : "Pending"}</td>
    </tr>
  );

  const fetchReports = async (query = {}) => {
    const token = document.cookie.split("; ").find((row) => row.startsWith("token="))?.split("=")[1];
    if (!token) {
      console.log("No token found for ReportPreview");
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/api/admin/reports/preview", {
        headers: { Authorization: `Bearer ${token}` },
        params: query,
      });
      console.log("ReportPreview - Data:", response.data);
      setReports(response.data);
    } catch (error:any) {
      console.error("ReportPreview - Fetch error:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="bg-white rounded-md p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold hidden md:block">Report Preview</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <Table columns={columns} renderRow={renderRow} data={reports} />
      </div>
    </div>
  );
}