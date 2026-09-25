# Faza — Arc Mainnet deploy script (Windows PowerShell)
# Usage: $env:PRIVATE_KEY="0x..."; .\scripts\deploy-mainnet.ps1

param()

$ErrorActionPreference = "Stop"

$RPC = "https://rpc.mainnet.arc.io"
$EXPLORER = "https://explorer.arc.io"

if (-not $env:PRIVATE_KEY) {
    Write-Error "PRIVATE_KEY is not set. Run: `$env:PRIVATE_KEY='0x...'"
    exit 1
}

Write-Host "Compiling contracts..." -ForegroundColor Cyan
forge build --via-ir
if ($LASTEXITCODE -ne 0) {
    Write-Error "forge build failed."
    exit 1
}

Write-Host ""
Write-Host "Deploying FazaBond to Arc Mainnet..." -ForegroundColor Cyan
$bondOut = forge create contracts/FazaBond.sol:FazaBond `
    --rpc-url $RPC `
    --private-key $env:PRIVATE_KEY `
    --via-ir `
    2>&1

$bondLine = $bondOut | Select-String "Deployed to:"
if (-not $bondLine) {
    Write-Error "FazaBond deploy failed:`n$bondOut"
    exit 1
}
$BOND_ADDR = ($bondLine -split "Deployed to: ")[1].Trim()
Write-Host "FazaBond deployed: $BOND_ADDR" -ForegroundColor Green

Write-Host ""
Write-Host "Deploying FazaOTC to Arc Mainnet..." -ForegroundColor Cyan
$otcOut = forge create contracts/FazaOTC.sol:FazaOTC `
    --rpc-url $RPC `
    --private-key $env:PRIVATE_KEY `
    --via-ir `
    2>&1

$otcLine = $otcOut | Select-String "Deployed to:"
if (-not $otcLine) {
    Write-Error "FazaOTC deploy failed:`n$otcOut"
    exit 1
}
$OTC_ADDR = ($otcLine -split "Deployed to: ")[1].Trim()
Write-Host "FazaOTC deployed: $OTC_ADDR" -ForegroundColor Green

Write-Host ""
Write-Host "Verifying USDC address on both contracts..." -ForegroundColor Cyan
$bondUsdc = cast call $BOND_ADDR "USDC()(address)" --rpc-url $RPC 2>&1
$otcUsdc = cast call $OTC_ADDR "USDC()(address)" --rpc-url $RPC 2>&1
Write-Host "FazaBond.USDC() = $bondUsdc"
Write-Host "FazaOTC.USDC()  = $otcUsdc"

$expected = "0x3600000000000000000000000000000000000000"
if ($bondUsdc.Trim().ToLower() -ne $expected -or $otcUsdc.Trim().ToLower() -ne $expected) {
    Write-Warning "USDC address mismatch. Verify manually before wiring frontend."
}

Write-Host ""
Write-Host "Explorer links:" -ForegroundColor Cyan
Write-Host "  FazaBond : $EXPLORER/address/$BOND_ADDR"
Write-Host "  FazaOTC  : $EXPLORER/address/$OTC_ADDR"

Write-Host ""
Write-Host "Vercel environment variables:" -ForegroundColor Yellow
Write-Host "  NEXT_PUBLIC_MAINNET_FAZABOND_ADDRESS=$BOND_ADDR"
Write-Host "  NEXT_PUBLIC_MAINNET_FAZAOTC_ADDRESS=$OTC_ADDR"

Write-Host ""
Write-Host "Done. Add those two env vars to Vercel and redeploy." -ForegroundColor Green
