import { FieldError, UseFormRegisterReturn } from "react-hook-form";

type InputFieldProps = {
  label: string;
  type?: string;
  register: UseFormRegisterReturn; // Updated for type safety
  name: string;
  defaultValue?: string | number;
  error?: FieldError;
  hidden?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    disabled?: boolean;
};

const InputField = ({
  label,
  type = "text",
  register,
  name,
  defaultValue,
  error,
  hidden,
  inputProps,
  disabled = false,
}: InputFieldProps) => {
  return (
    <div className={hidden ? "hidden" : "flex flex-col gap-2 w-full md:w-1/4"}>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        type={type}
        {...register}
        className={`ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
        {...inputProps}
        defaultValue={defaultValue}
        disabled={disabled}
      />
      {error?.message && (
        <p className="text-xs text-red-400">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
























