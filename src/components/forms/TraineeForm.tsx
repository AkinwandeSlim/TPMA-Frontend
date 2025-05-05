
"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TraineeSchema, TraineeSchemaType } from "@/lib/formValidationSchemas";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import InputField from "../InputField";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { createTrainee, updateTrainee, deleteTrainee, getSupervisors } from "@/lib/api";


type Props = {
  type: "create" | "update";
  data?: Partial<TraineeSchemaType> & { id?: string };
  onClose: () => void;
  refetch?: () => Promise<void>;
};

const TraineeForm = ({ type, data, onClose, refetch }: Props) => {
  const router = useRouter();
  const [img, setImg] = useState<string | undefined>(data?.img);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TraineeSchemaType>({
    resolver: zodResolver(TraineeSchema),
    defaultValues: {
      regNo: data?.regNo || "",
      email: data?.email || "",
      password: "",
      name: data?.name || "",
      surname: data?.surname || "",
      phone: data?.phone || "",
      address: data?.address || "",
      bloodType: data?.bloodType || "",
      sex: data?.sex || undefined,
      birthday: data?.birthday || "",
      progress: data?.progress ?? 0,
      img: data?.img || "",
    },
  });

  const onSubmit = async (formData: TraineeSchemaType) => {
    try {
      setFormError(null);
      let formDataWithImg = { ...formData, img: img || formData.img };

      // For updates, only include password if provided
      if (type === "update") {
        const { password, ...updateData } = formDataWithImg;
        formDataWithImg = password ? { ...updateData, password } : updateData;
      }

      console.log(`${type === "create" ? "Creating" : "Updating"} trainee with data:`, formDataWithImg);

      if (type === "create") {
        await createTrainee(formDataWithImg);
        toast.success("Trainee created successfully");
      } else if (type === "update" && data?.id) {
        await updateTrainee(data.id, formDataWithImg);
        toast.success("Trainee updated successfully");
      } else {
        throw new Error("Cannot update trainee: ID is missing");
      }

      onClose();
      if (refetch) {
        await refetch();
      } else {
        router.push("/list/trainees");
      }
    } catch (error: any) {
      console.error(`Error ${type === "create" ? "creating" : "updating"} trainee:`, error);
      const message = error.response?.data?.error || `Failed to ${type === "create" ? "create" : "update"} trainee`;
      setFormError(message);
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!data?.id) {
      toast.error("Cannot delete trainee: ID is missing");
      return;
    }
    try {
      await deleteTrainee(data.id);
      toast.success("Trainee deleted successfully");
      if (refetch) {
        await refetch();
      }
      onClose();
      router.push("/list/trainees");
    } catch (error: any) {
      console.error("Error deleting trainee:", error);
      const message = error.response?.data?.error || "Failed to delete trainee";
      toast.error(message);
    }
  };

  if (formError) {
    return (
      <div className="p-4 text-red-500">
        {formError}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new trainee" : "Update trainee profile"}
      </h1>

      {/* Section 1: Account Info */}
      <span className="text-xs text-gray-400 font-medium">Authentication Information</span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Registration Number"
          name="regNo"
          defaultValue={data?.regNo}
          register={register("regNo")}
          error={errors.regNo}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register("email")}
          error={errors.email}
        />
        <InputField
          label={type === "create" ? "Password" : "New Password (optional)"}
          name="password"
          type="password"
          register={register("password")}
          error={errors.password}
          inputProps={{ autoComplete: type === "create" ? "new-password" : "current-password" }}
        />
      </div>

      {/* Section 2: Personal Info */}
      <span className="text-xs text-gray-400 font-medium">Personal Information</span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="First Name"
          name="name"
          defaultValue={data?.name}
          register={register("name")}
          error={errors.name}
        />
        <InputField
          label="Last Name"
          name="surname"
          defaultValue={data?.surname}
          register={register("surname")}
          error={errors.surname}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register("phone")}
          error={errors.phone}
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register("address")}
          error={errors.address}
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Blood Type</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("bloodType")}
            defaultValue={data?.bloodType || ""}
          >
            <option value="">Select</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
          {errors.bloodType?.message && (
            <p className="text-xs text-red-400">{errors.bloodType.message}</p>
          )}
        </div>
        <InputField
          label="Birthday"
          name="birthday"
          type="date"
          defaultValue={data?.birthday ? new Date(data.birthday).toISOString().split("T")[0] : ""}
          register={register("birthday")}
          error={errors.birthday}
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Sex</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("sex")}
            defaultValue={data?.sex || ""}
          >
            <option value="">Select</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs text-red-400">{errors.sex.message}</p>
          )}
        </div>
      </div>

      {/* Section 3: Progress */}
      <span className="text-xs text-gray-400 font-medium">Progress</span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Progress (%)"
          name="progress"
          type="number"
          defaultValue={data?.progress}
          register={register("progress", { valueAsNumber: true })}
          error={errors.progress}
          inputProps={{ min: 0, max: 100 }}
        />
        <div className="flex flex-col gap-2">
          <CldUploadWidget
            uploadPreset="school"
            onSuccess={(result: any) => {
              setImg(result.info?.secure_url);
            }}
          >
            {({ open }) => (
              <div
                className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
                onClick={() => open()}
              >
                <Image src="/upload.png" alt="" width={28} height={28} />
                <span>Upload a photo</span>
              </div>
            )}
          </CldUploadWidget>
          {img && (
            <div className="mt-2">
              <Image
                src={img}
                alt="Trainee Preview"
                width={100}
                height={100}
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
                className="rounded-md"
              />
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-400 text-white p-2 rounded-md hover:bg-blue-500 transition-colors"
        >
          {isSubmitting ? "Submitting..." : type === "create" ? "Create" : "Update"}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="bg-gray-400 text-white p-2 rounded-md hover:bg-gray-500 transition-colors"
        >
          Cancel
        </button>
        {type === "update" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="bg-red-400 text-white p-2 rounded-md hover:bg-red-500 transition-colors"
          >
            {isSubmitting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
    </form>
  );
};

export default TraineeForm;
























// "use client";

// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { TraineeSchema, TraineeSchemaType } from "../../lib/formValidationSchemas";
// import { toast } from "react-toastify";
// import { useState } from "react";
// import InputField from "../InputField";
// import { CldUploadWidget } from "next-cloudinary";
// import Image from "next/image";
// import { createTrainee, updateTrainee } from "@/lib/api";

// type Props = {
//   type: "create" | "update";
//   data?: Partial<TraineeSchemaType>;
//   onClose: () => void;
//   refetch?: () => Promise<void>;
// };

// const TraineeForm = ({ type, data, onClose, refetch }: Props) => {
//   const router = useRouter();
//   const [img, setImg] = useState<string | undefined>(data?.img);
//   const [formError, setFormError] = useState<string | null>(null);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<TraineeSchemaType>({
//     resolver: zodResolver(TraineeSchema),
//     defaultValues: {
//       regNo: data?.regNo || "",
//       email: data?.email || "",
//       password: "",
//       name: data?.name || "",
//       surname: data?.surname || "",
//       phone: data?.phone || "",
//       address: data?.address || "",
//       bloodType: data?.bloodType || "",
//       sex: data?.sex || undefined,
//       birthday: data?.birthday || "",
//       progress: data?.progress ?? 0,
//       img: data?.img || "",
//     },
//   });

//   const onSubmit = async (formData: TraineeSchemaType) => {
//     try {
//       setFormError(null);
//       let formDataWithImg = { ...formData, img: img || formData.img };

//       // For updates, only include password if provided
//       if (type === "update") {
//         const { password, ...updateData } = formDataWithImg;
//         formDataWithImg = password ? { ...updateData, password } : updateData;
//       }

//       console.log(`${type === "create" ? "Creating" : "Updating"} trainee with data:`, formDataWithImg);

//       if (type === "create") {
//         await createTrainee(formDataWithImg);
//         toast.success("Trainee created successfully");
//       } else if (type === "update" && data?.id) {
//         await updateTrainee(data.id, formDataWithImg);
//         toast.success("Trainee updated successfully");
//       } else {
//         throw new Error("Cannot update trainee: ID is missing");
//       }

//       onClose();
//       if (refetch) {
//         await refetch();
//       } else {
//         router.push("/list/trainees");
//       }
//     } catch (error: any) {
//       console.error(`Error ${type === "create" ? "creating" : "updating"} trainee:`, error);
//       const message = error.response?.data?.error || `Failed to ${type === "create" ? "create" : "update"} trainee`;
//       setFormError(message);
//       toast.error(message);
//     }
//   };

//   const handleDelete = async () => {
//     if (!data?.id) {
//       toast.error("Cannot delete trainee: ID is missing");
//       return;
//     }
//     try {
//       await deleteTrainee(data.id);
//       toast.success("Trainee deleted successfully");
//       if (refetch) {
//         await refetch();
//       }
//       onClose();
//       router.push("/list/trainees");
//     } catch (error: any) {
//       console.error("Error deleting trainee:", error);
//       const message = error.response?.data?.error || "Failed to delete trainee";
//       toast.error(message);
//     }
//   };

//   if (formError) {
//     return (
//       <div className="p-4 text-red-500">
//         {formError}
//         <button
//           onClick={onClose}
//           className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
//         >
//           Close
//         </button>
//       </div>
//     );
//   }

//   return (
//     <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
//       <h1 className="text-xl font-semibold">
//         {type === "create" ? "Create a new trainee" : "Update trainee profile"}
//       </h1>

//       {/* Section 1: Account Info */}
//       <span className="text-xs text-gray-400 font-medium">Authentication Information</span>
//       <div className="flex justify-between flex-wrap gap-4">
//         <InputField
//           label="Registration Number"
//           name="regNo"
//           defaultValue={data?.regNo}
//           register={register("regNo")}
//           error={errors.regNo}
//         />
//         <InputField
//           label="Email"
//           name="email"
//           defaultValue={data?.email}
//           register={register("email")}
//           error={errors.email}
//         />
//         <InputField
//           label={type === "create" ? "Password" : "New Password (optional)"}
//           name="password"
//           type="password"
//           register={register("password")}
//           error={errors.password}
//           inputProps={{ autoComplete: type === "create" ? "new-password" : "current-password" }}
//         />
//       </div>

//       {/* Section 2: Personal Info */}
//       <span className="text-xs text-gray-400 font-medium">Personal Information</span>
//       <div className="flex justify-between flex-wrap gap-4">
//         <InputField
//           label="First Name"
//           name="name"
//           defaultValue={data?.name}
//           register={register("name")}
//           error={errors.name}
//         />
//         <InputField
//           label="Last Name"
//           name="surname"
//           defaultValue={data?.surname}
//           register={register("surname")}
//           error={errors.surname}
//         />
//         <InputField
//           label="Phone"
//           name="phone"
//           defaultValue={data?.phone}
//           register={register("phone")}
//           error={errors.phone}
//         />
//         <InputField
//           label="Address"
//           name="address"
//           defaultValue={data?.address}
//           register={register("address")}
//           error={errors.address}
//         />
//         <div className="flex flex-col gap-2 w-full md:w-1/4">
//           <label className="text-xs text-gray-500">Blood Type</label>
//           <select
//             className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
//             {...register("bloodType")}
//             defaultValue={data?.bloodType || ""}
//           >
//             <option value="">Select</option>
//             <option value="A+">A+</option>
//             <option value="A-">A-</option>
//             <option value="B+">B+</option>
//             <option value="B-">B-</option>
//             <option value="O+">O+</option>
//             <option value="O-">O-</option>
//           </select>
//           {errors.bloodType?.message && (
//             <p className="text-xs text-red-400">{errors.bloodType.message}</p>
//           )}
//         </div>
//         <InputField
//           label="Birthday"
//           name="birthday"
//           type="date"
//           defaultValue={data?.birthday ? new Date(data.birthday).toISOString().split("T")[0] : ""}
//           register={register("birthday")}
//           error={errors.birthday}
//         />
//         <div className="flex flex-col gap-2 w-full md:w-1/4">
//           <label className="text-xs text-gray-500">Sex</label>
//           <select
//             className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
//             {...register("sex")}
//             defaultValue={data?.sex || ""}
//           >
//             <option value="">Select</option>
//             <option value="MALE">Male</option>
//             <option value="FEMALE">Female</option>
//           </select>
//           {errors.sex?.message && (
//             <p className="text-xs text-red-400">{errors.sex.message}</p>
//           )}
//         </div>
//       </div>

//       {/* Section 3: Progress */}
//       <span className="text-xs text-gray-400 font-medium">Progress</span>
//       <div className="flex justify-between flex-wrap gap-4">
//         <InputField
//           label="Progress (%)"
//           name="progress"
//           type="number"
//           defaultValue={data?.progress}
//           register={register("progress", { valueAsNumber: true })}
//           error={errors.progress}
//           inputProps={{ min: 0, max: 100 }}
//         />
//         <div className="flex flex-col gap-2">
//           <CldUploadWidget
//             uploadPreset="school"
//             onSuccess={(result: any) => {
//               setImg(result.info?.secure_url);
//             }}
//           >
//             {({ open }) => (
//               <div
//                 className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
//                 onClick={() => open()}
//               >
//                 <Image src="/upload.png" alt="" width={28} height={28} />
//                 <span>Upload a photo</span>
//               </div>
//             )}
//           </CldUploadWidget>
//           {img && (
//             <div className="mt-2">
//               <Image
//                 src={img}
//                 alt="Trainee Preview"
//                 width={100}
//                 height={100}
//                 style={{ width: "100px", height: "100px", objectFit: "cover" }}
//                 className="rounded-md"
//               />
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Buttons */}
//       <div className="flex gap-4">
//         <button
//           type="submit"
//           disabled={isSubmitting}
//           className="bg-blue-400 text-white p-2 rounded-md hover:bg-blue-500 transition-colors"
//         >
//           {isSubmitting ? "Submitting..." : type === "create" ? "Create" : "Update"}
//         </button>
//         <button
//           type="button"
//           onClick={onClose}
//           disabled={isSubmitting}
//           className="bg-gray-400 text-white p-2 rounded-md hover:bg-gray-500 transition-colors"
//         >
//           Cancel
//         </button>
//         {type === "update" && (
//           <button
//             type="button"
//             onClick={handleDelete}
//             disabled={isSubmitting}
//             className="bg-red-400 text-white p-2 rounded-md hover:bg-red-500 transition-colors"
//           >
//             {isSubmitting ? "Deleting..." : "Delete"}
//           </button>
//         )}
//       </div>
//     </form>
//   );
// };

// export default TraineeForm;



















































// "use client";

// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { TraineeSchema, TraineeSchemaType } from "../../lib/formValidationSchemas";
// import { toast } from "react-toastify";
// import { useState } from "react";
// import InputField from "../InputField";
// import { CldUploadWidget } from "next-cloudinary";
// import Image from "next/image";
// import { createTrainee, updateTrainee } from "@/lib/api";

// type Props = {
//   type: "create" | "update";
//   data?: Partial<TraineeSchemaType>;
//   onClose: () => void;
//   refetch?: () => Promise<void>;
// };

// const TraineeForm = ({ type, data, onClose, refetch }: Props) => {
//   const router = useRouter();
//   const [img, setImg] = useState<string | undefined>(data?.img);
//   const [formError, setFormError] = useState<string | null>(null);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<TraineeSchemaType>({
//     resolver: zodResolver(TraineeSchema),
//     defaultValues: {
//       regNo: data?.regNo || "",
//       email: data?.email || "",
//       password: type === "create" ? "" : undefined,
//       name: data?.name || "",
//       surname: data?.surname || "",
//       phone: data?.phone || "",
//       address: data?.address || "",
//       bloodType: data?.bloodType || "",
//       sex: data?.sex || undefined,
//       birthday: data?.birthday || "",
//       progress: data?.progress ?? 0,
//       img: data?.img || "",
//     },
//   });

//   const onSubmit = async (formData: TraineeSchemaType) => {
//     try {
//       setFormError(null);
//       let formDataWithImg = { ...formData, img: img || formData.img };

//       // Exclude password for updates
//       if (type === "update") {
//         const { password, ...updateData } = formDataWithImg;
//         formDataWithImg = updateData as TraineeSchemaType;
//       }

//       console.log(`${type === "create" ? "Creating" : "Updating"} trainee with data:`, formDataWithImg);

//       if (type === "create") {
//         await createTrainee(formDataWithImg);
//         toast.success("Trainee created successfully");
//       } else if (type === "update" && data?.id) {
//         await updateTrainee(data.id, formDataWithImg);
//         toast.success("Trainee updated successfully");
//       } else {
//         throw new Error("Cannot update trainee: ID is missing");
//       }

//       onClose();
//       if (refetch) {
//         await refetch();
//       } else {
//         router.push("/list/trainees");
//       }
//     } catch (error: any) {
//       console.error(`Error ${type === "create" ? "creating" : "updating"} trainee:`, error);
//       const message = error.response?.data?.error || `Failed to ${type === "create" ? "create" : "update"} trainee`;
//       setFormError(message);
//       toast.error(message);
//     }
//   };

//   const handleDelete = async () => {
//     if (!data?.id) {
//       toast.error("Cannot delete trainee: ID is missing");
//       return;
//     }
//     try {
//       await deleteTrainee(data.id);
//       toast.success("Trainee deleted successfully");
//       if (refetch) {
//         await refetch();
//       }
//       onClose();
//       router.push("/list/trainees");
//     } catch (error: any) {
//       console.error("Error deleting trainee:", error);
//       const message = error.response?.data?.error || "Failed to delete trainee";
//       toast.error(message);
//     }
//   };

//   if (formError) {
//     return (
//       <div className="p-4 text-red-500">
//         {formError}
//         <button
//           onClick={onClose}
//           className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
//         >
//           Close
//         </button>
//       </div>
//     );
//   }

//   return (
//     <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
//       <h1 className="text-xl font-semibold">
//         {type === "create" ? "Create a new trainee" : "Update the trainee"}
//       </h1>

//       {/* Section 1: Account Info */}
//       <span className="text-xs text-gray-400 font-medium">Authentication Information</span>
//       <div className="flex justify-between flex-wrap gap-4">
//         <InputField
//           label="Registration Number"
//           name="regNo"
//           defaultValue={data?.regNo}
//           register={register("regNo")}
//           error={errors.regNo}
//         />
//         <InputField
//           label="Email"
//           name="email"
//           defaultValue={data?.email}
//           register={register("email")}
//           error={errors.email}
//         />
//         {type === "create" && (
//           <InputField
//             label="Password"
//             name="password"
//             type="password"
//             register={register("password")}
//             error={errors.password}
//             inputProps={{ autoComplete: "current-password" }}
//           />
//         )}
//       </div>

//       {/* Section 2: Personal Info */}
//       <span className="text-xs text-gray-400 font-medium">Personal Information</span>
//       <div className="flex justify-between flex-wrap gap-4">
//         <InputField
//           label="First Name"
//           name="name"
//           defaultValue={data?.name}
//           register={register("name")}
//           error={errors.name}
//         />
//         <InputField
//           label="Last Name"
//           name="surname"
//           defaultValue={data?.surname}
//           register={register("surname")}
//           error={errors.surname}
//         />
//         <InputField
//           label="Phone"
//           name="phone"
//           defaultValue={data?.phone}
//           register={register("phone")}
//           error={errors.phone}
//         />
//         <InputField
//           label="Address"
//           name="address"
//           defaultValue={data?.address}
//           register={register("address")}
//           error={errors.address}
//         />
//         <div className="flex flex-col gap-2 w-full md:w-1/4">
//           <label className="text-xs text-gray-500">Blood Type</label>
//           <select
//             className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
//             {...register("bloodType")}
//             defaultValue={data?.bloodType || ""}
//           >
//             <option value="">Select</option>
//             <option value="A+">A+</option>
//             <option value="A-">A-</option>
//             <option value="B+">B+</option>
//             <option value="B-">B-</option>
//             <option value="O+">O+</option>
//             <option value="O-">O-</option>
//           </select>
//           {errors.bloodType?.message && (
//             <p className="text-xs text-red-400">{errors.bloodType.message}</p>
//           )}
//         </div>
//         <InputField
//           label="Birthday"
//           name="birthday"
//           type="date"
//           defaultValue={data?.birthday ? new Date(data.birthday).toISOString().split("T")[0] : ""}
//           register={register("birthday")}
//           error={errors.birthday}
//         />
//         <div className="flex flex-col gap-2 w-full md:w-1/4">
//           <label className="text-xs text-gray-500">Sex</label>
//           <select
//             className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
//             {...register("sex")}
//             defaultValue={data?.sex || ""}
//           >
//             <option value="">Select</option>
//             <option value="MALE">Male</option>
//             <option value="FEMALE">Female</option>
//           </select>
//           {errors.sex?.message && (
//             <p className="text-xs text-red-400">{errors.sex.message}</p>
//           )}
//         </div>
//       </div>

//       {/* Section 3: Progress */}
//       <span className="text-xs text-gray-400 font-medium">Progress</span>
//       <div className="flex justify-between flex-wrap gap-4">
//         <InputField
//           label="Progress (%)"
//           name="progress"
//           type="number"
//           defaultValue={data?.progress}
//           register={register("progress", { valueAsNumber: true })}
//           error={errors.progress}
//           inputProps={{ min: 0, max: 100 }}
//         />
//         <div className="flex flex-col gap-2">
//           <CldUploadWidget
//             uploadPreset="school"
//             onSuccess={(result: any) => {
//               setImg(result.info?.secure_url);
//             }}
//           >
//             {({ open }) => (
//               <div
//                 className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
//                 onClick={() => open()}
//               >
//                 <Image src="/upload.png" alt="" width={28} height={28} />
//                 <span>Upload a photo</span>
//               </div>
//             )}
//           </CldUploadWidget>
//           {img && (
//             <div className="mt-2">
//               <Image
//                 src={img}
//                 alt="Trainee Preview"
//                 width={100}
//                 height={100}
//                 style={{ width: "100px", height: "100px", objectFit: "cover" }}
//                 className="rounded-md"
//               />
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Buttons */}
//       <div className="flex gap-4">
//         <button
//           type="submit"
//           disabled={isSubmitting}
//           className="bg-blue-400 text-white p-2 rounded-md"
//         >
//           {isSubmitting ? "Submitting..." : type === "create" ? "Create" : "Update"}
//         </button>
//         <button
//           type="button"
//           onClick={onClose}
//           disabled={isSubmitting}
//           className="bg-gray-400 text-white p-2 rounded-md"
//         >
//           Cancel
//         </button>
//         {type === "update" && (
//           <button
//             type="button"
//             onClick={handleDelete}
//             disabled={isSubmitting}
//             className="bg-red-400 text-white p-2 rounded-md"
//           >
//             {isSubmitting ? "Deleting..." : "Delete"}
//           </button>
//         )}
//       </div>
//     </form>
//   );
// };

