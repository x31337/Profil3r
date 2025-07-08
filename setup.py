# -*- coding: utf-8 -*-
from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name='Profil3r',
    version="2.0.0",
    packages=find_packages(),
    author="Rog3rSm1th",
    author_email="r0g3r5@protonmail.com",
    maintainer="Pr0f1l3r Team",
    install_requires=requirements,
    description="Modern Social Media Automation and Profiling Tool with Independent Modules",
    long_description=long_description,
    long_description_content_type="text/markdown",
    include_package_data=True,
    url='https://github.com/x31337/Profil3r',
    project_urls={
        "Bug Tracker": "https://github.com/x31337/Profil3r/issues",
        "Documentation": "https://github.com/x31337/Profil3r/blob/main/README_v2.md",
        "Source Code": "https://github.com/x31337/Profil3r",
    },
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Information Technology",
        "Intended Audience :: System Administrators",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Internet",
        "Topic :: Security",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: System :: Networking",
    ],
    keywords="osint social-media automation profiling reconnaissance security",
    python_requires=">=3.7",
    license='MIT',
    entry_points={
        "console_scripts": [
            "profil3r=profil3r.core:main",
            "profil3r-launcher=launcher:main",
        ],
    },
)
