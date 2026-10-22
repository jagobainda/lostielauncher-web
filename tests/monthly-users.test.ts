import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseMonthlyUsers } from "../src/lib/stats.ts";

const months = (points: { month: string; users: number }[] | undefined) =>
    points?.map(({ month, users }) => ({ month, users }));

describe("parseMonthlyUsers", () => {
    it("omits the platform split while no month has been measured", () => {
        const stats = parseMonthlyUsers({
            "2026-08": 24663,
            "2026-09": 33234,
            "2026-10": 23479,
            byPlatform: { Desktop: {}, Android: {} },
        });
        assert.deepEqual(stats?.byPlatform, {});
        assert.equal(stats?.points.length, 3);
    });

    it("keeps the published total instead of summing the platforms", () => {
        const stats = parseMonthlyUsers({
            "2026-11": 100,
            byPlatform: { Desktop: { "2026-11": 80 }, Android: { "2026-11": 30 } },
        });
        assert.equal(stats?.latest.users, 100);
        assert.deepEqual(months(stats?.byPlatform.Desktop), [{ month: "2026-11", users: 80 }]);
        assert.deepEqual(months(stats?.byPlatform.Android), [{ month: "2026-11", users: 30 }]);
    });

    it("keeps measured zeros and leaves unmeasured months out", () => {
        const stats = parseMonthlyUsers({
            "2026-10": 90,
            "2026-11": 100,
            byPlatform: { Desktop: { "2026-11": 100 }, Android: { "2026-11": 0 } },
        });
        assert.deepEqual(months(stats?.byPlatform.Desktop), [{ month: "2026-11", users: 100 }]);
        assert.deepEqual(months(stats?.byPlatform.Android), [{ month: "2026-11", users: 0 }]);
    });

    it("sorts each platform series by month", () => {
        const stats = parseMonthlyUsers({
            "2026-12": 2,
            byPlatform: { Desktop: { "2026-12": 2, "2026-11": 1 } },
        });
        assert.deepEqual(
            stats?.byPlatform.Desktop?.map(point => point.month),
            ["2026-11", "2026-12"],
        );
    });

    it("supports responses without byPlatform", () => {
        const stats = parseMonthlyUsers({ "2026-09": 33234, "2026-10": 23479 });
        assert.deepEqual(stats?.byPlatform, {});
        assert.equal(stats?.latest.month, "2026-10");
    });

    it("ignores unknown platforms, non-month keys and malformed series", () => {
        const stats = parseMonthlyUsers({
            "2026-11": 10,
            byPlatform: { Desktop: [5], Android: "10", iOS: { "2026-11": 1 }, constructor: { "2026-11": 1 } },
        });
        assert.deepEqual(stats?.byPlatform, {});
        assert.deepEqual(months(stats?.points), [{ month: "2026-11", users: 10 }]);
    });

    it("rejects payloads without any total month", () => {
        assert.equal(parseMonthlyUsers(null), null);
        assert.equal(parseMonthlyUsers([]), null);
        assert.equal(parseMonthlyUsers({ byPlatform: { Desktop: { "2026-11": 1 } } }), null);
    });
});
