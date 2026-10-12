param(
    [string]$RepositoryUrl = "https://github.com/PrakrutiTank/website-with-tests.git",
    [string]$Destination = "website-with-tests",
    [switch]$Clone
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "Git is required. Install Git and run this script again."
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "Node.js and npm are required. Install them and run this script again."
}

$projectPath = (Get-Location).Path
if ($Clone -or -not (Test-Path -LiteralPath (Join-Path $projectPath "package.json"))) {
    if (Test-Path -LiteralPath $Destination) {
        throw "Destination '$Destination' already exists. Choose another destination or move the existing folder."
    }

    git clone $RepositoryUrl $Destination
    if ($LASTEXITCODE -ne 0) {
        throw "Could not clone '$RepositoryUrl'. Check the URL and your GitHub access."
    }

    $projectPath = Join-Path $projectPath $Destination
}

$packagePath = Join-Path $projectPath "package.json"
if (-not (Test-Path -LiteralPath $packagePath)) {
    throw "The cloned repository does not contain package.json. Add the project files to the repository before running this script."
}

$package = Get-Content -LiteralPath $packagePath -Raw | ConvertFrom-Json
if (-not $package.scripts.test) {
    throw "package.json does not define an npm 'test' script."
}
if (-not $package.scripts.dev) {
    throw "package.json does not define an npm 'dev' script."
}

Push-Location $projectPath
try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed."
    }

    npm test
    if ($LASTEXITCODE -ne 0) {
        throw "npm test failed."
    }

    npm run dev
    if ($LASTEXITCODE -ne 0) {
        throw "npm run dev failed."
    }
}
finally {
    Pop-Location
}
