import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function restoreTable(tableName: string, data: any[]) {
  console.log(`📊 Restoring table: ${tableName} (${data.length} records)`);
  
  try {
    // Clear existing data (optional - be careful!)
    // const { error: deleteError } = await supabase
    //   .from(tableName)
    //   .delete()
    //   .neq('id', 0); // Delete all records
    
    // Insert data in batches
    const batchSize = 100;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from(tableName)
        .insert(batch);
      
      if (error) {
        console.error(`❌ Error inserting batch ${i}-${i + batchSize} for ${tableName}:`, error.message);
        return false;
      }
    }
    
    console.log(`✅ ${tableName}: ${data.length} records restored`);
    return true;
  } catch (err) {
    console.error(`❌ Exception restoring ${tableName}:`, err);
    return false;
  }
}

async function restoreBackup(backupFile: string) {
  console.log('🔄 Starting Supabase data restore...');
  console.log(`📄 Backup file: ${backupFile}`);
  
  if (!fs.existsSync(backupFile)) {
    console.error('❌ Backup file not found:', backupFile);
    return false;
  }
  
  try {
    const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    console.log('🔍 Backup info:');
    console.log(`📅 Backup timestamp: ${backup.metadata.timestamp}`);
    console.log(`📊 Total tables: ${backup.metadata.totalTables}`);
    console.log(`📊 Total records: ${backup.metadata.totalRecords}`);
    
    // Restore each table
    let successCount = 0;
    let totalCount = 0;
    
    for (const [tableName, data] of Object.entries(backup.data)) {
      totalCount++;
      const success = await restoreTable(tableName, data as any[]);
      if (success) successCount++;
    }
    
    console.log(`\n✅ Restore completed: ${successCount}/${totalCount} tables restored`);
    
    if (successCount === totalCount) {
      console.log('🎉 All tables restored successfully!');
      return true;
    } else {
      console.log('⚠️  Some tables failed to restore');
      return false;
    }
    
  } catch (err) {
    console.error('❌ Restore process failed:', err);
    return false;
  }
}

// Main execution
async function main() {
  const backupFile = process.argv[2];
  
  if (!backupFile) {
    console.error('❌ Please provide backup file path');
    console.error('Usage: node restore_backup.js <backup-file>');
    process.exit(1);
  }
  
  const success = await restoreBackup(backupFile);
  
  if (success) {
    console.log('\n🛡️  Data restore completed successfully!');
  } else {
    console.log('\n❌ Data restore failed');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { restoreBackup };