// export default TraineeForm;




































































// "use client";

// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { TraineeSchema, TraineeSchemaType } from "@/lib/formValidationSchemas";
// import { toast } from "react-toastify";
// import { useState, useEffect } from "react";
// import InputField from "../InputField";
// import { CldUploadWidget } from "next-cloudinary";
// import Image from "next/image";
// import { createTrainee, updateTrainee, deleteTrainee, getSupervisors } from "@/lib/api";

// type Supervisor = {
//   id: string;
//   name: string;
//   surname: string;
// };

// type Props = {
//   type: "create" | "update";
//   data?: TraineeSchemaType;
//   onClose: () => void;
//   refetch?: () => Promise<void>;
// };

// const TraineeForm = ({ type, data, onClose, refetch }: Props) => {
//   console.log("TraineeForm data:", data);
//   const router = useRouter();
//   const [img, setImg] = useState<any>(data?.img);
//   const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
//   const [supervisorError, setSupervisorError] = useState<string | null>(null);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<TraineeSchemaType>({
//     resolver: zodResolver(TraineeSchema),
//     defaultValues: data || {
//       regNo: "",
//       email: "",
//       name: "",
//       surname: "",
//       phone: "",
//       address: "",
//       bloodType: "",
//       sex: "MALE",
//       birthday: "",
//       placeOfTP: "",
//       supervisorId: "",
//       progress: 0,
//     },
//   });

