/**
 * Finds and optionally optimizes large JPG images in src/img/ (non-recursive).
 *
 * Prerequisites (sharp is not in package.json to avoid build issues):
 *   npm install sharp
 *
 * Run:
 *   npx tsx scripts/findLargestImages.ts           # Dry run (default)
 *   npx tsx scripts/findLargestImages.ts --dry-run # Explicit dry run
 *   npx tsx scripts/findLargestImages.ts --run     # Actually resize images
 *
 * Cleanup (optional, to remove sharp after use):
 *   npm uninstall sharp
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const imgDir = path.join(repoRoot, "src/img");

const MAX_DIMENSION = 500;
const JPEG_QUALITY = 85;

interface ImageInfo {
    name: string;
    size: number;
    path: string;
    width?: number;
    height?: number;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function getImageDimensions(filePath: string): Promise<{ width: number; height: number } | null> {
    try {
        const metadata = await sharp(filePath).metadata();
        return { width: metadata.width ?? 0, height: metadata.height ?? 0 };
    } catch {
        return null;
    }
}

async function resizeImage(filePath: string, dryRun: boolean): Promise<{ 
    oldSize: number; 
    newSize: number; 
    oldDimensions: { width: number; height: number };
    newDimensions: { width: number; height: number };
} | null> {
    const stats = fs.statSync(filePath);
    const oldSize = stats.size;
    
    const metadata = await sharp(filePath).metadata();
    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;
    
    // Skip if already within bounds
    if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
        return null;
    }
    
    // Calculate new dimensions maintaining aspect ratio
    let newWidth: number;
    let newHeight: number;
    
    if (width > height) {
        newWidth = MAX_DIMENSION;
        newHeight = Math.round((height / width) * MAX_DIMENSION);
    } else {
        newHeight = MAX_DIMENSION;
        newWidth = Math.round((width / height) * MAX_DIMENSION);
    }
    
    if (dryRun) {
        // Estimate new size by processing to buffer
        const buffer = await sharp(filePath)
            .resize(newWidth, newHeight, { fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: JPEG_QUALITY })
            .toBuffer();
        
        return {
            oldSize,
            newSize: buffer.length,
            oldDimensions: { width, height },
            newDimensions: { width: newWidth, height: newHeight },
        };
    } else {
        // Actually resize and save
        const tempPath = filePath + ".tmp";
        
        await sharp(filePath)
            .resize(newWidth, newHeight, { fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: JPEG_QUALITY })
            .toFile(tempPath);
        
        // Replace original with resized version
        fs.unlinkSync(filePath);
        fs.renameSync(tempPath, filePath);
        
        const newStats = fs.statSync(filePath);
        
        return {
            oldSize,
            newSize: newStats.size,
            oldDimensions: { width, height },
            newDimensions: { width: newWidth, height: newHeight },
        };
    }
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = !args.includes("--run");
    
    if (dryRun) {
        console.log(chalk.yellow("\n🔍 DRY RUN MODE - No files will be modified"));
        console.log(chalk.gray("   Use --run to actually resize images\n"));
    } else {
        console.log(chalk.red("\n⚠️  LIVE MODE - Files will be modified!\n"));
    }
    
    // Read only top-level files (non-recursive)
    const files = fs.readdirSync(imgDir, { withFileTypes: true });
    
    const jpgImages: ImageInfo[] = [];
    
    for (const file of files) {
        if (file.isDirectory()) continue;
        if (!file.name.toLowerCase().endsWith(".jpg")) continue;
        
        const filePath = path.join(imgDir, file.name);
        const stats = fs.statSync(filePath);
        const dimensions = await getImageDimensions(filePath);
        
        jpgImages.push({
            name: file.name,
            size: stats.size,
            path: filePath,
            width: dimensions?.width,
            height: dimensions?.height,
        });
    }
    
    // Sort by size descending
    jpgImages.sort((a, b) => b.size - a.size);
    
    console.log(chalk.blue(`Found ${jpgImages.length} JPG files in src/img/\n`));
    
    // Find images that need resizing (larger than 500x500)
    const needsResize = jpgImages.filter(img => 
        (img.width && img.width > MAX_DIMENSION) || (img.height && img.height > MAX_DIMENSION)
    );
    
    console.log(chalk.yellow(`📐 ${needsResize.length} images exceed ${MAX_DIMENSION}x${MAX_DIMENSION}:\n`));
    
    if (needsResize.length === 0) {
        console.log(chalk.green("✅ All images are already within size limits!"));
        return;
    }
    
    console.log(chalk.gray("─".repeat(80)));
    console.log(
        chalk.gray(
            `${"#".padStart(3)}  ${"File".padEnd(35)}  ${"Dimensions".padEnd(15)}  ${"Size".padStart(12)}  ${"→ New Size".padStart(12)}`
        )
    );
    console.log(chalk.gray("─".repeat(80)));
    
    let totalOldSize = 0;
    let totalNewSize = 0;
    let processedCount = 0;
    
    for (let i = 0; i < needsResize.length; i++) {
        const img = needsResize[i];
        const rank = String(i + 1).padStart(3, " ");
        const dims = `${img.width}x${img.height}`.padEnd(15);
        const size = formatBytes(img.size).padStart(12);
        
        try {
            const result = await resizeImage(img.path, dryRun);
            
            if (result) {
                totalOldSize += result.oldSize;
                totalNewSize += result.newSize;
                processedCount++;
                
                const newSize = formatBytes(result.newSize).padStart(12);
                const savings = ((1 - result.newSize / result.oldSize) * 100).toFixed(0);
                const newDims = `${result.newDimensions.width}x${result.newDimensions.height}`;
                
                console.log(
                    `${chalk.cyan(rank)}  ${img.name.padEnd(35).slice(0, 35)}  ${dims}  ${size}  ${chalk.green(newSize)} ${chalk.gray(`(-${savings}%)`)} → ${newDims}`
                );
            }
        } catch (err) {
            console.log(
                `${chalk.red(rank)}  ${img.name.padEnd(35).slice(0, 35)}  ${dims}  ${size}  ${chalk.red("ERROR")}`
            );
        }
    }
    
    console.log(chalk.gray("─".repeat(80)));
    
    // Summary
    const savedBytes = totalOldSize - totalNewSize;
    const savedPercent = totalOldSize > 0 ? ((savedBytes / totalOldSize) * 100).toFixed(1) : 0;
    
    console.log(`\n${chalk.blue("Summary:")}`);
    console.log(`  Images ${dryRun ? "to process" : "processed"}: ${processedCount}`);
    console.log(`  Original size:  ${formatBytes(totalOldSize)}`);
    console.log(`  New size:       ${formatBytes(totalNewSize)}`);
    console.log(`  Space ${dryRun ? "savings" : "saved"}:  ${chalk.green(formatBytes(savedBytes))} (${savedPercent}%)`);
    
    if (dryRun) {
        console.log(chalk.yellow(`\n💡 Run with --run to apply these changes`));
    } else {
        console.log(chalk.green(`\n✅ Successfully resized ${processedCount} images!`));
    }
}

main().catch(console.error);
