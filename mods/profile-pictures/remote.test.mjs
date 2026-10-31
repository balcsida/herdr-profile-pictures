// node mods/profile-pictures/remote.test.mjs
import assert from "node:assert/strict";
import { parseRemote } from "./remote.js";

assert.deepEqual(parseRemote("git@github.com:octo/repo.git\n"), { host: "github.com", path: "octo/repo" });
assert.deepEqual(parseRemote("https://github.com/octo/repo"), { host: "github.com", path: "octo/repo" });
assert.deepEqual(parseRemote("ssh://git@gitlab.com:22/group/sub/repo.git"), { host: "gitlab.com", path: "group/sub/repo" });
assert.deepEqual(parseRemote("https://GitLab.example.com/a/b/"), { host: "gitlab.example.com", path: "a/b" });
assert.equal(parseRemote("not a url"), null);
console.log("ok");
