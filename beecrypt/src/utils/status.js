// Central place for status vocab + badge tone mapping (section 40 of the spec).
export const STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  PASS: "PASS",
  FAIL: "FAIL",
  CERTIFIED: "CERTIFIED",
  VERIFIED: "VERIFIED",
  NOT_VERIFIED: "NOT_VERIFIED",
  REJECTED: "REJECTED",
};

export function toneForStatus(status) {
  switch (status) {
    case "PASS":
    case "CERTIFIED":
    case "VERIFIED":
    case "Completed":
    case "Approved":
    case "healthy":
    case "Active":
      return "success";
    case "FAIL":
    case "REJECTED":
    case "NOT_VERIFIED":
    case "Rejected":
    case "critical":
      return "critical";
    case "PENDING":
    case "IN_PROGRESS":
    case "Pending":
    case "warning":
      return "warning";
    default:
      return "neutral";
  }
}
