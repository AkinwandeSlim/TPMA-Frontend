"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SchoolSchema, SchoolSchemaType } from "../../lib/formValidationSchemas";
import { toast } from "react-toastify";
import { useState } from "react";
import InputField from "../InputField";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import axios from "axios";

import { API_BASE_URL } from "@/lib/api";



type Props = {
  type: "create" | "update";
  data?: SchoolSchemaType & { id?: string };
  onClose: () => void;
  refetch?: () => Promise<void>;
};

const SchoolForm = ({ type, data, onClose, refetch }: Props) => {
  const router = useRouter();
  const [logo, setLogo] = useState<any>(data?.logo);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SchoolSchemaType>({
    resolver: zodResolver(SchoolSchema),
    defaultValues: data || {
      name: "",
      address: "",
      email: "",
      phone: "",
      type: "PRIMARY",
      principal: "",
    },
  });

  const onSubmit = async (formData: SchoolSchemaType) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        toast.error("Authentication token not found. Please sign in.");
        return;
      }

      const formWithLogo = { ...formData, logo: logo?.secure_url || formData.logo };

      let response;
      if (type === "create") {
        response = await axios.post(
          `${API_BASE_URL}/api/admin/schools`,
          formWithLogo,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("School created successfully");
      } else {
        if (!data?.id) {
          toast.error("School ID missing");
          return;
        }
        response = await axios.put(
          `${API_BASE_URL}/api/admin/schools/${data.id}`,
          formWithLogo,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("School updated successfully");
      }

      onClose();
      if (refetch) await refetch();
      else router.push("/list/schools");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to save school data");
    }
  };

  const handleDelete = async () => {
    if (!data?.id) {
      toast.error("School ID missing");
      return;
    }
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      await axios.delete(`${API_BASE_URL}/api/admin/schools/${data.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("School deleted");
      if (refetch) await refetch();
      onClose();
      router.push("/list/schools");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete school");
    }
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new school" : "Update school"}
      </h1>

      {/* School Info */}
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="School Name"
          name="name"
          defaultValue={data?.name}
          register={register("name")}
          error={errors.name}
        />
        <InputField
          label="School Address"
          name="address"
          defaultValue={data?.address}
          register={register("address")}
          error={errors.address}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register("email")}
          error={errors.email}
        />
        <InputField
          label="Phone Number"
          name="phone"
          defaultValue={data?.phone}
          register={register("phone")}
          error={errors.phone}
        />
        <InputField
          label="Principal Name"
          name="principal"
          defaultValue={data?.principal}
          register={register("principal")}
          error={errors.principal}
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">School Type</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("type")}
            defaultValue={data?.type || "PRIMARY"}
          >
            <option value="PRIMARY">Primary</option>
            <option value="SECONDARY">Secondary</option>
            <option value="TERTIARY">Tertiary</option>
          </select>
          {errors.type?.message && (
            <p className="text-xs text-red-400">{errors.type.message.toString()}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <CldUploadWidget
            uploadPreset="school"
            onSuccess={(result, { widget }) => {
              setLogo(result.info);
              widget.close();
            }}
          >
            {({ open }) => (
              <div className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer" onClick={() => open()}>
                <Image src="/upload.png" alt="upload" width={28} height={28} />
                <span>Upload School Logo</span>
              </div>
            )}
          </CldUploadWidget>
          {logo && (
            <div className="mt-2">
              <Image
                src={typeof logo === "object" ? logo.secure_url : logo}
                alt="School Logo"
                width={100}
                height={100}
                style={{ objectFit: "cover" }}
                className="rounded-md"
              />
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button type="submit" disabled={isSubmitting} className="bg-blue-500 text-white px-4 py-2 rounded-md">
          {isSubmitting ? "Submitting..." : type === "create" ? "Create" : "Update"}
        </button>
        {type === "update" && (
          <button type="button" onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded-md">
            Delete
          </button>
        )}
        <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded-md">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default SchoolForm;


