//   useEffect(() => {
//     const fetchSupervisors = async () => {
//       try {
//         const response = await getSupervisors(1); // Fetch first page of supervisors
//         setSupervisors(response.supervisors || []);
//       } catch (error: any) {
//         console.error("Error fetching supervisors:", error);
//         setSupervisorError("Failed to load supervisors");
//       }
//     };
//     fetchSupervisors();
//   }, []);

//   const onSubmit = async (formData: TraineeSchemaType) => {
//     try {
//       // Use `let` instead of `const` to allow reassignment
//       let formDataWithImg = {
//         ...formData,
//         img: img?.secure_url || formData.img,
//         progress: Number(formData.progress),
//       };
//       console.log(`${type === "create" ? "Creating" : "Updating"} trainee with data:`, formDataWithImg);

//       let response;
//       if (type === "create") {
//         response = await createTrainee(formDataWithImg);
//         console.log("Create Trainee Response:", response);
//         toast.success("Trainee created successfully");
//       } else {
//         if (!data?.id) {
//           toast.error("Cannot update trainee: ID is missing");
//           return;
//         }
//         if (!formDataWithImg.password) {
//           const { password, ...updateData } = formDataWithImg;
//           formDataWithImg = updateData; // This reassignment now works because we used `let`
//         }
//         response = await updateTrainee(data.id, formDataWithImg);
//         console.log("Update Trainee Response:", response);
//         toast.success("Trainee updated successfully");
//       }

