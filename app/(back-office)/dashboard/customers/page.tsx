import {db} from "@/lib/db";
import { UserRole } from "@prisma/client";
import DataTable from "@/components/data-table-components/DataTable";
import { columns } from "./columns";

export default async function CustomersPage() {

  const customers = await db.user.findMany({
    where: {
      role: UserRole.USER,
    },
    include: {
      profile: {
        select: {
          firstName: true,
          lastName: true,
          username: true,
          phone: true,
          streetAddress: true,
          city: true,
          district: true,
          state: true,
          country: true,
          zip: true,
          dateOfBirth: true,
          profileImage: true,
        },
      },
    },
  });

  return (
    <div className="py-8">
      <DataTable columns={columns} data={customers} />
    </div>
  );
}
