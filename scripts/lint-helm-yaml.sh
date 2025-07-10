#!/bin/bash
set -e
helm template helm/profil3r | yamllint -