//       onClose();
//       if (refetch) {
//         await refetch();
//       } else {
//         router.push("/list/trainees");
//       }
//     } catch (error: any) {
//       console.error(`Error ${type === "create" ? "creating" : "updating"} trainee:`, error);
//       const message = error.response?.data?.error || `Failed to ${type === "create" ? "create" : "update"} trainee`;
//       toast.error(message);
//     }
//   };

//   const handleDelete = async () => {
//     if (!data || !data.id) {
//       toast.error("Cannot delete trainee: ID is missing");
//       return;
//     }
//     try {
//       const response = await deleteTrainee(data.id);
//       console.log("Delete Trainee Response:", response);
//       toast.success("Trainee deleted successfully");

//       if (refetch) {
//         await refetch();
//       }
//       onClose();
//       router.push("/list/trainees");
//     } catch (error: any) {
//       console.error("Error deleting trainee:", error);
//       const message = error.response?.data?.error || "Failed to delete trainee";
//       toast.error(message);
//     }
//   };

//   return (
//     <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
//       <h1 className="text-xl font-semibold">
//         {type === "create" ? "Create a new trainee" : "Update the trainee"}
//       </h1>

//       {/* Section 1: Account Info */}
//       <span className="text-xs text-gray-400 font-medium">Authentication Information</span>
//       <div className="flex justify-between flex-wrap gap-4">
//         <InputField
//           label="Registration Number"
//           name="regNo"
//           defaultValue={data?.regNo}
//           register={register("regNo")}
//           error={errors.regNo}
//         />
//         <InputField
//           label="Email"
//           name="email"
//           defaultValue={data?.email}
//           register={register("email")}
//           error={errors.email}
//         />
//         {type === "create" && (
//           <InputField
//             label="Password"
//             name="password"
//             type="password"
//             defaultValue={data?.password}
//             register={register("password")}
//             error={errors.password}
//             inputProps={{ autoComplete: "current-password" }}
//           />
//         )}
//       </div>

