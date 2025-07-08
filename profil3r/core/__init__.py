import json

from profil3r.modules.email import email


class Core(object):

    from ._argparse import parse_arguments
    from ._logo import print_logo
    from ._menu import menu
    from ._modules import get_report_modules, modules_update
    from ._permutations import get_permutations
    from ._report import (
        generate_csv_report,
        generate_HTML_report,
        generate_json_report,
        generate_report,
    )
    from ._results import print_results
    from ._run import run
    from .services._domain import domain
    from .services._email import email
    from .services._entertainment import dailymotion, vimeo
    from .services._forum import (
        crackedto,
        hackernews,
        jeuxvideo,
        lesswrong,
        zeroxzerozerosec,
    )
    from .services._hosting import aboutme
    from .services._money import buymeacoffee, patreon
    from .services._music import smule, soundcloud, spotify
    from .services._porn import pornhub, redtube, xvideos
    from .services._programming import github, pastebin, replit
    from .services._social import (
        facebook,
        flickr,
        instagram,
        linktree,
        myspace,
        pinterest,
        tiktok,
        twitter,
    )
    from .services._tchat import skype

    def __init__(self, config_path):
        self.version = "1.3.11"

        with open(config_path, "r") as f:
            self.CONFIG = json.load(f)

        self.separators = []
        self.result = {}
        self.permutations_list = []
        self.modules = {
            # Emails
            "email": {"method": self.email},
            # Social
            "facebook": {"method": self.facebook},
            "twitter": {"method": self.twitter},
            "tiktok": {"method": self.tiktok},
            "instagram": {"method": self.instagram},
            "pinterest": {"method": self.pinterest},
            "linktree": {"method": self.linktree},
            "myspace": {"method": self.myspace},
            "flickr": {"method": self.flickr},
            # Music
            "soundcloud": {"method": self.soundcloud},
            "spotify": {"method": self.spotify},
            "smule": {"method": self.smule},
            # Programming
            "github": {"method": self.github},
            "pastebin": {"method": self.pastebin},
            "replit": {"method": self.replit},
            # Forums:
            "0x00sec": {"method": self.zeroxzerozerosec},
            "jeuxvideo.com": {"method": self.jeuxvideo},
            "hackernews": {"method": self.hackernews},
            "crackedto": {"method": self.crackedto},
            "lesswrong": {"method": self.lesswrong},
            # Tchat
            "skype": {"method": self.skype},
            # Entertainment
            "dailymotion": {"method": self.dailymotion},
            "vimeo": {"method": self.vimeo},
            # Porn
            "pornhub": {"method": self.pornhub},
            "redtube": {"method": self.redtube},
            "xvideos": {"method": self.xvideos},
            # Money
            "buymeacoffee": {"method": self.buymeacoffee},
            "patreon": {"method": self.patreon},
            # Hosting
            "aboutme": {"method": self.aboutme},
            # Domain
            "domain": {"method": self.domain},
        }
