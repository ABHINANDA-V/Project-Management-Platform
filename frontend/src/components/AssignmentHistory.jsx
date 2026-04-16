import { useQuery } from "@tanstack/react-query";
import { getActivityLogs } from "../services/activityService";

export default function AssignmentHistory({ taskId }) {
  const { data } = useQuery({
    queryKey: ["assignment-history", taskId],
    queryFn: () => getActivityLogs({ taskId }),
    enabled: !!taskId,
  });
  const activities = data?.results || [];

  const assignmentLogs = activities.filter(
    (a) => a.action === "Changed Assignee",
  );

  if (assignmentLogs.length === 0) {
    return <p className="text-xs text-gray-400 mt-2">No assignment history</p>;
  }

  return (
    <div className="mt-3 border-t pt-2">
      <p className="text-xs font-bold text-purple-600 mb-1">
        Assignment History
      </p>

      {assignmentLogs.map((log) => (
        <div key={log.id} className="text-xs text-gray-600 mb-2">
          <span className="font-semibold">{log.old_value || "Unassigned"}</span>
          {" → "}
          <span className="font-semibold">{log.new_value}</span>

          <span className="block text-[10px] text-gray-400">
            {new Date(log.created_at).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