//       {/* Section 2: Personal Info */}
//       <span className="text-xs text-gray-400 font-medium">Personal Information</span>
//       <div className="flex justify-between flex-wrap gap-4">
//         <InputField
//           label="First Name"
//           name="name"
//           defaultValue={data?.name}
//           register={register("name")}
//           error={errors.name}
//         />
//         <InputField
//           label="Last Name"
//           name="surname"
//           defaultValue={data?.surname}
//           register={register("surname")}
//           error={errors.surname}
//         />
//         <InputField
//           label="Phone"
//           name="phone"
//           defaultValue={data?.phone}
//           register={register("phone")}
//           error={errors.phone}
//         />
//         <InputField
//           label="Address"
//           name="address"
//           defaultValue={data?.address}
//           register={register("address")}
//           error={errors.address}
//         />
//         <InputField
//           label="Blood Type"
//           name="bloodType"
//           defaultValue={data?.bloodType}
//           register={register("bloodType")}
//           error={errors.bloodType}
//         />
//         <InputField
//           label="Birthday"
//           name="birthday"
//           type="date"
//           defaultValue={data?.birthday ? new Date(data.birthday).toISOString().split("T")[0] : ""}
//           register={register("birthday")}
//           error={errors.birthday}
//         />
//         <div className="flex flex-col gap-2 w-full md:w-1/4">
//           <label className="text-xs text-gray-500">Sex</label>
//           <select
//             className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
//             {...register("sex")}
//             defaultValue={data?.sex || "MALE"}
//           >
//             <option value="MALE">Male</option>
//             <option value="FEMALE">Female</option>
//           </select>
//           {errors.sex?.message && (
//             <p className="text-xs text-red-400">{errors.sex.message.toString()}</p>
//           )}
//         </div>
//       </div>

