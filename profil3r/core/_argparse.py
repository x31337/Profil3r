import argparse
import sys


# Usage :  profil3r.py [-h] -p PROFILE [PROFILE ...]
# Parse arguments from the command line using argparse
def parse_arguments(self, profiles_list=None):
    if profiles_list is not None:
        self.items = profiles_list
        return

    # Only parse arguments if running as a script and not an empty argv (like in some test/import scenarios)
    # And if profiles_list was not provided.
    if not sys.argv[
        1:
    ]:  # if no command-line arguments are passed other than script name
        # If items are already set (e.g. by web UI), don't try to parse
        if hasattr(self, "items") and self.items:
            return
        # If no profiles are provided via arguments or already set, this would be an issue for CLI.
        # For web UI, items will be set directly. For CLI, this indicates missing -p.
        # The original parser made -p required, so it would exit here.
        # We'll let it proceed to parser.parse_args() which will handle the 'required' error for CLI.

    parser = argparse.ArgumentParser(
        description="Profil3r is an OSINT tool that allows you to find the differents social accounts, domains and emails used by a person"
    )
    # The original code had two ArgumentParser initializations. Consolidating.
    # parser = argparse.ArgumentParser() # This was redundant

    parser.add_argument(
        "-p",
        "--profile",
        required=True,  # Keep required for CLI usage
        nargs="+",
        help="parts of the username that you are looking for, e.g. : john doe",
    )

    # Check if we are in a context where parsing is appropriate
    # (e.g. not when imported and profiles_list is passed)
    # If sys.argv contains something beyond the script name, try to parse
    if len(sys.argv) > 1:
        try:
            args = parser.parse_args()
            # Items passed from the command line
            self.items = args.profile
        except SystemExit as e:
            # This happens when --help is used or a required argument is missing.
            # For CLI, this is fine. For library use, this should not happen if profiles_list is passed.
            if (
                profiles_list is None
            ):  # Only re-raise if not being used as library with profiles_list
                raise e
            # If profiles_list was passed, we shouldn't be here, but as a safeguard:
            print(
                f"Argparse SystemExit suppressed due to profiles_list being provided: {e}"
            )
    elif not hasattr(self, "items") or not self.items:
        # If no CLI args and items not set, CLI would require -p.
        # For library use, this means items were not set before calling run.
        # The `required=True` for `-p` will be enforced by `parser.parse_args()` if CLI args are present.
        # If no CLI args, and items not set, it's an issue for CLI mode.
        # We can let the original required=True handle this for CLI.
        # For programmatic use, ensure items are set before calling run.
        pass
