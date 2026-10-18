$ErrorActionPreference = 'Stop'
if ($PSScriptRoot -notmatch '^\\\\wsl(?:\.localhost|\$)\\([^\\]+)(\\.*)$') {
    throw 'Open this launcher from the project folder in WSL.'
}
$distro = $Matches[1]
$linuxPath = $Matches[2].Replace('\', '/')
wsl.exe -d $distro --cd $linuxPath -- bash scripts/start-local.sh
exit $LASTEXITCODE
