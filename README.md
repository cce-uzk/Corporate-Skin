# ILIAS Skin Development Guide

This document explains how to set up a **private style repository for ILIAS** based on the public [ILIAS Delos repository](https://github.com/ILIAS-eLearning/delos), and how to create and maintain custom skins.

---

## A. Code Versioning

We maintain a **private repository** that tracks the public Delos repo as an **upstream remote**.
Our changes (corporate design, custom skins) are applied in our own branches.

### Initial Setup

```bash
# 1) Clone your private, empty repository
cd C:\Users\####\git
git clone https://github.com/cce-uzk/Corporate-Skin.git
cd Corporate-Skin

# 2) Add the public Delos repository as upstream (HTTPS, no auth required)
git remote add upstream https://github.com/ILIAS-eLearning/delos.git
git fetch upstream

# 3) Create a clean base branch (no local changes here!)
git switch -c release_9-uzk --track upstream/release_9
git push -u origin release_9-uzk
```

### Updating with changes from Delos

Use `git merge` (not `git rebase`) — our branch contains merge commits that make rebase error-prone.

```bash
git fetch upstream
git switch release_9-uzk
git merge upstream/release_9
```

**Resolving conflicts:**

Template files we intentionally removed from our skin may cause `modify/delete` conflicts if upstream updated them. Keep our deletion:

```bash
git rm <conflicted-file>
```

Template files added by upstream that we do not want to override should also be removed before committing:

```bash
git rm <unwanted-upstream-template>
```

After resolving all conflicts, complete the merge:

```bash
git commit
```

Then recompile the skins (see Section B) and push:

```bash
git push
```

---

## B. ILIAS Skins

### Initial Setup

Each skin is defined in a `template.xml`.

Example: a corporate skin with ID `uoc` and three sub-skins (`skin_learning`, `skin_assessment`, `skin_edulabs`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<template xmlns="http://www.w3.org" version="$Id$" id="uoc" name="University of Cologne">
    <style name="Learning Style"
           id="skin_learning"
           image_directory="images"
           font_directory="fonts"
           css_file="skin_learning" />

    <style name="Assessment Style"
           id="skin_assessment"
           image_directory="images"
           font_directory="fonts"
           css_file="skin_assessment" />

    <style name="EduLabs Style"
           id="skin_edulabs"
           image_directory="images"
           font_directory="fonts"
           css_file="skin_edulabs" />
</template>
```

### SCSS Structure

* For the **main skin** (`uoc`), create a SCSS file `uoc.scss` based on `delos.scss`.
* For each **sub-skin**, create a directory named after the `id` (e.g., `skin_learning/`) and place a corresponding SCSS file inside (e.g., `skin_learning.scss`).
* Sub-skins import from `uoc.scss` via `@use "../uoc"` and override variables as needed.

### Compilation

Compile SCSS to CSS using [Sass](https://sass-lang.com/).
All commands are run from the **repository root**. Compile the main skin first, then the sub-skins:

```bash
sass uoc.scss uoc.css --no-source-map
sass skin_learning/skin_learning.scss skin_learning/skin_learning.css --no-source-map
sass skin_assessment/skin_assessment.scss skin_assessment/skin_assessment.css --no-source-map
sass skin_edulabs/skin_edulabs.scss skin_edulabs/skin_edulabs.css --no-source-map
```

### Migrating to a new ILIAS major version

Each ILIAS major version gets its own branch, tracking the corresponding upstream branch:

```bash
git fetch upstream
git switch -c release_10-uzk --track upstream/release_10
git push -u origin release_10-uzk
```

**Note:** The Delos SCSS structure may change between major versions and require manual adaptation before the skin compiles correctly. As of ILIAS 10, the delos SCSS files moved into a `delos/` subdirectory. This means import paths in `uoc.scss` and the sub-skin `@use "../uoc"` references must be reviewed and updated when setting up a new version branch.

Once adapted, the regular update workflow (fetch → merge → recompile → push) applies identically to the new branch.

---

# Deploying `uoc` to ILIAS

## First deployment (clone once)

```bash
# 0) Optional: use SSH + a read-only deploy key for private repos
# git@github.com:cce-uzk/Corporate-Skin.git

cd <ILIAS_ROOT>/Customizing/global/skin/

# 1) Clone into expected skin id folder name
git clone https://github.com/cce-uzk/Corporate-Skin.git uoc
cd uoc

# 2) Check out the branch matching your ILIAS version
# Example for ILIAS 9:
git checkout release_9-uzk

# 3) (Optional) make the webserver own the files
#    adjust user:group as needed
chown -R www-data:www-data .
```

## Maintenance (pull latest changes)

```bash
cd <ILIAS_ROOT>/Customizing/global/skin/uoc
git pull --ff-only
```

### Switching ILIAS versions later

```bash
# switch the skin folder to a different branch
cd <ILIAS_ROOT>/Customizing/global/skin/uoc
git fetch --all --tags
git checkout release_10-uzk   # example
git pull --ff-only
```