//       {/* Section 3: Training Info */}
//       <span className="text-xs text-gray-400 font-medium">Training Information</span>
//       <div className="flex justify-between flex-wrap gap-4">
//         <InputField
//           label="Place of TP"
//           name="placeOfTP"
//           defaultValue={data?.placeOfTP}
//           register={register("placeOfTP")}
//           error={errors.placeOfTP}
//         />
//         <div className="flex flex-col gap-2 w-full md:w-1/4">
//           <label className="text-xs text-gray-500">Supervisor</label>
//           {supervisorError ? (
//             <p className="text-xs text-red-400">{supervisorError}</p>
//           ) : (
//             <select
//               className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
//               {...register("supervisorId")}
//               defaultValue={data?.supervisorId || ""}
//             >
//               <option value="">Select Supervisor</option>
//               {supervisors.map((supervisor) => (
//                 <option key={supervisor.id} value={supervisor.id}>
//                   {supervisor.name} {supervisor.surname}
//                 </option>
//               ))}
//             </select>
//           )}
//           {errors.supervisorId?.message && (
//             <p className="text-xs text-red-400">{errors.supervisorId.message.toString()}</p>
//           )}
//         </div>
//         <InputField
//           label="Progress (%)"
//           name="progress"
//           type="number"
//           defaultValue={data?.progress}
//           register={register("progress", { valueAsNumber: true })}
//           error={errors.progress}
//         />
//         <div className="flex flex-col gap-2">
//           <CldUploadWidget
//             uploadPreset="school"
//             onSuccess={(result, { widget }) => {
//               setImg(result.info);
//               widget.close();
//             }}
//           >
//             {({ open }) => (
//               <div
//                 className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
//                 onClick={() => open()}
//               >
//                 <Image src="/upload.png" alt="" width={28} height={28} />
//                 <span>Upload a photo</span>
//               </div>
//             )}
//           </CldUploadWidget>
//           {img && (
//             <div className="mt-2">
//               <Image
//                 src={typeof img === "object" ? img.secure_url : img}
//                 alt="Trainee Preview"
//                 width={100}
//                 height={100}
//                 style={{ width: "100px", height: "100px", objectFit: "cover" }}
//                 className="rounded-md"
//               />
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Buttons */}
//       <div className="flex gap-4">
//         <button
//           type="submit"
//           disabled={isSubmitting}
//           className="bg-blue-400 text-white p-2 rounded-md"
//         >
//           {isSubmitting ? "Submitting..." : type === "create" ? "Create" : "Update"}
//         </button>
//         {type === "update" && (
//           <button
//             type="button"
//             onClick={handleDelete}
//             disabled={isSubmitting}
//             className="bg-red-400 text-white p-2 rounded-md"
//           >
//             {isSubmitting ? "Deleting..." : "Delete"}
//           </button>
//         )}
//       </div>
//     </form>
//   );
// };

// export default TraineeForm;