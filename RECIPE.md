# Profile pictures

The Spaces sidebar you already know, but a space whose repo lives on GitHub or GitLab shows the owner's picture where the colored letter tile was. Spaces that aren't in a repo, or whose remote has no public picture, keep their letter. Everything else about Spaces stays the same. This is a piece for your own window: you point your layout's Spaces block at it.

![Profile pictures](preview.png)

This file is the brief: enough to build Profile pictures from an empty folder. The files next to it are one build of it. If they don't work on your Herdr, or you want it different, build it again from here.

## What you see

- The Spaces list, top to bottom: a 31px header ("Spaces" in 11.5px `dim` text, a 26px + button on the right), then one row per space on the `chrome` background, grouped by machine when more than one is known.
- Each top-level row is 30px high, 8px horizontal padding, 8px corner radius, `selected` background when active. On the left sits an 18×18px avatar with a 5px radius:
  - **A picture** when the space's repo has an `origin` on github.com (the owner's GitHub picture), or on a host whose name contains `gitlab` (the project's avatar, else its group's or user's).
  - **The letter tile** otherwise: the first letter of the space name, uppercase, 10.5px bold white on the space's color (`#22a99a`, `#e3814f`, `#5b8def`, `#8b7cf6`, `#3fae6a`, `#d9649a`, the same colors shipped Spaces uses).
- The space name (13px `foreground`, max 150px, truncated), then on the right in 11.5px `dim`: the repo name and branch when they're unusual (not main/master, not the same as the space name), green `↑n` ahead and pink `↓n` behind.
- Worktree spaces sit under their repo's row, 28px high, indented 22px with a branch icon instead of an avatar. They get no picture.
- In the narrow rail (sidebar under 160px) rows show a number and a status dot, as in shipped Spaces. No pictures there.

## How it behaves

- A picture shows up a moment after the space's git info, once its download finishes. Until then, and if the download fails, the row shows the letter tile. Rows never jump or resize when a picture arrives.
- Pictures are looked up once per repo each time the mod starts (a layout switch, an app restart, saving a file in the mod). A changed GitHub picture shows after the next start.
- Agent status: in the rail, blocked and done show `●` in the `blocked` / `done` color, working and idle show `·`. Wide rows show no status: agents are in the Agents list.
- Click a row to switch to that space. Drag rows to reorder spaces within their machine (an accent line shows where it lands). Right-click a row for the shipped space menu. The + button makes a new space. Machine headers fold and unfold, and offer "New space there".
- Nothing animates. There are no keys of its own.

## Built from

- **One mod**, `mods/profile-pictures/`: `main.js`, `remote.js`, `remote.test.mjs`, and `mod.json` (`{ "place": "none", "title": "Profile pictures" }`). No `keys.json` and no layout: it replaces the `spaces` block's content in a layout you already have.
- **A clone of the shipped `spaces` mod**: `herdr-app do mod.clone '{"name":"spaces","as":"profile-pictures"}'`, then three additions. Keep everything else as shipped: git status per space, worktree nesting, machine grouping, drag to reorder, `shared("space.colors")`, the `menu` popup.
- **`remote.js`**: `parseRemote(url)` turns `git@github.com:owner/repo.git`, `https://gitlab.com/group/sub/repo`, `ssh://git@host:22/a/b.git` into `{ host, path }` (host lowercased, `.git` and slashes trimmed), or `null`. `remote.test.mjs` checks it with `node mods/profile-pictures/remote.test.mjs`.
- **Finding the picture**, once per repo (`this.pics[repo]`, set to `null` before starting so it's never asked twice), right after the clone's git check has stored a repo:
  1. `exec("git", ["remote", "get-url", "origin"], { cwd, on })`, so a space on another machine asks that machine.
  2. github.com: `https://github.com/<owner>.png?size=64`. Hosts containing `gitlab`: `fetch("https://<host>/api/v4/projects/<url-encoded path>")`, then `avatar_url || namespace.avatar_url`. Any other host: none.
  3. `exec("curl", ["-fsSL", "--max-time", "15", "--create-dirs", "-o", <appHome()>/<file>, url])` on this computer, because `image()` only reads local files and `fetch` has no binary body. `<file>` is `mods/profile-pictures/.cache/<host>_<path>.png`, with anything other than `[\w.-]` replaced by `_`.
  4. On success, store the path and call `cx.notify()`.
- **Drawing it**: in the row, when not a worktree row and `this.pics[g?.repo]` is set, use `image(path).size(18).flex_none().rounded(5)` instead of the letter tile.
- **Herdr functions**: `spaces`, `machines`, `panes`, `run` (`space.select`, `space.move`, `space.new`), `openOverlay` (the shipped `menu`), `exec`, `hc`, `theme`, `shared` / `setShared`, `watchFolder`, `layout`, `appHome`. Icons: `mods/workspace-chrome/plus.svg` and `branch.svg` from the shipped mods.
- **Programs**: `git` (on the space's machine) and `curl` (here). **Network**: github.com, avatars.githubusercontent.com (GitHub's redirect), and the GitLab host's API and avatar URLs.

## Watch out

- **Use it in a layout:** this mod has `place: "none"`. Set the `spaces` block's `content.mod` to `profile-pictures` in your own layout. Shipped layouts are read-only, so for Herdr (main) clone it first, `herdr-app do layout.clone '{"name":"main","as":"main-pictures"}'`, and edit `layouts/main-pictures.json`. `ctrl-shift-l` switches back.
- **Cache in a hidden folder.** Saving any non-hidden file in the mod folder hot-reloads it, and a reload looks up every picture again, which writes the files again. `.cache/` is hidden, so it doesn't.
- **Draw the image only after the file exists.** The build never points `image()` at a path curl hasn't finished writing; don't change that unless you've checked a missing file doesn't stay missing once it appears.
- GitHub pictures come from the **owner**, not the repo, so every repo of one owner shows the same face. Each repo still gets its own cache file.
- GitLab only works for **public** projects: the API is called without a token and a private project returns 404. Self-hosted GitLab works only if its hostname contains `gitlab` and it serves HTTPS. GitHub Enterprise, Bitbucket, Codeberg and other hosts keep the letter.
- Only `origin` is read. A repo with no `origin`, or with a fork's `origin`, shows that remote's owner.
- The file is always named `.png`. GitHub and gitlab.com avatars tested so far are PNGs; a JPEG avatar saved under that name hasn't been tried.
- `curl` must be on the PATH Herdr sees. Without it, every row keeps its letter, with no error.
- The cache is never pruned. Delete `.cache/` to clear it.
- The mod reaches the network and runs `git` and `curl`. Tell the person before installing it.

## Done when

- `herdr-app check mods/profile-pictures` passes, and `node mods/profile-pictures/remote.test.mjs` prints `ok`.
- With the layout's `spaces` block set to `profile-pictures`, a space in a clone of a github.com repo shows the owner's picture at 18px with rounded corners, and `mods/profile-pictures/.cache/` holds its `.png`.
- A space in a public gitlab.com project shows the project's or group's avatar.
- A space in your home folder (not a repo), and one whose `origin` is on another host, show the colored letter tile.
- Clicking, dragging to reorder, right-clicking for the menu, + for a new space and the narrow rail all work as in shipped Spaces.
- With the network off, the mod still loads and every row shows its letter.
