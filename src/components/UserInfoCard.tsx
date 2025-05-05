import Image from "next/image";
import FormModal from "./FormModal";

type User = {
  id: string;
  name?: string;
  surname?: string;
  username?: string;
  email?: string;
  phone?: string;
  img?: string;
  bloodType?: string;
  birthday?: string;
  role?: string;
};

type Props = {
  user: User;
  role: string;
  refetch:() => Promise<void>;
};

const getTableName = (role: string): "supervisor" | "trainee" | "school" | "tp_assignment" | "student_evaluation" | "supervisor_evaluation" | "lesson_plan" => {
  switch (role) {
    case "teacherTrainee":
      return "trainee";
    case "supervisor":
      return "supervisor";
    case "school":
      return "school";
    case "tp_assignment":
      return "tp_assignment";
    case "student_evaluation":
      return "student_evaluation";
    case "supervisor_evaluation":
      return "supervisor_evaluation";
    case "lesson_plan":
      return "lesson_plan";
    default:
      return "trainee"; // Fallback to trainee as default
  }
};

const UserInfoCard = ({ user, role, refetch }: Props) => {
  return (
    <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
      <div className="w-1/3">
        <Image
          src={user.img || "/noAvatar.png"}
          alt={user.username || `${user.name} ${user.surname}`}
          width={144}
          height={144}
          className="w-36 h-36 rounded-full object-cover"
        />
      </div>
      <div className="w-2/3 flex flex-col justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">
            {user.username || `${user.name} ${user.surname}`}
          </h1>
          <FormModal table={getTableName(role)} type="update" data={user} refetch={refetch} />
        </div>
        <p className="text-sm text-gray-500">
          {getTableName(role) === "trainee" ? "Trainee Profile" : getTableName(role) === "supervisor" ? "Supervisor Profile" : "Admin Profile"}
        </p>
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
          {(getTableName(role) === "trainee" || getTableName(role) === "supervisor") && (
            <>
              <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                <Image src="/blood.png" alt="" width={14} height={14} style={{ width: "auto", height: "auto" }} />
                <span>{user.bloodType || "N/A"}</span>
              </div>
              <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                <Image src="/date.png" alt="" width={14} height={14} style={{ width: "auto", height: "auto" }} />
                <span>
                  {user.birthday
                    ? new Intl.DateTimeFormat("en-GB").format(new Date(user.birthday))
                    : "N/A"}
                </span>
              </div>
            </>
          )}
          <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
            <Image src="/mail.png" alt="" width={14} height={14} style={{ width: "auto", height: "auto" }} />
            <span>{user.email || "N/A"}</span>
          </div>
          {(getTableName(role) === "trainee" || getTableName(role) === "supervisor") && (
            <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
              <Image src="/phone.png" alt="" width={14} height={14} style={{ width: "auto", height: "auto" }} />
              <span>{user.phone || "N/A"}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserInfoCard;





















// import Image from "next/image";
// import FormModal from "./FormModal";

// type User = {
//   id: string;
//   name?: string;
//   surname?: string;
//   username?: string;
//   email?: string;
//   phone?: string;
//   img?: string;
//   bloodType?: string;
//   birthday?: string;
//   role?: string;
// };

// type Props = {
//   user: User;
//   role: string;
//   refetch: () => void;
// };

// const UserInfoCard = ({ user, role, refetch }: Props) => {
//   return (
//     <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
//       <div className="w-1/3">
//         <Image
//           src={user.img || "/noAvatar.png"}
//           alt={user.username || `${user.name} ${user.surname}`}
//           width={144}
//           height={144}
//           className="w-36 h-36 rounded-full object-cover"
      
//         />
//       </div>
//       <div className="w-2/3 flex flex-col justify-between gap-4">
//         <div className="flex items-center gap-4">
//           <h1 className="text-xl font-semibold">
//             {user.username || `${user.name} ${user.surname}`}
//           </h1>
//           <FormModal table={role} type="update" data={user} refetch={refetch} />
//         </div>
//         <p className="text-sm text-gray-500">
//           {role === "teacherTrainee" ? "Trainee Profile" : role === "supervisor" ? "Supervisor Profile" : "Admin Profile"}
//         </p>
//         <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
//           {(role === "teacherTrainee" || role === "supervisor") && (
//             <>
//               <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
//                 <Image src="/blood.png" alt="" width={14} height={14} style={{ width: "auto", height: "auto" }} />
//                 <span>{user.bloodType || "N/A"}</span>
//               </div>
//               <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
//                 <Image src="/date.png" alt="" width={14} height={14} style={{ width: "auto", height: "auto" }} />
//                 <span>
//                   {user.birthday
//                     ? new Intl.DateTimeFormat("en-GB").format(new Date(user.birthday))
//                     : "N/A"}
//                 </span>
//               </div>
//             </>
//           )}
//           <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
//             <Image src="/mail.png" alt="" width={14} height={14} style={{ width: "auto", height: "auto" }} />
//             <span>{user.email || "N/A"}</span>
//           </div>
//           {(role === "teacherTrainee" || role === "supervisor") && (
//             <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
//               <Image src="/phone.png" alt="" width={14} height={14} style={{ width: "auto", height: "auto" }} />
//               <span>{user.phone || "N/A"}</span>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserInfoCard;























































