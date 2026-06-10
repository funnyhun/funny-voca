import React from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { useMaster } from "@/app/hooks";

export const withSkeleton = (WrappedComponent, SkeletonComponent) => {
  const ComponentWithSkeleton = (props) => {
    const params = useParams();
    const outletContext = useOutletContext() || {};
    const { getChunk } = useMaster();

    const targetVocaId = params.vocaId || outletContext.statsState?.profile?.selected;
    const { isLoaded } = getChunk(targetVocaId);

    if (!isLoaded) {
      return <SkeletonComponent {...props} />;
    }

    return <WrappedComponent {...props} />;
  };

  const displayName = WrappedComponent.displayName || WrappedComponent.name || "Component";
  ComponentWithSkeleton.displayName = `withSkeleton(${displayName})`;

  return ComponentWithSkeleton;
};
