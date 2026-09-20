# Upload the complete project safely

Target branch: `fix/full-project-buildable`

## From Android with Termux

1. Install Git and unzip:

   ```bash
   pkg update
   pkg install git unzip
   ```

2. Clone the repository and create the branch:

   ```bash
   git clone https://github.com/ziko1/LoadFinder.git
   cd LoadFinder
   git switch -c fix/full-project-buildable origin/main
   ```

3. Extract the supplied ZIP into the cloned `LoadFinder` folder. Preserve the
   existing `.git` folder and `LICENSE` file.

4. Review and push:

   ```bash
   git status
   git add -A
   git commit -m "feat: add complete buildable LoadFinder project"
   git push -u origin fix/full-project-buildable
   ```

5. Open GitHub, create a pull request from `fix/full-project-buildable` to
   `main`, and merge only after all GitHub Actions checks are green.

Do not upload `.env`, `local.properties`, API keys, access tokens, keystores,
`node_modules`, `dist`, or `build` directories.
