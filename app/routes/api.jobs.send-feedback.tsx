import { json, type ActionFunctionArgs } from "react-router";
import { sendScheduledFeedbackEmails } from "../jobs/sendFeedbackEmails.server";

/**
 * API endpoint to manually trigger the feedback email job
 * Can also be called by external cron services like:
 * - EasyCron (https://www.easycron.com/)
 * - Cron-job.org (https://cron-job.org/)
 * - AWS CloudWatch Events
 * - Vercel Cron (if deployed on Vercel)
 */
export async function action({ request }: ActionFunctionArgs) {
  try {
    // Optional: Add authentication to prevent unauthorized access
    const authHeader = request.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await sendScheduledFeedbackEmails();

    return json(result);
  } catch (error) {
    console.error("Error running feedback job:", error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function loader() {
  return json({ message: "Use POST to trigger the job" }, { status: 405 });
}
