// src/components/TraineeDetailsModal.tsx
"use client";

import Image from "next/image";

type TraineeDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  trainee: {
    id: string;
    regNo: string;
    name: string;
    surname: string;
    email?: string;
    phone?: string;
    img?: string;
    progress?: number;
    placeOfTP?: string;
  };
};

const TraineeDetailsModal = ({ isOpen, onClose, trainee }: TraineeDetailsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md max-w-md w-full">
        <h2 className="text-lg font-semibold mb-4">Trainee Details</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Image
              src={trainee.img || "/noAvatar.png"}
              alt={`${trainee.name} ${trainee.surname}`}
              width={80}
              height={80}
              style={{ width: "80px", height: "80px", objectFit: "cover" }}
              className="rounded-full"
            />
            <div>
              <h3 className="text-md font-semibold">
                {trainee.name} {trainee.surname}
              </h3>
              <p className="text-xs text-gray-500">Reg No: {trainee.regNo}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Email:</span> {trainee.email || "N/A"}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Phone:</span> {trainee.phone || "N/A"}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Place of TP:</span> {trainee.placeOfTP || "N/A"}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Progress:</span> {trainee.progress ? `${trainee.progress}%` : "N/A"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TraineeDetailsModal;