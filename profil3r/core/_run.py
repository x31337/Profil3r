import threading

from profil3r.core.colors import Colors


def run(self, profiles_list=None, html_report_filepath=None, interactive=True):
    if interactive:
        self.print_logo()

    # If profiles_list is provided, use it. Otherwise, parse_arguments will try to get them from CLI.
    self.parse_arguments(profiles_list=profiles_list)

    # Ensure self.items is populated
    if not hasattr(self, 'items') or not self.items:
        if interactive:
            print(Colors.BOLD + Colors.FAIL + "[!] No profiles provided. Use -p option for CLI." + Colors.ENDC)
        # For non-interactive (web UI), this should ideally be caught before calling run,
        # but as a safeguard, return None or raise an error.
        # Raising an error might be better for the web UI to catch and display.
        raise ValueError("No profiles provided to Profil3r.")

    if interactive:
        self.menu() # Show menu only in interactive mode
    else:
        # For non-interactive mode, we need to ensure `self.CONFIG["selected_modules"]` is set.
        # The default behavior from config.json is to select all modules if "all" is present.
        # If `self.menu()` is not called, we need to manually set this up or ensure config.json has a default.
        # Let's assume `get_report_modules()` handles the default "all" case from config.json correctly.
        pass

    self.get_permutations()

    if not self.permutations_list:
        if interactive:
            print(Colors.BOLD + Colors.FAIL + "[!] No permutations generated. Check your profile inputs and separators configuration." + Colors.ENDC)
        raise ValueError("No permutations generated. Check profile inputs and separators.")

    if interactive:
        # Number of permutations to test per service
        print(
            Colors.BOLD
            + "[+]"
            + Colors.ENDC
            + " {} permutations to test for each service, you can reduce this number by selecting less options if it takes too long".format(
                len(self.permutations_list)
            )
        )

    modules_to_run = self.get_report_modules()

    if interactive:
        print(
            "\n"
            + "Profil3r will search : \n "
            + Colors.BOLD
            + "[+] "
            + Colors.ENDC
            + "{} \n".format(str("\n " + Colors.BOLD + "[+] " + Colors.ENDC).join(modules_to_run))
        )

    # Clear previous results before running modules
    self.result = {}

    threads = []
    for module_name in modules_to_run:
        if module_name in self.modules:
            thread = threading.Thread(target=self.modules[module_name]["method"])
            threads.append(thread)
            thread.start()
        else:
            if interactive:
                print(Colors.BOLD + Colors.FAIL + f"[!] Module '{module_name}' not found in configured modules." + Colors.ENDC)


    for thread in threads:
        thread.join()

    # Pass the desired HTML report filepath to generate_report
    generated_report_path = self.generate_report(html_output_filepath=html_report_filepath)

    if interactive:
        # The generate_report method (and its sub-methods like generate_HTML_report)
        # already prints confirmation messages for CLI.
        pass

    return generated_report_path # Return the path to the generated HTML report
