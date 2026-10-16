"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingRows, NotAvailable, Unavailable } from "@/components/ui/DataState";
import { DetailRow } from "@/components/ui/DetailRow";
import { Icon } from "@/components/ui/Icon";
import { backend } from "@/lib/api/backend";
import { ApiError } from "@/lib/api/errors";
import type { Pig } from "@/lib/api/types";
import { useApiQuery } from "@/lib/api/useApiQuery";
import { useCollars } from "@/lib/api/useFarmData";
import { useFarmContext } from "@/lib/auth/AuthProvider";
import { formatDate, formatRelative } from "@/lib/format";
import { canViewCollarAssignments } from "@/lib/permissions";
import { DEVICE_STATUS, SEX_LABEL } from "@/lib/status";
import { PigStatusBadge } from "./PigBits";

export function PigProfileView({ pigId }: { pigId: string }) {
  const { farm } = useFarmContext();
  const pig = useApiQuery(`${farm.id}:pig:${pigId}`, (signal) => backend.getPig(farm.id, pigId, signal));

  const backLink = (
    <Link href="/pigs" className="backlink">
      <Icon name="arrow-left" />
      All pigs
    </Link>
  );

  if (pig.status === "loading") {
    return (
      <>
        {backLink}
        <Card>
          <LoadingRows rows={5} />
        </Card>
      </>
    );
  }
  if (pig.status === "error") {
    // A malformed id is rejected with 400 by the backend's UUID check.
    const missing =
      pig.error instanceof ApiError && (pig.error.kind === "not_found" || pig.error.status === 400);
    return (
      <>
        {backLink}
        <Card>
          {missing ? (
            <EmptyState icon="scan" title="Pig not found" text={`No pig with this ID exists on ${farm.name}.`} />
          ) : (
            <ErrorState error={pig.error} onRetry={pig.reload} />
          )}
        </Card>
      </>
    );
  }
  return (
    <>
      {backLink}
      <PigProfile pig={pig.data} />
    </>
  );
}

function PigProfile({ pig }: { pig: Pig }) {
  const facts = [
    pig.breed ?? "Breed not set",
    pig.sex ? SEX_LABEL[pig.sex] : null,
    pig.dateOfBirth ? `Born ${formatDate(pig.dateOfBirth)}` : null,
  ].filter(Boolean);

  return (
    <>
      <div className="pagehead">
        <div className="profhead">
          <div className="pigavatar">
            <Icon name="scan" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="h1 mono">{pig.pigTag}</h1>
              <PigStatusBadge status={pig.status} />
            </div>
            <div className="sub">
              {pig.name ? `${pig.name} · ` : ""}
              {facts.join(" · ")}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button icon="chat-circle" disabled title="Messaging isn't available yet">
            Message vet
          </Button>
          <Button variant="primary" icon="first-aid-kit" disabled title="Medical cases aren't available yet">
            Open medical case
          </Button>
        </div>
      </div>

      <div className="vitalgrid">
        <Vital label="Body temperature" value={<NotAvailable />} foot="Needs telemetry data" />
        <Vital label="Activity level" value={<NotAvailable />} foot="Needs telemetry data" />
        <Vital label="Heart rate" value={<NotAvailable />} foot="Needs telemetry data" />
        <Vital
          label="Weight"
          value={
            pig.weight !== null ? (
              <span className="mono">
                {pig.weight.toFixed(1)} <span className="text-sm font-medium text-muted">kg</span>
              </span>
            ) : (
              <NotAvailable label="Weight not set" />
            )
          }
          foot={pig.weight !== null ? `Recorded · updated ${formatRelative(pig.updatedAt)}` : "Not recorded"}
        />
      </div>

      <div className="grid2">
        <Card>
          <div className="cardhead">
            <div>
              <div className="cardtitle">Body temperature</div>
              <div className="cardsub">Last 24 hours</div>
            </div>
          </div>
          <Unavailable title="Temperature history isn't available yet" text="The API stores collar telemetry but doesn't provide a way to read it." />
        </Card>
        <div className="aicard">
          <div className="aihdr">
            <div className="aidot">
              <Icon name="sparkle" weight="fill" />
            </div>
            Pigorithm AI<span className="aichip">Insight</span>
          </div>
          <Unavailable title="No insights yet" text="AI prediction results are stored by the backend but not exposed through the API yet." />
        </div>
      </div>

      <div className="grid2">
        <Card>
          <div className="cardtitle mb-[18px]">Medical history</div>
          <Unavailable title="Medical records aren't available yet" text="The API has no medical cases endpoint." />
        </Card>
        <AssignedDevice pigId={pig.id} />
      </div>
    </>
  );
}

function AssignedDevice({ pigId }: { pigId: string }) {
  const { farm, role } = useFarmContext();
  const allowed = canViewCollarAssignments(role);
  const assignment = useApiQuery(allowed ? `${farm.id}:assignment:${pigId}` : null, (signal) =>
    backend.currentCollarForPig(farm.id, pigId, signal),
  );
  const collars = useCollars();

  let body: ReactNode;
  if (!allowed) {
    body = <EmptyState icon="lock-simple" title="Owner only" text="Collar assignments are visible to the farm owner." />;
  } else if (assignment.status === "loading" || collars.status === "loading") {
    body = <LoadingRows rows={3} />;
  } else if (assignment.status === "error") {
    body =
      assignment.error instanceof ApiError && assignment.error.kind === "not_found" ? (
        <EmptyState icon="cpu" title="No collar assigned" text="This pig has no active collar assignment." />
      ) : (
        <ErrorState error={assignment.error} onRetry={assignment.reload} />
      );
  } else if (collars.status === "error") {
    body = <ErrorState error={collars.error} onRetry={collars.reload} />;
  } else {
    const collar = collars.data.find((c) => c.id === assignment.data.collarId);
    const meta = collar ? DEVICE_STATUS[collar.status] : null;
    body = (
      <>
        <div className="mb-4 flex items-center gap-3">
          <div className="staticon t-rose size-11 text-[22px]">
            <Icon name="cpu" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mono font-semibold">Collar {collar?.collarCode ?? "(removed)"}</div>
            <div className="muted text-[12.5px]">
              {collar?.hardwareVersion ? `HW ${collar.hardwareVersion} · ` : ""}
              FW {collar?.firmwareVersion ?? "unknown"}
            </div>
          </div>
          {meta && (
            <Badge tone={meta.tone} dot>
              {meta.label}
            </Badge>
          )}
        </div>
        <DetailRow label="Assigned">
          <span className="mono font-semibold">{formatDate(assignment.data.assignedAt)}</span>
        </DetailRow>
        <DetailRow label="Battery">
          <NotAvailable label="Needs telemetry data" />
        </DetailRow>
        <DetailRow label="Signal">
          <NotAvailable label="Needs telemetry data" />
        </DetailRow>
        <DetailRow label="Last sync">
          <NotAvailable label="Needs telemetry data" />
        </DetailRow>
      </>
    );
  }

  return (
    <Card>
      <div className="cardtitle mb-4">Assigned device</div>
      {body}
    </Card>
  );
}

function Vital({ label, value, foot }: { label: string; value: ReactNode; foot: string }) {
  return (
    <div className="vital card">
      <div className="vitallabel">{label}</div>
      <div className="vitalval">{value}</div>
      <div className="vitalfoot muted">{foot}</div>
    </div>
  );
}
