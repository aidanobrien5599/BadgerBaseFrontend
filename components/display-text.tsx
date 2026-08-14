"use client";

import { useState } from "react";

export const DisplayText = ({ course }: { course: any }) => {
  const [expanded, setExpanded] = useState(false);
  const maxLength = 150; // truncate length

  const getDisplayText = (text: string) => {
    if (!text) return "";
    if (expanded || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-surface space-y-2">
      <h2 className="text-lg font-semibold">{course.title}</h2>
      <p className="text-muted-foreground">
        {getDisplayText(course.description)}
        {course.description?.length > maxLength && (
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="ml-1 text-primary hover:underline"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </p>

      {(course.enrollment_requirements || course.enrollment_prerequisites) && (
        <div className="text-sm text-muted-foreground space-y-1">
          {course.enrollment_requirements && (
            <p>
              <strong>Requirements:</strong> {course.enrollment_requirements}
            </p>
          )}
          {course.enrollment_prerequisites && (
            <p>
              <strong>Prerequisites:</strong> {course.enrollment_prerequisites}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
