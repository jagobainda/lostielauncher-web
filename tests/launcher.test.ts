import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseAndroidRelease } from "../src/lib/launcher.ts";

const feed = {
    versionName: "0.8.1",
    downloadUrl: "https://ericlostie-launcher.jagoba.dev/public/android/LostieLauncher-0.8.1.apk",
};

describe("parseAndroidRelease", () => {
    it("reads the version and the versioned APK URL", () => {
        assert.deepEqual(parseAndroidRelease(feed), feed);
    });

    it("rejects payloads without a version or a download URL", () => {
        assert.equal(parseAndroidRelease({ downloadUrl: feed.downloadUrl }), null);
        assert.equal(parseAndroidRelease({ versionName: " ", downloadUrl: feed.downloadUrl }), null);
        assert.equal(parseAndroidRelease({ versionName: feed.versionName }), null);
        assert.equal(parseAndroidRelease(null), null);
        assert.equal(parseAndroidRelease([feed]), null);
    });

    it("only accepts https download URLs", () => {
        assert.equal(parseAndroidRelease({ ...feed, downloadUrl: "javascript:alert(1)" }), null);
        assert.equal(parseAndroidRelease({ ...feed, downloadUrl: "http://example.com/a.apk" }), null);
    });
});
