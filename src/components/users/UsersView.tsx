"use client";

import { DataNote } from "@/components/pigs/PigBits";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TableCard } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingRows, NotAvailable } from "@/components/ui/DataState";
import { PageHeader } from "@/components/ui/PageHeader";
import { backend } from "@/lib/api/backend";
import { useApiQuery } from "@/lib/api/useApiQuery";
import { useFarmContext } from "@/lib/auth/AuthProvider";
import { canSeeAllMembers } from "@/lib/permissions";
import { initials, MEMBERSHIP_STATUS, ROLE_LABEL } from "@/lib/status";

export function UsersView() {
  const { user, farm, role } = useFarmContext();
  const memberships = useApiQuery("memberships", (signal) => backend.listMemberships(signal));
  const rows = memberships.status === "success" ? memberships.data.filter((m) => m.farmId === farm.id) : [];
  const ownerView = canSeeAllMembers(role);

  return (
    <>
      <PageHeader
        title="Users"
        sub={`Team members and access to ${farm.name}`}
        actions={
          <Button variant="primary" icon="user-plus" disabled title="Inviting users isn't available yet">
            Invite user
          </Button>
        }
      />

      <DataNote>
        {ownerView
          ? "The API returns each member's role and status, but not their name or activity."
          : "Only the farm owner can see every member. You can see your own membership."}
      </DataNote>

      <TableCard>
        {memberships.status === "loading" ? (
          <div className="p-3">
            <LoadingRows rows={3} />
          </div>
        ) : memberships.status === "error" ? (
          <ErrorState error={memberships.error} onRetry={memberships.reload} />
        ) : rows.length === 0 ? (
          <EmptyState icon="users" title="No members" />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Barns</th>
                <th>Last active</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => {
                const self = m.userId === user.id;
                const status = MEMBERSHIP_STATUS[m.status];
                return (
                  <tr key={m.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar
                          initials={self ? initials(user.firstName, user.lastName) : "?"}
                          background={self ? undefined : "#475569"}
                          size={32}
                        />
                        {self ? (
                          <span className="whitespace-nowrap font-semibold">
                            {user.firstName} {user.lastName} <span className="muted font-medium">(you)</span>
                          </span>
                        ) : (
                          <span className="whitespace-nowrap">
                            <span className="font-semibold">Team member</span>{" "}
                            <span className="mono muted text-xs" title={m.userId}>
                              {m.userId.slice(0, 8)}
                            </span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap">{ROLE_LABEL[m.role]}</td>
                    <td>
                      <NotAvailable label="Barn access isn't tracked by the API" />
                    </td>
                    <td className="muted mono whitespace-nowrap text-[12.5px]">
                      {self ? "Now" : <NotAvailable label="Not provided by the API" />}
                    </td>
                    <td>
                      <Badge tone={status.tone} dot>
                        {status.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </TableCard>
    </>
  );
}
