// git@github.com:owner/repo.git, https://gitlab.com/group/sub/repo, ssh://git@host:22/a/b.git -> { host, path }
export function parseRemote(url) {
  const m = /^(?:[a-z+]+:\/\/)?(?:[^@/]+@)?([^:/]+)(?::\d+)?[:/](.+?)(?:\.git)?\/?$/i.exec(url.trim());
  return m ? { host: m[1].toLowerCase(), path: m[2].replace(/^\/+/, "") } : null;
}
