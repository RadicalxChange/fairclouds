// dont prerender as this page will be unique.
export const prerender = false;

import { sendMail } from "../../utils/send-mail";
import { directusAdmin } from "../../lib/directus";
import { readItems, createItem, updateItem } from '@directus/sdk';

const {
  LICENSE_EXPIRED_EMAIL_TEMPLATE,
  AUCTION_RENEWAL_REMINDER_EMAIL_TEMPLATE,
  EARLY_RENEWAL_REMINDER_EMAIL_TEMPLATE,
  TECH_SUPPORT_EMAIL_TEMPLATE,
  TECH_SUPPORT_EMAIL_ADDRESS,
  API_SECRET_KEY
} = import.meta.env;

export const POST = async ({ request }) => {
  // This array collects error messages from throughout processing.
  const errorLogs = [];

  try {
    // Check for valid authorization.
    const authHeader = request.headers.get("Authorization") || "";
    if (authHeader !== `Bearer ${API_SECRET_KEY}`) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Query cycles where prices_status is "active" or "early_access", or renewal_active is true.
    const cycles = await directusAdmin.request(
      readItems("cycles", {
        filter: {
        _or: [
          { prices_status: { _eq: "active" } },
          { prices_status: { _eq: "early_access" } },
          { renewal_active: { _eq: true } }
        ]
        },
        fields: [
          "*",
          "prices.id",
          "prices.amount",
          "prices.cloud_id",
          "prices.cycle_id.id",
          "prices.cycle_id.name",
          "prices.cycle_id.start_date",
          "prices.cycle_id.end_date",
          "prices.cycle_id.prices_status",
          "prices.cycle_id.renewal_active",
          "prices.tier",
          "prices.price_id",
          "prices.licenses.id",
          "prices.licenses.steward.id",
          "prices.licenses.steward.first_name",
          "prices.licenses.steward.last_name",
          "prices.licenses.steward.email",
          "prices.licenses.steward.credits",
          "prices.licenses.price_id",
          "prices.licenses.renewed",
          "prices.licenses.claimed",
        ],
      }),
    );

    // Process each cycle according to our business rules.
    await processCycles(cycles, errorLogs);

    // If there are any errors, notify tech support.
    if (errorLogs.length > 0) {
      const techEmailBody = errorLogs.join("\n");
      await sendMail(TECH_SUPPORT_EMAIL_ADDRESS, TECH_SUPPORT_EMAIL_TEMPLATE, { errorLogs: techEmailBody });
    }

    // Return the session's client secret to the client
    return new Response("ok", {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Error while running daily updates:", error);
    return new Response(JSON.stringify({ error: "Error while running daily updates" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

async function processCycles(cycles, errorLogs) {
	const now = new Date();

	for (const cycle of cycles) {
    try {
      // Handle case where current cycle has ended.
      if (cycle.end_date && new Date(cycle.end_date) < now) {
        console.log(cycle.name + " has concluded.");

        // Notify stewards about any expired licenses.
        await sendEmails(LICENSE_EXPIRED_EMAIL_TEMPLATE, cycle, license => !license.renewed, errorLogs);
        
        // Then update the cycle to inactive and disable renewal.
        await updateCycle(cycle.id, { prices_status: "inactive", renewal_active: false }, errorLogs);
      }
      // Handle case where current cycle is in transition.
      else if (cycle.transition_start_date && new Date(cycle.transition_start_date) < now) {
        console.log(cycle.name + " is in transition.");

        // Find the next cycle.
        const nextCycle = cycles
          .filter(c => c.prices_status === "early_access" && new Date(c.start_date) > now)
          .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))[0];

        if (nextCycle) {
          // Update cycle status.
          await updateCycle(cycle.id, { prices_status: "inactive", renewal_active: true }, errorLogs);
          await updateCycle(nextCycle.id, { prices_status: "active" }, errorLogs);
        }

        // Periodically send reminders to stewards about any licenses that are renewable.
        if (shouldSendEmailReminder(cycle, now)) {
          const emailsSent = await sendEmails(AUCTION_RENEWAL_REMINDER_EMAIL_TEMPLATE, cycle, license => !license.renewed && !license.claimed, errorLogs);

          // If reminders were sent successfully, record the time of notification in the db.
          if (emailsSent) {
            await updateCycle(cycle.id, { renewal_reminder_sent: now }, errorLogs);
          }
        }
      }
      // Handle case where current cycle is in early renewal.
      else if (cycle.renewal_start_date && new Date(cycle.renewal_start_date) < now) {
        console.log(cycle.name + " is in early renewal.");

        let updateResults = [];

        // Find the next cycle.
        let nextCycle = cycles
          .filter(c => c.prices_status === 'early_access' && new Date(c.start_date) > now)
          .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))[0];
        
        // If the next cycle doesn't exist yet, create it.
        if (!nextCycle) {
          const currentStart = new Date(cycle.start_date);
          const currentEnd = new Date(cycle.end_date);
          const cycle_length = currentEnd.getTime() - currentStart.getTime();

          const newCycleData = {
            name: "Cycle " + (Number(cycle.id) + 1),
            start_date: cycle.end_date,
            renewal_start_date: new Date((new Date(cycle.renewal_start_date)).getTime() + cycle_length),
            transition_start_date: new Date((new Date(cycle.transition_start_date)).getTime() + cycle_length),
            end_date: new Date((new Date(cycle.end_date)).getTime() + cycle_length),
            prices_status: "early_access",
            renewal_active: false,
          };
          nextCycle = await createCycle(newCycleData, errorLogs);
          updateResults.push(nextCycle);

          if (nextCycle) {
            // For each price in the current cycle, create a corresponding price in the new cycle.
            let newPricesData = [];
            for (const price of cycle.prices) {
              const amount = Number(price.amount);
              newPricesData.push({
                amount: Math.round((amount + (amount * (Number(cycle.next_price_markup) / 100))) * 100) / 100, // assuming integer representing percent markup
                cloud_id: price.cloud_id,
                cycle_id: nextCycle.id,
                tier: price.tier,
              });
            }
            const newPrices = await createPrices(newPricesData, errorLogs);
            updateResults.push(newPrices);
          }
        }

        if (!cycle.renewal_active) {
          // Mark the current cycle as having renewal active.
          const cycleUpdate = await updateCycle(cycle.id, { renewal_active: true }, errorLogs);
          updateResults.push(cycleUpdate);
        }

        const updateSuccessful = updateResults.every(Boolean);

        // Periodically remind stewards about any licenses that are renewable.
        if (shouldSendEmailReminder(cycle, now) && updateSuccessful) {
          const emailsSent = await sendEmails(EARLY_RENEWAL_REMINDER_EMAIL_TEMPLATE, cycle, license => !license.renewed, errorLogs);

          // If reminders were sent successfully, record the time of notification in the db.
          if (emailsSent) {
            await updateCycle(cycle.id, { renewal_reminder_sent: now }, errorLogs);
          }
        }
      } else {
        console.log("No updates required for cycle:", cycle.name);
      }
    } catch (err) {
      const msg = `Error processing cycle ${cycle.name}: ${err.toString()}`;
      console.error(msg);
      errorLogs.push(msg);
    }
	}
}

/**
 * Helper to group licenses by steward based on a condition, then send one email per steward.
 * @param {string} templateId - The email template id.
 * @param {object} cycle - The cycle object containing prices and licenses.
 * @param {function} licenseCondition - A callback function that receives a license and returns true if it should be included.
 * @param {Array} errorLogs - Array to push error messages.
 */
async function sendEmails(templateId, cycle, licenseCondition, errorLogs) {
	const stewards = {};

	// Iterate over each price and its licenses.
	for (const price of cycle.prices) {
		for (const license of price.licenses) {
			if (licenseCondition(license)) {
				const stewardId = license.steward.id;
				if (!stewards[stewardId]) {
					stewards[stewardId] = {
						id: stewardId,
						first_name: license.steward.first_name,
						last_name: license.steward.last_name,
            email: license.steward.email,
						credits: license.steward.credits > 0 ? (license.steward.credits / 100).toFixed(2) + " €" : "",
						licenses: [], // An array to hold licenses meeting the condition.
					};
				}
				stewards[stewardId].licenses.push({
					cloud_id: price.cloud_id,
					tier: price.tier,
					cycle_id: price.cycle_id,
				});
			}
		}
	}

	// Now send one email per steward with the relevant license data.
  const results = [];
	for (const stewardId in stewards) {
    const stewardData = stewards[stewardId];
    const emailData = {
      "user_name": stewardData.first_name,
      "credits": stewardData.credits,
      "licenses": stewardData.licenses,
      "cycle_transition_start_date": formatDateTime(cycle.transition_start_date),
      "cycle_end_date": formatDateTime(cycle.end_date),
    }
    try {
      const response = await sendMail(stewardData.email, templateId, emailData);
      results.push(response);
    } catch (err) {
      const msg = `Error sending email to ${stewardData.email}: ${err.toString()}`;
      errorLogs.push(msg);
      results.push({ ok: false });
    }
	}
  return results.some(response => response.ok);
}

// Helper to determine if an email reminder should be sent for a cycle.
function shouldSendEmailReminder(cycle, now) {
	if (!cycle.renewal_reminder_interval) return false;
	const reminderSent = new Date(cycle.renewal_reminder_sent);
	const interval = cycle.renewal_reminder_interval * 24 * 60 * 60 * 1000; // assuming interval is in days
	return now - reminderSent > interval;
}

function formatDateTime(dateStr) {
	const date = new Date(dateStr);
	return date.toLocaleString('en-US', { 
		month: 'long', 
		day: 'numeric', 
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: true,
    timeZoneName: 'short'
	});
}

// Helper to update a cycle.
async function updateCycle(cycleId, updateData, errorLogs) {
  console.log(`Updating cycle ${cycleId} with`, updateData);
  let result;
  try {
    result = await directusAdmin.request(updateItem('cycles', cycleId, updateData));
  } catch (err) {
    const msg = `Error updating cycle ${cycleId} with data ${JSON.stringify(updateData)}: ${err.toString()}`;
    console.error(msg);
    if (errorLogs) errorLogs.push(msg);
  }
  return result;
}

// Helper to create a new cycle.
async function createCycle(newCycleData, errorLogs) {
  console.log(`Creating new cycle with data`, newCycleData);
  let result;
  try {
    result = await directusAdmin.request(createItem('cycles', newCycleData, {
      fields: [
        "id",
      ]
    }));
  } catch (err) {
    const msg = `Error creating cycle with data ${JSON.stringify(newCycleData)}: ${err.toString()}`;
    console.error(msg);
    if (errorLogs) errorLogs.push(msg);
  }
  return result;
}

// Helper to create new prices.
async function createPrices(newPriceData, errorLogs) {
  console.log(`Creating new prices with data`, newPriceData);
  let result;
  try {
    result = await directusAdmin.request(createItem('price', newPriceData, {
      fields: [
        "id",
      ]
    }));
  } catch (err) {
    const msg = `Error creating prices with data ${JSON.stringify(newPriceData)}: ${err.toString()}`;
    console.error(msg);
    if (errorLogs) errorLogs.push(msg);
  }
  return result;
}