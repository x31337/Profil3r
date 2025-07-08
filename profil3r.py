import sys
from itertools import chain, combinations
from multiprocessing import Process

from profil3r.core import Core
from profil3r.core.colors import Colors

CONFIG = "./config.json"

profil3r = Core(CONFIG).run()
