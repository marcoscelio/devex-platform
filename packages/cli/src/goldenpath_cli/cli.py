"""Golden Path CLI entry point.

Commands are intentionally thin: they orchestrate git conventions, local
validation, and DORA emission. The heavy lifting lives in small, testable
modules (``workid``, ``dora``, ``conventions``).
"""

from __future__ import annotations

import subprocess
from pathlib import Path

import typer
from rich.console import Console

from . import __version__, dora, workid
from .conventions import PR_TEMPLATE, check_repo

app = typer.Typer(
    name="gp",
    help="Golden Path — standardize local workflows across LoanPro's teams.",
    no_args_is_help=True,
    add_completion=False,
)
console = Console()


def _run(cmd: list[str]) -> str:
    """Run a git command and return stdout (raises on failure)."""
    return subprocess.run(cmd, check=True, capture_output=True, text=True).stdout.strip()


@app.command()
def version() -> None:
    """Print the CLI version."""
    console.print(f"gp {__version__}")


@app.command()
def init(
    service: str = typer.Option(..., help="Service name, e.g. transactionify."),
    team: str = typer.Option(..., help="Owning team, e.g. payments."),
    language: str = typer.Option("python", help="python | go | clojure | typescript."),
) -> None:
    """Scaffold Golden Path conventions into the current repository.

    Writes a PR template and a project marker so every repo starts correct-by-
    default. Convention over configuration: the golden path is the easy path.
    """
    root = Path.cwd()
    gh = root / ".github"
    gh.mkdir(exist_ok=True)
    (gh / "pull_request_template.md").write_text(PR_TEMPLATE, encoding="utf-8")

    marker = root / ".goldenpath.toml"
    marker.write_text(
        f'service = "{service}"\nteam = "{team}"\nlanguage = "{language}"\n',
        encoding="utf-8",
    )
    console.print(f"[green]✓[/] Initialized Golden Path for [bold]{service}[/] ({language}).")
    console.print("  • .github/pull_request_template.md")
    console.print("  • .goldenpath.toml")
    console.print("\nNext: [cyan]gp hooks install[/] then [cyan]gp branch FIN-123 my-change[/]")


standards = typer.Typer(help="Validate a repo against Golden Path standards.")
app.add_typer(standards, name="standards")


@standards.command("check")
def standards_check() -> None:
    """Run local standards validation (exits non-zero on any violation)."""
    violations = check_repo(Path.cwd())
    if not violations:
        console.print("[green]✓ All Golden Path standards satisfied.[/]")
        raise typer.Exit(0)
    console.print("[red]✗ Standards violations:[/]")
    for v in violations:
        console.print(f"  • {v}")
    raise typer.Exit(1)


@app.command()
def branch(
    work_id: str = typer.Argument(..., help="Universal Work ID, e.g. FIN-123."),
    description: str = typer.Argument(..., help="Short description of the change."),
    actor: str = typer.Option("local-dev", help="Actor id for the audit trail."),
) -> None:
    """Create a conventional, Work-ID-enforced git branch."""
    try:
        name = workid.branch_name(work_id, description)
    except workid.InvalidWorkIdError as err:
        console.print(f"[red]✗[/] {err}")
        raise typer.Exit(1) from err

    _run(["git", "checkout", "-b", name])
    dora.emit(
        dora.build_event(
            event_type="change",
            work_id=work_id,
            actor_id=actor,
            what=f"created branch {name}",
            git={"branch": name},
        )
    )
    console.print(f"[green]✓[/] Created branch [bold]{name}[/] and recorded audit event.")


@app.command()
def pr(
    title: str = typer.Option(..., help="PR title — MUST contain the Work ID, e.g. 'FIN-123: add retries'."),
    actor: str = typer.Option("local-dev", help="Actor id for the audit trail."),
) -> None:
    """Validate + record a pull request (enforces Work ID in the title).

    In the full build this shells out to `gh pr create` with the standardized
    template and two-reviewer rule; here we validate and emit the audit event.
    """
    try:
        wid = workid.require(title, context="PR title")
    except workid.InvalidWorkIdError as err:
        console.print(f"[red]✗[/] {err}")
        raise typer.Exit(1) from err

    dora.emit(
        dora.build_event(
            event_type="change",
            work_id=wid,
            actor_id=actor,
            what=f"opened PR: {title}",
        )
    )
    console.print(f"[green]✓[/] PR title valid (Work ID [bold]{wid}[/]). Audit event recorded.")


hooks = typer.Typer(help="Manage git hooks (shift-left validation).")
app.add_typer(hooks, name="hooks")


@hooks.command("install")
def hooks_install() -> None:
    """Install a pre-push hook that runs standards checks before code leaves the machine."""
    hook_dir = Path.cwd() / ".git" / "hooks"
    if not hook_dir.exists():
        console.print("[red]✗[/] Not a git repository (no .git/hooks). Run inside a repo.")
        raise typer.Exit(1)
    hook = hook_dir / "pre-push"
    hook.write_text(
        "#!/bin/sh\n"
        "# Managed by Golden Path CLI — shift-left validation.\n"
        'echo "[golden-path] running standards check before push..."\n'
        "gp standards check || exit 1\n",
        encoding="utf-8",
    )
    hook.chmod(0o755)
    console.print("[green]✓[/] Installed pre-push hook → runs `gp standards check`.")


if __name__ == "__main__":
    app()
