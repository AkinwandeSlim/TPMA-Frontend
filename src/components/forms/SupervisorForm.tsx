"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SupervisorSchema, SupervisorSchemaType } from "../../lib/formValidationSchemas";
import { toast } from "react-toastify";
import { useState } from "react";
import InputField from "../InputField";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import axios from "axios";

type Props = {
  type: "create" | "update";
  data?: SupervisorSchemaType;
  onClose: () => void;
  refetch?: () => Promise<void>;
};

const SupervisorForm = ({ type, data, onClose, refetch }: Props) => {
  const router = useRouter();
  const [img, setImg] = useState<any>(data?.img);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SupervisorSchemaType>({
    resolver: zodResolver(SupervisorSchema),
    defaultValues: data || {
      staffId: "",
      email: "",
      name: "",
      surname: "",
      phone: "",
      address: "",
      bloodType: "",
      sex: "MALE",
      birthday: "",
      placeOfSupervision: "",
    },
  });

  const onSubmit = async (formData: SupervisorSchemaType) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        toast.error("Authentication token not found. Please sign in.");
        return;
      }

      let formDataWithImg = { ...formData, img: img?.secure_url || formData.img };
      console.log(`${type === "create" ? "Creating" : "Updating"} supervisor with data:`, formDataWithImg);

      let response;
      if (type === "create") {
        response = await axios.post(
          "http://localhost:5000/api/admin/supervisors",
          formDataWithImg,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Create Supervisor Response:", response.data);
        toast.success("Supervisor created successfully");
      } else {
        if (!data?.id) {
          toast.error("Cannot update supervisor: ID is missing");
          return;
        }
        if (!formDataWithImg.password) {
          const { password, ...updateData } = formDataWithImg;
          formDataWithImg = updateData;
        }
        response = await axios.put(
          `http://localhost:5000/api/admin/supervisors/${data.id}`,
          formDataWithImg,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Update Supervisor Response:", response.data);
        toast.success("Supervisor updated successfully");
      }

      onClose();
      if (refetch) {
        await refetch();
      } else {
        router.push("/list/supervisors");
      }
    } catch (error: any) {
      console.error(`Error ${type === "create" ? "creating" : "updating"} supervisor:`, error);
      const message = error.response?.data?.error || `Failed to ${type === "create" ? "create" : "update"} supervisor`;
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!data?.id) {
      toast.error("Cannot delete supervisor: ID is missing");
      return;
    }
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        toast.error("Authentication token not found. Please sign in.");
        return;
      }

      const response = await axios.delete(
        `http://localhost:5000/api/admin/supervisors/${data.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Delete Supervisor Response:", response.data);
      toast.success("Supervisor deleted successfully");

      if (refetch) {
        await refetch();
      }
      onClose();
      router.push("/list/supervisors");
    } catch (error: any) {
      console.error("Error deleting supervisor:", error);
      const message = error.response?.data?.error || "Failed to delete supervisor";
      toast.error(message);
    }
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new supervisor" : "Update the supervisor"}
      </h1>

      {/* Section 1: Account Info */}
      <span className="text-xs text-gray-400 font-medium">Authentication Information</span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Staff ID"
          name="staffId"
          defaultValue={data?.staffId}
          register={register("staffId")}
          error={errors.staffId}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register("email")}
          error={errors.email}
        />
        {type === "create" && (
          <InputField
            label="Password"
            name="password"
            type="password"
            defaultValue={data?.password}
            register={register("password")}
            error={errors.password}
            inputProps={{ autoComplete: "current-password" }}
          />
        )}
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
        <InputField
          label="Blood Type"
          name="bloodType"
          defaultValue={data?.bloodType}
          register={register("bloodType")}
          error={errors.bloodType}
        />
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
            defaultValue={data?.sex || "MALE"}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs text-red-400">{errors.sex.message.toString()}</p>
          )}
        </div>
      </div>

      {/* Section 3: Supervision Info */}
      <span className="text-xs text-gray-400 font-medium">Supervision Information</span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Place of Supervision"
          name="placeOfSupervision"
          defaultValue={data?.placeOfSupervision}
          register={register("placeOfSupervision")}
          error={errors.placeOfSupervision}
        />
        <div className="flex flex-col gap-2">
          <CldUploadWidget
            uploadPreset="school"
            onSuccess={(result, { widget }) => {
              setImg(result.info);
              widget.close();
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
                src={typeof img === "object" ? img.secure_url : img}
                alt="Supervisor Preview"
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
          className="bg-blue-400 text-white p-2 rounded-md"
        >
          {isSubmitting ? "Submitting..." : type === "create" ? "Create" : "Update"}
        </button>
        {type === "update" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="bg-red-400 text-white p-2 rounded-md"
          >
            {isSubmitting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
    </form>
  );
};

export default SupervisorForm;



// "use client";

// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { SupervisorSchema, SupervisorSchemaType } from "../../lib/formValidationSchemas";
// import { createSupervisor, updateSupervisor, deleteSupervisor } from "@/lib/api";
// import { toast } from "react-toastify";
// import { useState } from "react";
// import InputField from "../InputField";
// import { CldUploadWidget } from "next-cloudinary";
// import Image from "next/image";

// type Props = {
//   type: "create" | "update";
//   data?: SupervisorSchemaType;
//   onClose: () => void; // Added from FormModal
//   refetch?: () => void; // Added for refresh
// };

// const SupervisorForm = ({ type, data, onClose, refetch }: Props) => {
//   const router = useRouter();
//   const [img, setImg] = useState<any>(data?.img);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm<SupervisorSchemaType>({
//     resolver: zodResolver(SupervisorSchema),
//     defaultValues: data || {
//       staffId: "",
//       email: "",
//       name: "",
//       surname: "",
//       phone: "",
//       address: "",
//       bloodType: "",
//       sex: "MALE",
//       birthday: "",
//       placeOfSupervision: "",
//     },
//   });

// const onSubmit = async (formData: SupervisorSchemaType) => {
//   try {
//     let formDataWithImg = { ...formData, img: img?.secure_url || formData.img };
//     console.log(`${type === "create" ? "Creating" : "Updating"} supervisor with data:`, formDataWithImg);
//     if (type === "create") {
//       await createSupervisor(formDataWithImg);
//       toast.success("Supervisor created successfully");
//     } else {
//       if (!data?.id) {
//         toast.error("Cannot update supervisor: ID is missing");
//         return;
//       }
//       // Exclude password from update payload if not provided
//       if (!formDataWithImg.password) {
//         const { password, ...updateData } = formDataWithImg;
//         formDataWithImg = updateData;
//       }
//       await updateSupervisor(data.id, formDataWithImg);
//       toast.success("Supervisor updated successfully");
//     }
// // Close the modal and refresh the page
//     if (onSuccess) {
//       onSuccess(); // Close the modal
//     }
//     // Try router.refresh first
//     router.refresh();
//     // Fallback: Force navigation if refresh doesn't update the table
//     setTimeout(() => {
//       router.push("/list/supervisors");
//     }, 100); // Small delay to allow refresh to attempt first
//   } catch (error) {
//     console.error(`Error ${type === "create" ? "creating" : "updating"} supervisor:`, error);
//     toast.error(`Failed to ${type === "create" ? "create" : "update"} supervisor`);
//   }
// };

//   const handleDelete = async () => {
//     if (!data?.id) {
//       toast.error("Cannot delete supervisor: ID is missing");
//       return;
//     }
//     try {
//       await deleteSupervisor(data.id);
//       toast.success("Supervisor deleted successfully");
//       refetch?.(); // Call refetch after delete
//       onClose();
//       router.push("/list/supervisors");
//     } catch (error) {
//       console.error("Error deleting supervisor:", error);
//       toast.error("Failed to delete supervisor");
//     }
//   };

//   return (
//     <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
//       <h1 className="text-xl font-semibold">
//         {type === "create" ? "Create a new supervisor" : "Update the supervisor"}
//       </h1>

//       {/* Section 1: Account Info */}
//       <span className="text-xs text-gray-400 font-medium">Authentication Information</span>
//       <div className="flex justify-between flex-wrap gap-4">
//         <InputField
//           label="Staff ID"
//           name="staffId"
//           defaultValue={data?.staffId}
//           register={register("staffId")}
//           error={errors.staffId}
//         />
//         <InputField
//           label="Email"
//           name="email"
//           defaultValue={data?.email}
//           register={register("email")}
//           error={errors.email}
//         />



//       {type === "create" && (
//         <InputField
//           label="Password"
//           name="password"
//           type="password"
//           defaultValue={data?.password}
//           register={register("password")}
//           error={errors.password}
//           inputProps={{ autoComplete: "current-password" }}
//         />
//       )}











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

//       {/* Section 3: Supervision Info */}
//       <span className="text-xs text-gray-400 font-medium">Supervision Information</span>
//       <div className="flex justify-between flex-wrap gap-4">
//         <InputField
//           label="Place of Supervision"
//           name="placeOfSupervision"
//           defaultValue={data?.placeOfSupervision}
//           register={register("placeOfSupervision")}
//           error={errors.placeOfSupervision}
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
//                 alt="Supervisor Preview"
//                 width={100}
//                 height={100}
//                 className="rounded-md object-cover"
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

// export default SupervisorForm;