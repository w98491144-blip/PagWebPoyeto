"use client";

import { useEffect, useMemo } from "react";
import type { EventParams, MetaStandardEvent } from "@/lib/analytics";
import { trackEvent, trackMetaEvent } from "@/lib/analytics";

type TrackViewProps = {
  event: string;
  params?: EventParams;
  metaEvent?: MetaStandardEvent;
  metaParams?: EventParams;
};

const TrackView = ({ event, params, metaEvent, metaParams }: TrackViewProps) => {
  const paramsKey = useMemo(
    () => (params ? JSON.stringify(params) : ""),
    [params]
  );
  const stableParams = useMemo<TrackViewProps["params"]>(
    () => (paramsKey ? JSON.parse(paramsKey) : undefined),
    [paramsKey]
  );
  const metaParamsKey = useMemo(
    () => (metaParams ? JSON.stringify(metaParams) : ""),
    [metaParams]
  );
  const stableMetaParams = useMemo<TrackViewProps["metaParams"]>(
    () => (metaParamsKey ? JSON.parse(metaParamsKey) : undefined),
    [metaParamsKey]
  );

  useEffect(() => {
    trackEvent(event, stableParams);
  }, [event, stableParams]);

  useEffect(() => {
    if (!metaEvent) return;
    trackMetaEvent(metaEvent, stableMetaParams);
  }, [metaEvent, stableMetaParams]);

  return null;
};

export default TrackView;
