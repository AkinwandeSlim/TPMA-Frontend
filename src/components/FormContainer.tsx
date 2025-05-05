
"use client";

import FormModal from "./FormModal";

type Props =
  | { table: "supervisor"; type: "create"; data?: undefined; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "supervisor"; type: "update"; data: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "supervisor"; type: "delete"; data?: undefined; id: string; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "trainee"; type: "create"; data?: undefined; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "trainee"; type: "update"; data: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "trainee"; type: "delete"; data?: undefined; id: string; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "lesson_plan"; type: "create"; data?: undefined; id?: undefined; refetch?: () => Promise<void>; customSubmit?: (data: any) => Promise<void>; ariaLabel?: string }
  | { table: "lesson_plan"; type: "update"; data?: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: (data: any) => Promise<void>; ariaLabel?: string }
  | { table: "lesson_plan"; type: "view"; data?: any; id?: undefined; refetch?: () => Promise<void>; customSubmit?: undefined; ariaLabel?: string }
  | { table: "lesson_plan"; type: "delete"; data?: undefined; id: string; refetch?: () => Promise<void>; customSubmit?: () => Promise<void>; ariaLabel?: string };

export type FormContainerProps =
  | {
      table: "supervisor";
      type: "create";
      data?: undefined;
      id?: undefined;
      display?: "form" | "image";
      refetch?: () => Promise<void>;
      customSubmit?: undefined;
      ariaLabel?: string;
    }
  | {
      table: "supervisor";
      type: "update";
      data: any;
      id?: undefined;
      display?: "form" | "image";
      refetch?: () => Promise<void>;
      customSubmit?: undefined;
      ariaLabel?: string;
    }
  | {
      table: "supervisor";
      type: "delete";
      data?: undefined;
      id: string;
      display?: "form" | "image";
      refetch?: () => Promise<void>;
      customSubmit?: undefined;
      ariaLabel?: string;
    }
  | {
      table: "trainee";
      type: "create";
      data?: undefined;
      id?: undefined;
      display?: "form" | "image";
      refetch?: () => Promise<void>;
      customSubmit?: undefined;
      ariaLabel?: string;
    }
  | {
      table: "trainee";
      type: "update";
      data: any;
      id?: undefined;
      display?: "form" | "image";
      refetch?: () => Promise<void>;
      customSubmit?: undefined;
      ariaLabel?: string;
    }
  | {
      table: "trainee";
      type: "delete";
      data?: undefined;
      id: string;
      display?: "form" | "image";
      refetch?: () => Promise<void>;
      customSubmit?: undefined;
      ariaLabel?: string;
    }
  | {
      table: "lesson_plan";
      type: "create";
      data?: undefined;
      id?: undefined;
      display?: "form" | "image";
      refetch?: () => Promise<void>;
      customSubmit?: (data: any) => Promise<void>;
      ariaLabel?: string;
    }
  | {
      table: "lesson_plan";
      type: "update";
      data?: any;
      id?: undefined;
      display?: "form" | "image";
      refetch?: () => Promise<void>;
      customSubmit?: (data: any) => Promise<void>;
      ariaLabel?: string;
    }
  | {
      table: "lesson_plan";
      type: "view";
      data?: any;
      id?: undefined;
      display?: "form" | "image";
      refetch?: () => Promise<void>;
      customSubmit?: undefined;
      ariaLabel?: string;
    }
  | {
      table: "lesson_plan";
      type: "delete";
      data?: undefined;
      id: string;
      display?: "form" | "image";
      refetch?: () => Promise<void>;
      customSubmit?: () => Promise<void>;
      ariaLabel?: string;
    };

const FormContainer: React.FC<FormContainerProps> = ({
  table,
  type,
  data,
  id,
  display,
  refetch,
  customSubmit,
  ariaLabel,
}) => {
  if (display === "image") {
    return (
      <FormModal
        {...({
          table,
          type,
          data,
          id,
          refetch,
          customSubmit,
          ariaLabel,
        } as Props)}
      />
    );
  }

  return (
    <div>
      <FormModal
        {...({
          table,
          type,
          data,
          id,
          refetch,
          customSubmit,
          ariaLabel,
        } as Props)}
      />
    </div>
  );
};

export default FormContainer;












